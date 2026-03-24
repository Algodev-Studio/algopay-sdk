"""
Live testnet: exercise as much of the SDK as possible using local/live_demo_wallet.json.

Uses small USDC amounts via self-transfers (same wallet address) so the receiver is already opted into USDC.

Usage (repo root):
  pip install -e .
  python scripts/live_demo_exhaustive.py

Optional env:
  ALGOPAY_X402_URL     (default: GoPlausible weather)
  LIVE_SKIP_X402=1     skip x402 and batch-x402 steps
  LIVE_SKIP_TRANSFER=1 skip ASA transfer + intent + batch transfer + sync
  LIVE_SKIP_GUARDS=1   skip recipient-guard block test
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import sys
import traceback
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from algosdk import account  # noqa: E402

from algopay import AlgoPay  # noqa: E402
from algopay.core.types import Network, PaymentRequest, PaymentStatus  # noqa: E402


def _load_demo_wallet() -> dict:
    path = ROOT / "local" / "live_demo_wallet.json"
    if not path.is_file():
        raise SystemExit(f"Missing {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _hdr(title: str) -> None:
    print(f"\n{'=' * 64}\n{title}\n{'=' * 64}")


async def _run(name: str, fn) -> bool:
    _hdr(name)
    try:
        await fn()
        print("OK")
        return True
    except Exception as e:
        print("FAIL:", e)
        traceback.print_exc()
        return False


async def main() -> None:
    data = _load_demo_wallet()
    sk = base64.b64decode(data["private_key_base64"])
    if len(sk) != 64:
        raise SystemExit("invalid private key length")

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
    wset = data["wallet_set_id"]
    x402_url = os.environ.get(
        "ALGOPAY_X402_URL",
        "https://x402.goplausible.xyz/examples/weather",
    )

    results: list[tuple[str, bool]] = []

    async def t_wallet_info():
        w = await client.get_wallet(wid)
        print("address:", w.address, "set:", w.wallet_set_id)
        sets = await client.list_wallet_sets()
        print("wallet_sets:", len(sets))
        listed = await client.list_wallets(wset)
        print("wallets in set:", len(listed))

    results.append(("wallet CRUD wrappers", await _run("Wallet: get_wallet / list_*", t_wallet_info)))

    async def t_chain():
        sp = client._chain.suggested_params()  # type: ignore[attr-defined]
        print("first round:", getattr(sp, "first", "?"))
        info = client._chain.account_info(addr)  # type: ignore[attr-defined]
        print("microalgos:", info.get("amount"), "assets:", len(info.get("assets") or []))

    results.append(("Algod account_info", await _run("Algod: suggested_params + account_info", t_chain)))

    async def t_balance():
        b = await client.get_balance(wid)
        print("USDC balance:", b)
        if b < Decimal("0.15"):
            print("WARN: low USDC; some steps may fail.")

    results.append(("get_balance", await _run("get_balance (USDC)", t_balance)))

    async def t_tx_list():
        txs = await client.list_transactions(wid)
        print("indexer txs (sample):", len(txs))
        for t in txs[:3]:
            print(" ", t.id, t.state)

    results.append(("list_transactions", await _run("list_transactions", t_tx_list)))

    async def t_detect():
        print("can_pay(https):", client.can_pay(x402_url))
        print("detect https:", client.detect_method(x402_url))
        _, recv = account.generate_account()
        print("can_pay(addr):", client.can_pay(recv))
        print("detect addr:", client.detect_method(recv))

    results.append(("can_pay / detect_method", await _run("Router: can_pay + detect_method", t_detect)))

    async def t_simulate():
        s1 = await client.simulate(wid, addr, "0.01")
        print("simulate self-transfer:", s1.would_succeed, s1.reason)
        s2 = await client.simulate(wid, x402_url, "1.0")
        print("simulate x402:", s2.would_succeed, s2.reason)

    results.append(("simulate", await _run("simulate (transfer + x402)", t_simulate)))

    last_ledger_entry_id: str | None = None

    if os.environ.get("LIVE_SKIP_TRANSFER") != "1":

        async def t_pay_transfer():
            nonlocal last_ledger_entry_id
            print("micro self-transfer (0.02 USDC, same address):", addr)
            r = await client.pay(
                wid,
                addr,
                "0.02",
                skip_guards=True,
                wait_for_completion=True,
                timeout_seconds=180.0,
            )
            print("success:", r.success, "status:", r.status, "tx:", r.blockchain_tx, "err:", r.error)
            if not r.success:
                raise RuntimeError("transfer pay failed")
            rows = await client.ledger.query(wallet_id=wid, limit=5)
            if rows:
                last_ledger_entry_id = rows[0].id
                print("latest ledger entry:", last_ledger_entry_id, "tx_hash:", rows[0].tx_hash)

        results.append(("pay transfer", await _run("pay() USDC transfer (0.02)", t_pay_transfer)))

        if last_ledger_entry_id:

            async def t_sync():
                e = await client.sync_transaction(last_ledger_entry_id)
                print("synced status:", e.status, "tx_hash:", e.tx_hash)

            results.append(("sync_transaction", await _run("sync_transaction (ledger)", t_sync)))

    if os.environ.get("LIVE_SKIP_X402") != "1":

        async def t_x402():
            r = await client.pay(wid, x402_url, "0.5", skip_guards=True)
            print("success:", r.success, "err:", r.error)
            if r.resource_data is not None:
                print("resource keys:", list(r.resource_data.keys()) if isinstance(r.resource_data, dict) else type(r.resource_data))

        results.append(("pay x402", await _run("pay() x402", t_x402)))

        async def t_batch():
            reqs = [
                PaymentRequest(wallet_id=wid, recipient=addr, amount=Decimal("0.01")),
                PaymentRequest(wallet_id=wid, recipient=x402_url, amount=Decimal("0.5")),
            ]
            out = await client.batch_pay(reqs, concurrency=2)
            print("batch total:", out.total_count, "ok:", out.success_count, "fail:", out.failed_count)
            for i, pr in enumerate(out.results):
                print(f"  [{i}] success={pr.success} err={pr.error}")

        results.append(("batch_pay", await _run("batch_pay (transfer + x402)", t_batch)))

    async def t_intent():
        intent = await client.create_payment_intent(wid, addr, "0.02")
        print("intent:", intent.id, intent.status)
        got = await client.get_payment_intent(intent.id)
        assert got is not None
        res = await client.confirm_payment_intent(intent.id)
        print("confirm success:", res.success, res.error)
        intent2 = await client.create_payment_intent(wid, addr, "0.01")
        canceled = await client.cancel_payment_intent(intent2.id)
        print("canceled:", canceled.status)

    if os.environ.get("LIVE_SKIP_TRANSFER") != "1":
        results.append(("payment intents", await _run("intents: create / confirm / cancel", t_intent)))

    if os.environ.get("LIVE_SKIP_GUARDS") != "1":

        async def t_guards():
            _, allowed = account.generate_account()
            _, blocked = account.generate_account()
            await client.add_recipient_guard(
                wid,
                mode="whitelist",
                addresses=[allowed],
                name="live_whitelist",
            )
            await client.add_single_tx_guard(wid, max_amount="100.0", name="live_single")
            await client.add_budget_guard(wid, daily_limit="500.0", name="live_budget")
            names = await client.list_guards(wid)
            print("guards:", names)
            r = await client.pay(wid, blocked, "0.01", skip_guards=False)
            print("blocked pay success (expect False):", r.success, r.status, r.error)
            if r.success or r.status != PaymentStatus.BLOCKED:
                print("WARN: expected BLOCKED")
            await client.guards.remove_guard(wid, "live_whitelist")
            await client.guards.remove_guard(wid, "live_single")
            await client.guards.remove_guard(wid, "live_budget")
            names2 = await client.list_guards(wid)
            print("guards after cleanup:", names2)

        results.append(("guards", await _run("guards: recipient block + list + remove", t_guards)))

    _hdr("Summary")
    for name, ok in results:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
    failed = sum(1 for _, o in results if not o)
    if failed:
        raise SystemExit(f"{failed} section(s) failed")


if __name__ == "__main__":
    asyncio.run(main())
