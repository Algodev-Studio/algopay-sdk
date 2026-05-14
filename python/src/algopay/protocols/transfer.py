"""Direct USDC (ASA) transfers on Algorand."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING, Any

try:
    from x402.mechanisms.avm.utils import is_valid_address
except ImportError:
    import re

    _AVM_RE = re.compile(r"^[A-Z2-7]{58}$")

    def is_valid_address(addr: str) -> bool:
        return bool(_AVM_RE.match(addr))


from algopay.core.exceptions import InsufficientBalanceError, WalletError
from algopay.core.logging import get_logger
from algopay.core.types import (
    FeeLevel,
    Network,
    PaymentMethod,
    PaymentResult,
    PaymentStatus,
    TransactionState,
)
from algopay.protocols.base import ProtocolAdapter

if TYPE_CHECKING:
    from algopay.core.config import Config
    from algopay.wallet.service import WalletService


class TransferAdapter(ProtocolAdapter):
    def __init__(self, config: Config, wallet_service: WalletService) -> None:
        self._config = config
        self._wallet_service = wallet_service
        self._logger = get_logger("transfer")

    @property
    def method(self) -> PaymentMethod:
        return PaymentMethod.TRANSFER

    def supports(
        self,
        recipient: str,
        source_network: Network | str | None = None,
        destination_chain: Network | str | None = None,
        **kwargs: Any,
    ) -> bool:
        if destination_chain is not None:
            return False
        return is_valid_address(recipient)

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
        try:
            transfer_result = self._wallet_service.transfer(
                wallet_id=wallet_id,
                destination_address=recipient,
                amount=amount,
                fee_level=fee_level,
                check_balance=True,
                wait_for_completion=wait_for_completion,
                timeout_seconds=timeout_seconds,
                idempotency_key=idempotency_key,
            )
        except (WalletError, InsufficientBalanceError) as e:
            return PaymentResult(
                success=False,
                transaction_id=None,
                blockchain_tx=None,
                amount=amount,
                recipient=recipient,
                method=self.method,
                status=PaymentStatus.FAILED,
                error=str(e),
            )

        if not transfer_result.success:
            return PaymentResult(
                success=False,
                transaction_id=transfer_result.id,
                blockchain_tx=transfer_result.tx_hash,
                amount=amount,
                recipient=recipient,
                method=self.method,
                status=PaymentStatus.FAILED,
                error=transfer_result.error,
            )

        tx = transfer_result.transaction
        status = PaymentStatus.PROCESSING
        if tx:
            if tx.state == TransactionState.COMPLETE:
                status = PaymentStatus.COMPLETED
            elif tx.state == TransactionState.FAILED:
                status = PaymentStatus.FAILED

        return PaymentResult(
            success=True,
            transaction_id=tx.id if tx else None,
            blockchain_tx=transfer_result.tx_hash,
            amount=amount,
            recipient=recipient,
            method=self.method,
            status=status,
            metadata={
                "purpose": purpose,
                "fee_level": fee_level.value,
                "idempotency_key": idempotency_key,
            },
        )

    async def simulate(
        self,
        wallet_id: str,
        recipient: str,
        amount: Decimal,
        **kwargs: Any,
    ) -> dict[str, Any]:
        result: dict[str, Any] = {
            "method": self.method.value,
            "recipient": recipient,
            "amount": str(amount),
        }
        if not self.supports(recipient):
            result["would_succeed"] = False
            result["reason"] = f"Invalid Algorand address: {recipient}"
            return result
        try:
            balance = self._wallet_service.get_usdc_balance(wallet_id)
            result["current_balance"] = str(balance.amount) if balance else "0"
            amt = balance.amount if balance else Decimal("0")
            if amt >= amount:
                result["would_succeed"] = True
                result["remaining_balance"] = str(amt - amount)
            else:
                result["would_succeed"] = False
                result["reason"] = f"Insufficient balance: {amt} < {amount}"
        except WalletError as e:
            result["would_succeed"] = False
            result["reason"] = str(e)
        return result

    def get_priority(self) -> int:
        return 50
