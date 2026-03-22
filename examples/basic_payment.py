"""
Create a wallet and (optionally) transfer USDC on Algorand testnet.

Prerequisites:
- Fund the new account with test ALGO (dispenser).
- Opt in to USDC ASA: wallet.opt_in_usdc(wallet_id)
- Acquire testnet USDC for the sender address.
"""

from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from algopay import AlgoPay
from algopay.core.types import Network


async def main() -> None:
    to_addr = os.environ.get("ALGOPAY_TO_ADDRESS")
    if not to_addr:
        print("Set ALGOPAY_TO_ADDRESS to a 58-char Algorand receiver address.")
        return

    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = client.wallet.create_wallet_set("example-basic")
    w = client.wallet.create_wallet(ws.id)
    print("New wallet:", w.address, "id=", w.id)
    print("Opt-in USDC then fund; then run pay.")
    amt = os.environ.get("ALGOPAY_AMOUNT", "0.01")
    result = await client.pay(w.id, to_addr, amt, wait_for_completion=True)
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
