"""Route payments to Transfer or x402 adapters."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING, Any

from algopay.core.logging import get_logger
from algopay.core.types import (
    FeeLevel,
    Network,
    PaymentMethod,
    PaymentResult,
    PaymentStatus,
    SimulationResult,
)
from algopay.protocols.base import ProtocolAdapter

if TYPE_CHECKING:
    from algopay.core.config import Config
    from algopay.wallet.service import WalletService


class PaymentRouter:
    def __init__(self, config: Config, wallet_service: WalletService) -> None:
        self._config = config
        self._wallet_service = wallet_service
        self._adapters: list[ProtocolAdapter] = []
        self._logger = get_logger("router")

    def register_adapter(self, adapter: ProtocolAdapter) -> None:
        self._adapters.append(adapter)
        self._adapters.sort(key=lambda a: a.get_priority())

    def get_adapters(self) -> list[ProtocolAdapter]:
        return list(self._adapters)

    def detect_method(
        self,
        recipient: str,
        source_network: Network | str | None = None,
        destination_chain: Network | str | None = None,
        **kwargs: Any,
    ) -> PaymentMethod | None:
        src = source_network or self._config.network
        for adapter in self._adapters:
            if adapter.supports(recipient, source_network=src, destination_chain=destination_chain, **kwargs):
                return adapter.method
        return None

    def _find_adapter(
        self,
        recipient: str,
        source_network: Network | str | None = None,
        destination_chain: Network | str | None = None,
        **kwargs: Any,
    ) -> ProtocolAdapter | None:
        src = source_network or self._config.network
        for adapter in self._adapters:
            if adapter.supports(recipient, source_network=src, destination_chain=destination_chain, **kwargs):
                return adapter
        return None

    async def pay(
        self,
        wallet_id: str,
        recipient: str,
        amount: Decimal | str,
        fee_level: FeeLevel = FeeLevel.MEDIUM,
        purpose: str | None = None,
        guards_passed: list[str] | None = None,
        idempotency_key: str | None = None,
        wait_for_completion: bool = False,
        timeout_seconds: float | None = None,
        destination_chain: Network | str | None = None,
        **kwargs: Any,
    ) -> PaymentResult:
        amount_decimal = Decimal(str(amount))
        src = self._config.network
        adapter = self._find_adapter(
            recipient,
            destination_chain=destination_chain,
            source_network=src,
            **kwargs,
        )
        if not adapter:
            self._logger.error("No adapter for recipient: %s", recipient)
            return PaymentResult(
                success=False,
                transaction_id=None,
                blockchain_tx=None,
                amount=amount_decimal,
                recipient=recipient,
                method=PaymentMethod.TRANSFER,
                status=PaymentStatus.FAILED,
                error=f"No adapter found for recipient: {recipient}",
                guards_passed=guards_passed or [],
            )

        result = await adapter.execute(
            wallet_id=wallet_id,
            recipient=recipient,
            amount=amount_decimal,
            source_network=src,
            purpose=purpose,
            fee_level=fee_level,
            idempotency_key=idempotency_key,
            destination_chain=destination_chain,
            wait_for_completion=wait_for_completion,
            timeout_seconds=timeout_seconds,
            **kwargs,
        )
        if guards_passed:
            result.guards_passed = guards_passed
        return result

    async def simulate(
        self,
        wallet_id: str,
        recipient: str,
        amount: Decimal | str,
        **kwargs: Any,
    ) -> SimulationResult:
        amount_decimal = Decimal(str(amount))
        src = self._config.network
        destination_chain = kwargs.get("destination_chain")
        adapter = self._find_adapter(
            recipient,
            source_network=src,
            destination_chain=destination_chain,
            **kwargs,
        )
        if not adapter:
            return SimulationResult(
                would_succeed=False,
                route=PaymentMethod.TRANSFER,
                reason=f"No adapter found for recipient: {recipient}",
            )
        sim = await adapter.simulate(
            wallet_id=wallet_id, recipient=recipient, amount=amount_decimal, **kwargs
        )
        return SimulationResult(
            would_succeed=sim.get("would_succeed", False),
            route=adapter.method,
            estimated_fee=Decimal(sim["estimated_fee"]) if sim.get("estimated_fee") else None,
            reason=sim.get("reason"),
        )

    def can_handle(self, recipient: str) -> bool:
        return self._find_adapter(recipient) is not None
