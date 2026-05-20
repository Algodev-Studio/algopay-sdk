"""
Live testnet demo: restore local/live_demo_wallet.json, optionally opt-in USDC,
submit one USDC transfer (self-payment), print explorer link(s).

Designed for recordings — minimal output, at least one verifiable tx when funded.

Prerequisites:
  1. python python/scripts/generate_live_demo_wallet.py
  2. Fund ALGO (https://bank.testnet.algorand.network/)
  3. OPT_IN_USDC=1 python python/scripts/live_demo_tx.py  (once)
  4. Fund testnet USDC on the wallet address

Usage:
  pip install -e "./python[dev]"
  python python/scripts/live_demo_tx.py              # transfer + optional x402
  python python/scripts/live_demo_tx.py --check-only # no chain tx
  python python/scripts/live_demo_tx.py --transfer-only
  python python/scripts/live_demo_tx.py --x402-only

Env:
  OPT_IN_USDC=1          opt-in to USDC ASA before transfer
  ALGOPAY_TRANSFER_AMOUNT  default 0.02
  ALGOPAY_X402_URL       default GoPlausible weather
  ALGOPAY_MAX_USDC       default 0.5 (x402 cap)
  SKIP_X402=1            skip x402 step
"""

from __future__ import annotations

import argparse
import asyncio
import base64
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
sys.path.insert(0, str(ROOT / "src"))

from algopay import AlgoPay  # noqa: E402
from algopay.core.types import Network  # noqa: E402

TESTNET_EXPLORER_TX = "https://testnet.explorer.perawallet.app/tx"


def explorer_url(tx_id: str) -> str:
    return f"{TESTNET_EXPLORER_TX}/{tx_id}"


def _load_demo_wallet() -> dict:
    path = REPO_ROOT / "local" / "live_demo_wallet.json"
    if not path.is_file():
        raise SystemExit(
            f"Missing {path}\n"
            "Run: python python/scripts/generate_live_demo_wallet.py"
        )
    return json.loads(path.read_text(encoding="utf-8"))


def _restore_client(data: dict) -> tuple[AlgoPay, str, str]:
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
    return client, data["wallet_id"], data["address"]


def _print_tx(label: str, tx_id: str | None) -> None:
    if not tx_id:
        print(f"{label}: (no tx id)")
        return
    print(f"{label}: {tx_id}")
    print(f"Explorer: {explorer_url(tx_id)}")


async def run_check(client: AlgoPay, wid: str, addr: str) -> None:
    print("=== Demo wallet (check only) ===")
    print("Address:", addr)
    print("wallet_id:", wid)
    sp = client._chain.suggested_params()  # type: ignore[attr-defined]
    print("Algod OK, first round:", getattr(sp, "first", "?"))
    bal = await client.get_balance(wid)
    print("USDC balance:", bal)
    info = client._chain.account_info(addr)  # type: ignore[attr-defined]
    print("Microalgos:", info.get("amount"))
    asa = info.get("assets") or []
    usdc_id = Network.ALGORAND_TESTNET.usdc_asa_id()
    held = [a for a in asa if a.get("asset-id") == usdc_id]
    if held:
        print(f"USDC ASA {usdc_id} opted in, raw amount:", held[0].get("amount"))
    else:
        print(f"USDC ASA {usdc_id}: not held — run with OPT_IN_USDC=1 after funding ALGO")


async def run_transfer(client: AlgoPay, wid: str, addr: str) -> str | None:
    amount = os.environ.get("ALGOPAY_TRANSFER_AMOUNT", "0.02")
    print("\n=== USDC transfer (self-payment) ===")
    print("Amount:", amount, "USDC →", addr)
    result = await client.pay(
        wid,
        addr,
        amount,
        purpose="live-demo",
        skip_guards=True,
        wait_for_completion=True,
        timeout_seconds=180.0,
    )
    print("success:", result.success, "status:", result.status)
    if result.error:
        print("error:", result.error)
    _print_tx("blockchain_tx", result.blockchain_tx)
    if not result.success:
        raise SystemExit(1)
    return result.blockchain_tx


async def run_x402(client: AlgoPay, wid: str) -> str | None:
    url = os.environ.get(
        "ALGOPAY_X402_URL",
        "https://x402.goplausible.xyz/examples/weather",
    )
    cap = os.environ.get("ALGOPAY_MAX_USDC", "0.5")
    print("\n=== x402 pay-per-call ===")
    print("URL:", url, "| max USDC:", cap)
    result = await client.pay(wid, url, cap, skip_guards=True)
    print("success:", result.success, "status:", result.status)
    if result.error:
        print("error:", result.error)
    _print_tx("blockchain_tx", result.blockchain_tx)
    if result.resource_data is not None:
        preview = result.resource_data
        if isinstance(preview, dict):
            preview = {k: preview[k] for k in list(preview)[:6]}
        text = str(preview)
        print("resource_data:", text[:400] + ("..." if len(text) > 400 else ""))
    return result.blockchain_tx


async def main() -> None:
    parser = argparse.ArgumentParser(description="AlgoPay live testnet demo tx")
    parser.add_argument("--check-only", action="store_true", help="No on-chain transactions")
    parser.add_argument("--transfer-only", action="store_true", help="Only USDC self-transfer")
    parser.add_argument("--x402-only", action="store_true", help="Only x402 payment")
    args = parser.parse_args()

    data = _load_demo_wallet()
    client, wid, addr = _restore_client(data)

    if args.check_only:
        await run_check(client, wid, addr)
        return

    if os.environ.get("OPT_IN_USDC") == "1":
        print("=== Opt-in USDC ASA ===")
        txid = client.wallet.opt_in_usdc(wid)
        _print_tx("opt_in_tx", txid)
        print("Wait for confirmation, fund USDC, then re-run without OPT_IN_USDC=1.")
        return

    if not args.x402_only:
        await run_check(client, wid, addr)

    do_transfer = not args.x402_only
    do_x402 = not args.transfer_only and os.environ.get("SKIP_X402") != "1"

    if args.x402_only:
        do_transfer = False
        do_x402 = True

    primary_tx: str | None = None
    if do_transfer:
        primary_tx = await run_transfer(client, wid, addr)
    if do_x402:
        x402_tx = await run_x402(client, wid)
        if primary_tx is None:
            primary_tx = x402_tx

    print("\n=== Demo complete ===")
    if primary_tx:
        print("Primary link for your audience:")
        print(explorer_url(primary_tx))
    else:
        print("No transaction id returned — fund wallet and retry.")


if __name__ == "__main__":
    asyncio.run(main())
