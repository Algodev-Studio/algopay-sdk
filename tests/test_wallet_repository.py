from algopay.core.types import Network
from algopay.wallet.repository import WalletRepository


def test_create_wallet_roundtrip():
    repo = WalletRepository()
    ws = repo.create_wallet_set("t")
    caip2 = Network.ALGORAND_TESTNET.to_caip2()
    rec = repo.create_wallet(ws.id, caip2)
    assert len(rec.address) == 58
    assert repo.get_wallet(rec.id) is not None


def test_register_wallet_restores_known_key():
    repo = WalletRepository()
    ws = repo.create_wallet_set("base")
    orig = repo.create_wallet(ws.id, Network.ALGORAND_TESTNET.to_caip2())
    key = orig.private_key
    addr = orig.address
    repo2 = WalletRepository()
    imported = repo2.register_wallet(
        wallet_set_id=ws.id,
        wallet_id=orig.id,
        address=addr,
        private_key=key,
        network_caip2=Network.ALGORAND_TESTNET.to_caip2(),
    )
    assert imported.address == addr
    assert repo2.get_private_key(orig.id) == key
