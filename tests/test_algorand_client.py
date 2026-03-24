"""AlgorandClient error mapping."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from algopay.core.algorand_client import AlgorandClient
from algopay.core.config import Config
from algopay.core.exceptions import NetworkError
from algopay.core.types import Network


def test_algorand_client_suggested_params_success():
    cfg = Config.from_env(network=Network.ALGORAND_TESTNET)
    client = AlgorandClient(cfg)
    mock_sp = object()
    with patch.object(client._algod, "suggested_params", return_value=mock_sp):
        assert client.suggested_params() is mock_sp


def test_algorand_client_suggested_params_wraps_error():
    cfg = Config.from_env(network=Network.ALGORAND_TESTNET)
    client = AlgorandClient(cfg)
    with (
        patch.object(client._algod, "suggested_params", side_effect=RuntimeError("down")),
        pytest.raises(NetworkError, match="suggested_params"),
    ):
        client.suggested_params()


def test_transaction_by_id_returns_none_on_indexer_error():
    cfg = Config.from_env(network=Network.ALGORAND_TESTNET)
    client = AlgorandClient(cfg)
    with patch.object(client._indexer, "transaction", side_effect=Exception("nope")):
        assert client.transaction_by_id("abc") is None


def test_transaction_by_id_parses_transaction_key():
    cfg = Config.from_env(network=Network.ALGORAND_TESTNET)
    client = AlgorandClient(cfg)
    inner = {"id": "tx1"}
    with patch.object(client._indexer, "transaction", return_value={"transaction": inner}):
        assert client.transaction_by_id("tx1") == inner
