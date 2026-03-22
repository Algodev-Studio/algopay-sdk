"""Pytest fixtures."""

from __future__ import annotations

import pytest

from algopay.core.config import Config
from algopay.core.types import Network


@pytest.fixture
def test_config() -> Config:
    return Config.from_env(network=Network.ALGORAND_TESTNET)
