"""Tests for core types and enums."""

from __future__ import annotations

from decimal import Decimal

import pytest

from algopay.core.constants import ALGORAND_TESTNET_CAIP2
from algopay.core.types import (
    Network,
    PaymentIntent,
    PaymentIntentStatus,
    PaymentRequest,
    TransactionInfo,
    TransactionState,
)


def test_network_from_string_slug():
    assert Network.from_string("algorand-testnet") == Network.ALGORAND_TESTNET
    assert Network.from_string("ALGORAND_TESTNET") == Network.ALGORAND_TESTNET
    assert Network.from_string("algorand_mainnet") == Network.ALGORAND_MAINNET


def test_network_from_string_caip2():
    assert Network.from_string(ALGORAND_TESTNET_CAIP2) == Network.ALGORAND_TESTNET


def test_network_from_string_unknown():
    with pytest.raises(ValueError, match="Unknown"):
        Network.from_string("ethereum-mainnet")


def test_network_to_caip2_roundtrip():
    n = Network.ALGORAND_TESTNET
    assert Network.from_string(n.to_caip2()) == n


def test_network_usdc_asa_id():
    assert Network.ALGORAND_TESTNET.usdc_asa_id() > 0
    assert Network.ALGORAND_MAINNET.usdc_asa_id() != Network.ALGORAND_TESTNET.usdc_asa_id()


def test_payment_request_validation():
    with pytest.raises(ValueError, match="positive"):
        PaymentRequest(wallet_id="w", recipient="r", amount=Decimal("0"))
    with pytest.raises(ValueError, match="Recipient"):
        PaymentRequest(wallet_id="w", recipient="", amount=Decimal("1"))
    with pytest.raises(ValueError, match="wallet_id"):
        PaymentRequest(wallet_id="", recipient="r", amount=Decimal("1"))


def test_transaction_info_terminal():
    ok = TransactionInfo(id="1", state=TransactionState.COMPLETE)
    assert ok.is_terminal() and ok.is_successful()
    bad = TransactionInfo(id="2", state=TransactionState.FAILED)
    assert bad.is_terminal() and not bad.is_successful()
    pend = TransactionInfo(id="3", state=TransactionState.PENDING)
    assert not pend.is_terminal()


def test_payment_intent_to_dict_roundtrip():
    from datetime import datetime, timezone

    intent = PaymentIntent(
        id="i1",
        wallet_id="w1",
        recipient="https://x.example/a",
        amount=Decimal("2.5"),
        currency="USDC",
        status=PaymentIntentStatus.REQUIRES_CONFIRMATION,
        created_at=datetime(2024, 1, 2, tzinfo=timezone.utc),
        metadata={"k": "v"},
    )
    restored = PaymentIntent.from_dict(intent.to_dict())
    assert restored.id == intent.id
    assert restored.amount == intent.amount
    assert restored.status == intent.status
    assert restored.metadata == intent.metadata
