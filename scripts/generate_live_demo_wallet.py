"""
Generate a testnet wallet for live demos. Writes secrets to local/ (gitignored).

Usage (from repo root):
  pip install -e .
  python scripts/generate_live_demo_wallet.py
"""

from __future__ import annotations

import asyncio
import base64
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from algopay import AlgoPay  # noqa: E402
from algopay.core.types import Network  # noqa: E402


async def main() -> None:
    out_dir = ROOT / "local"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "live_demo_wallet.json"

    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("live-demo-auto")
    w = await client.create_wallet(wallet_set_id=ws.id)
    rec = client.wallet.repository.get_wallet(w.id)
    if not rec:
        raise RuntimeError("wallet record missing")

    payload = {
        "network": Network.ALGORAND_TESTNET.value,
        "address": w.address,
        "wallet_id": w.id,
        "wallet_set_id": ws.id,
        "private_key_base64": base64.b64encode(rec.private_key).decode("ascii"),
        "usdc_asa_id_testnet": Network.ALGORAND_TESTNET.usdc_asa_id(),
        "next_steps": [
            "Fund address with testnet ALGO: https://bank.testnet.algorand.network/",
            "Opt in to USDC: wallet.opt_in_usdc(wallet_id) via a short script using this file",
            "Obtain testnet USDC (ASA above) via a faucet or dev tap",
            "x402 demo: ALGOPAY_X402_URL=https://x402.goplausible.xyz/examples/weather",
        ],
    }
    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    print("Wrote:", out_path)
    print("Address (fund this):", w.address)
    print("wallet_id:", w.id)
    print("USDC ASA (testnet):", payload["usdc_asa_id_testnet"])
    print("Private key is ONLY in the JSON file — do not commit local/.")


if __name__ == "__main__":
    asyncio.run(main())
