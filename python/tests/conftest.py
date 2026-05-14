"""Pytest fixtures."""

from __future__ import annotations

import pytest
from algosdk import account

from algopay.core.config import Config
from algopay.core.types import Network


@pytest.fixture
def test_config() -> Config:
    return Config.from_env(network=Network.ALGORAND_TESTNET)


@pytest.fixture
def valid_algorand_address() -> str:
    _, addr = account.generate_account()
    return addr


@pytest.fixture
def second_algorand_address() -> str:
    _, addr = account.generate_account()
    return addr
