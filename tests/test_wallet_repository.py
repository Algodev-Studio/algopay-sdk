from algopay.core.types import Network
from algopay.wallet.repository import WalletRepository


def test_create_wallet_roundtrip():
    repo = WalletRepository()
    ws = repo.create_wallet_set("t")
    caip2 = Network.ALGORAND_TESTNET.to_caip2()
    rec = repo.create_wallet(ws.id, caip2)
    assert len(rec.address) == 58
    assert repo.get_wallet(rec.id) is not None
