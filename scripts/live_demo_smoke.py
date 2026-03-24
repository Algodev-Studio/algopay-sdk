"""
Live testnet smoke: load local/live_demo_wallet.json, check chain + USDC, optional x402 pay.

Prerequisites:
  - Wallet funded with testnet ALGO + USDC (and opted in to USDC ASA).

Usage (repo root):
  pip install -e .
  python scripts/live_demo_smoke.py

Optional env:
  ALGOPAY_X402_URL   default: https://x402.goplausible.xyz/examples/weather
  ALGOPAY_MAX_USDC   default: 1.0
  SKIP_X402=1        skip x402 pay step
  OPT_IN_USDC=1      submit USDC opt-in tx (needs ALGO for fee)
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from algopay import AlgoPay  # noqa: E402
from algopay.core.types import Network  # noqa: E402


def _load_demo_wallet() -> dict:
    path = ROOT / "local" / "live_demo_wallet.json"
    if not path.is_file():
        raise SystemExit(f"Missing {path} — run scripts/generate_live_demo_wallet.py first.")
    return json.loads(path.read_text(encoding="utf-8"))


async def main() -> None:
    data = _load_demo_wallet()
    sk = base64.b64decode(data["private_key_base64"])
    if len(sk) != 64:
        raise SystemExit("private_key_base64 must decode to 64 bytes")

    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    client.wallet.repository.register_wallet(
        wallet_set_id=data["wallet_set_id"],
        wallet_id=data["wallet_id"],
        address=data["address"],
        private_key=sk,
        network_caip2=Network.ALGORAND_TESTNET.to_caip2(),
        name="live-demo-restored",
    )
    wid = data["wallet_id"]
    addr = data["address"]

    print("Restored wallet:", addr)
    print("wallet_id:", wid)

    # Algod reachable
    sp = client._chain.suggested_params()  # type: ignore[attr-defined]
    print("Algod OK, suggested first round:", getattr(sp, "first", "?"))

    info = client._chain.account_info(addr)  # type: ignore[attr-defined]
    assets = info.get("assets") or []
    print("On-chain ASA holdings:", len(assets))
    for a in assets[:8]:
        print("  asset-id", a.get("asset-id"), "amount", a.get("amount"))
    if len(assets) > 8:
        print("  ...")

    if os.environ.get("OPT_IN_USDC") == "1":
        txid = client.wallet.opt_in_usdc(wid)
        print("Opt-in USDC tx submitted:", txid)

    bal = await client.get_balance(wid)
    print("USDC balance (SDK):", bal)

    if os.environ.get("SKIP_X402") == "1":
        print("SKIP_X402=1 — skipping x402 pay.")
        return

    url = os.environ.get(
        "ALGOPAY_X402_URL",
        "https://x402.goplausible.xyz/examples/weather",
    )
    max_usdc = os.environ.get("ALGOPAY_MAX_USDC", "1.0")
    print("x402 GET:", url, "max USDC:", max_usdc)
    result = await client.pay(wid, url, max_usdc, skip_guards=True)
    print("pay success:", result.success)
    print("status:", result.status, "error:", result.error)
    if result.resource_data is not None:
        print("resource:", result.resource_data)


if __name__ == "__main__":
    asyncio.run(main())
