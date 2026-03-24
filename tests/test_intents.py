"""PaymentIntentService."""

from __future__ import annotations

from decimal import Decimal

import pytest

from algopay.core.exceptions import ValidationError
from algopay.core.types import PaymentIntentStatus
from algopay.intents.service import PaymentIntentService
from algopay.storage.memory import InMemoryStorage


@pytest.mark.asyncio
async def test_intent_create_get():
    storage = InMemoryStorage()
    svc = PaymentIntentService(storage)
    intent = await svc.create("w1", "https://x.example/a", Decimal("1.5"), metadata={"k": "v"})
    assert intent.status == PaymentIntentStatus.REQUIRES_CONFIRMATION
    loaded = await svc.get(intent.id)
    assert loaded is not None
    assert loaded.amount == Decimal("1.5")
    assert loaded.metadata["k"] == "v"


@pytest.mark.asyncio
async def test_intent_update_status():
    storage = InMemoryStorage()
    svc = PaymentIntentService(storage)
    intent = await svc.create("w1", "r", Decimal("1"))
    updated = await svc.update_status(intent.id, PaymentIntentStatus.PROCESSING)
    assert updated.status == PaymentIntentStatus.PROCESSING


@pytest.mark.asyncio
async def test_intent_update_missing_raises():
    storage = InMemoryStorage()
    svc = PaymentIntentService(storage)
    with pytest.raises(ValidationError, match="not found"):
        await svc.update_status("missing-id", PaymentIntentStatus.FAILED)
