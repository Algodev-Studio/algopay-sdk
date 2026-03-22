"""Protocol adapter base."""

from __future__ import annotations

from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Any

from algopay.core.types import FeeLevel, Network, PaymentMethod, PaymentResult


class ProtocolAdapter(ABC):
    @property
    @abstractmethod
    def method(self) -> PaymentMethod:
        ...

    @abstractmethod
    def supports(
        self,
        recipient: str,
        source_network: Network | str | None = None,
        destination_chain: Network | str | None = None,
        **kwargs: Any,
    ) -> bool:
        ...

    @abstractmethod
    async def execute(
        self,
        wallet_id: str,
        recipient: str,
        amount: Decimal,
        fee_level: FeeLevel = FeeLevel.MEDIUM,
        idempotency_key: str | None = None,
        purpose: str | None = None,
        destination_chain: Network | str | None = None,
        source_network: Network | str | None = None,
        wait_for_completion: bool = False,
        timeout_seconds: float | None = None,
        **kwargs: Any,
    ) -> PaymentResult:
        ...

    async def simulate(
        self,
        wallet_id: str,
        recipient: str,
        amount: Decimal,
        **kwargs: Any,
    ) -> dict[str, Any]:
        return {
            "would_succeed": True,
            "method": self.method.value,
            "recipient": recipient,
            "amount": str(amount),
        }

    def get_priority(self) -> int:
        return 100
