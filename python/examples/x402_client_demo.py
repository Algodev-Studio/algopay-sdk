"""
x402 client demo: pay for a URL that returns HTTP 402 (Algorand exact scheme).

Set:
  ALGOPAY_X402_URL=https://...   # resource that returns x402 V2 JSON body
  ALGOPAY_MAX_USDC=1.0          # max you allow the resource to charge
"""

from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from algopay import AlgoPay
from algopay.core.types import Network


async def main() -> None:
    url = os.environ.get("ALGOPAY_X402_URL")
    if not url:
        print("Set ALGOPAY_X402_URL to an x402-protected HTTPS URL.")
        return

    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = client.wallet.create_wallet_set("example-x402")
    w = client.wallet.create_wallet(ws.id)
    print("Wallet:", w.address, w.id)

    max_usdc = os.environ.get("ALGOPAY_MAX_USDC", "1.0")
    result = await client.pay(w.id, url, max_usdc)
    print("success:", result.success, "error:", result.error)
    if result.resource_data is not None:
        print("resource:", result.resource_data)


if __name__ == "__main__":
    asyncio.run(main())
