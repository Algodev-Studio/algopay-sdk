import asyncio
from decimal import Decimal

from algopay.core.config import Config
from algopay.core.types import Network
from algopay.protocols.transfer import TransferAdapter
from algopay.protocols.x402 import X402Adapter
from algopay.wallet.service import WalletService


def _cfg():
    return Config.from_env(network=Network.ALGORAND_TESTNET)


def test_transfer_supports_algorand_address():
    from algopay.wallet.repository import WalletRepository

    repo = WalletRepository()
    ws_meta = repo.create_wallet_set("x")
    rec = repo.create_wallet(ws_meta.id, Network.ALGORAND_TESTNET.to_caip2())
    ws = WalletService(_cfg())
    ad = TransferAdapter(_cfg(), ws)
    assert ad.supports(rec.address)
    assert not ad.supports("0x1234")
    assert not ad.supports("https://example.com")


def test_x402_supports_url():
    ws = WalletService(_cfg())
    x = X402Adapter(_cfg(), ws)
    assert x.supports("https://pay.example.com/resource")
    assert not x.supports("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ")


def test_transfer_simulate_invalid_address():
    ws = WalletService(_cfg())
    ad = TransferAdapter(_cfg(), ws)

    async def run():
        r = await ad.simulate("w1", "bad", Decimal("1"))
        assert r["would_succeed"] is False

    asyncio.run(run())
