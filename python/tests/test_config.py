"""Config.from_env and Config helpers."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from algopay.core.config import Config
from algopay.core.types import Network


def test_config_defaults_testnet():
    c = Config.from_env(network=Network.ALGORAND_TESTNET)
    assert "testnet" in c.algod_url.lower()
    assert "testnet" in c.indexer_url.lower()
    assert c.usdc_asa_id == Network.ALGORAND_TESTNET.usdc_asa_id()
    assert c.storage_backend == "memory"
    assert c.redis_url is None
    assert c.log_level == "INFO"
    assert c.env == "development"


def test_config_mainnet_defaults_urls():
    c = Config.from_env(network=Network.ALGORAND_MAINNET)
    assert "mainnet" in c.algod_url.lower()
    assert c.usdc_asa_id == Network.ALGORAND_MAINNET.usdc_asa_id()


def test_config_env_overrides():
    env = {
        "ALGOPAY_NETWORK": "algorand-testnet",
        "ALGOD_URL": "https://custom-algod.example",
        "INDEXER_URL": "https://custom-idx.example",
        "ALGOPAY_USDC_ASA_ID": "12345",
        "ALGOPAY_STORAGE_BACKEND": "memory",
        "ALGOPAY_LOG_LEVEL": "DEBUG",
        "ALGOPAY_DEFAULT_WALLET": "w-default",
        "ALGOPAY_ENV": "staging",
    }
    with patch.dict("os.environ", env, clear=False):
        c = Config.from_env()
    assert c.algod_url == "https://custom-algod.example"
    assert c.indexer_url == "https://custom-idx.example"
    assert c.usdc_asa_id == 12345
    assert c.log_level == "DEBUG"
    assert c.default_wallet_id == "w-default"
    assert c.env == "staging"


def test_config_algod_alias():
    with patch.dict(
        "os.environ",
        {"ALGOPAY_ALGOD_URL": "https://alias-algod.test", "ALGOPAY_INDEXER_URL": "https://alias-idx.test"},
        clear=True,
    ):
        c = Config.from_env(network=Network.ALGORAND_TESTNET)
    assert c.algod_url == "https://alias-algod.test"
    assert c.indexer_url == "https://alias-idx.test"


def test_config_invalid_usdc_asa_id_raises():
    with (
        patch.dict("os.environ", {"ALGOPAY_USDC_ASA_ID": "not-an-int"}, clear=False),
        pytest.raises(ValueError),
    ):
        Config.from_env(network=Network.ALGORAND_TESTNET)


def test_config_with_updates():
    c = Config.from_env(network=Network.ALGORAND_TESTNET)
    c2 = c.with_updates(log_level="WARNING", usdc_asa_id=999)
    assert c2.log_level == "WARNING"
    assert c2.usdc_asa_id == 999
    assert c.log_level == "INFO"
