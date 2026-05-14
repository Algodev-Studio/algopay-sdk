"""Optional live testnet checks (opt-in via env)."""

from __future__ import annotations

import os

import pytest

from algopay.core.algorand_client import AlgorandClient
from algopay.core.config import Config
from algopay.core.types import Network


@pytest.mark.integration
def test_testnet_algod_suggested_params_live():
    if os.environ.get("ALGOPAY_LIVE_TESTNET") != "1":
        pytest.skip("Set ALGOPAY_LIVE_TESTNET=1 to run live Algod smoke test")
    cfg = Config.from_env(network=Network.ALGORAND_TESTNET)
    client = AlgorandClient(cfg)
    sp = client.suggested_params()
    assert sp is not None
    assert getattr(sp, "first", None) is not None or sp is not None
