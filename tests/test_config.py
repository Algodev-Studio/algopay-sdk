from algopay.core.config import Config
from algopay.core.types import Network


def test_config_defaults_testnet():
    c = Config.from_env(network=Network.ALGORAND_TESTNET)
    assert "testnet" in c.algod_url.lower()
    assert c.usdc_asa_id > 0


def test_network_to_caip2():
    assert Network.ALGORAND_MAINNET.to_caip2().startswith("algorand:")
