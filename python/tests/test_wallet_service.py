"""WalletService with mocked AlgorandClient."""

from __future__ import annotations

from decimal import Decimal
from unittest.mock import MagicMock

import pytest
from algosdk import account

from algopay.core.config import Config
from algopay.core.exceptions import InsufficientBalanceError
from algopay.core.types import Network
from algopay.wallet.service import WalletService


def _suggested_params_mock():
    sp = MagicMock()
    sp.min_fee = 1000
    sp.first = 1
    sp.last = 1000
    sp.gh = b"\x00" * 32
    sp.gen = "testnet-v1.0"
    return sp


@pytest.fixture
def mock_chain():
    m = MagicMock()
    m.suggested_params.return_value = _suggested_params_mock()
    m.send_transaction.return_value = "TXIDHASH123"
    m.account_info.return_value = {"amount": 10_000_000, "assets": []}
    m.pending_transaction_info.return_value = {"confirmed-round": 123}
    m.indexer.search_asset_transactions.return_value = {"transactions": []}
    return m


@pytest.fixture
def wallet_service(mock_chain):
    cfg = Config.from_env(network=Network.ALGORAND_TESTNET)
    return WalletService(cfg, mock_chain)


def test_wallet_service_create_and_get(wallet_service: WalletService):
    ws = wallet_service.create_wallet_set("unit-set")
    w = wallet_service.create_wallet(ws.id)
    assert len(w.address) == 58
    got = wallet_service.get_wallet(w.id)
    assert got.id == w.id


def test_wallet_service_get_balances_usdc(wallet_service: WalletService, mock_chain):
    asa = Network.ALGORAND_TESTNET.usdc_asa_id()
    mock_chain.account_info.return_value = {
        "amount": 1_000_000,
        "assets": [{"asset-id": asa, "amount": 3_000_000}],
    }
    ws = wallet_service.create_wallet_set("s")
    w = wallet_service.create_wallet(ws.id)
    balances = wallet_service.get_balances(w.id)
    assert len(balances) == 1
    assert balances[0].amount == Decimal("3")


def test_wallet_service_ensure_sufficient_balance_raises(wallet_service: WalletService, mock_chain):
    asa = Network.ALGORAND_TESTNET.usdc_asa_id()
    mock_chain.account_info.return_value = {
        "amount": 1_000_000,
        "assets": [{"asset-id": asa, "amount": 1_000_000}],
    }
    ws = wallet_service.create_wallet_set("s")
    w = wallet_service.create_wallet(ws.id)
    with pytest.raises(InsufficientBalanceError):
        wallet_service.ensure_sufficient_balance(w.id, Decimal("2"))


def test_wallet_service_transfer_builds_tx(wallet_service: WalletService, mock_chain):
    ws = wallet_service.create_wallet_set("s")
    w = wallet_service.create_wallet(ws.id)
    _, dest = account.generate_account()
    asa = Network.ALGORAND_TESTNET.usdc_asa_id()
    mock_chain.account_info.return_value = {
        "amount": 10_000_000,
        "assets": [{"asset-id": asa, "amount": 10_000_000}],
    }
    res = wallet_service.transfer(w.id, dest, "1.0", check_balance=True, wait_for_completion=False)
    assert res.success
    mock_chain.send_transaction.assert_called_once()


def test_wallet_service_list_transactions_empty_without_wallet(wallet_service: WalletService):
    assert wallet_service.list_transactions(None) == []
