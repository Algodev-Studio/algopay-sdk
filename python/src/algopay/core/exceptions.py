"""Exception hierarchy for AlgoPay SDK."""

from __future__ import annotations

from decimal import Decimal
from typing import Any


class AlgoPayError(Exception):
    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}

    def __str__(self) -> str:
        if self.details:
            return f"{self.message} | Details: {self.details}"
        return self.message


class ConfigurationError(AlgoPayError):
    pass


class WalletError(AlgoPayError):
    def __init__(
        self,
        message: str,
        wallet_id: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, details)
        self.wallet_id = wallet_id


class PaymentError(AlgoPayError):
    def __init__(
        self,
        message: str,
        recipient: str | None = None,
        amount: Decimal | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, details)
        self.recipient = recipient
        self.amount = amount


class GuardError(PaymentError):
    def __init__(
        self,
        message: str,
        guard_name: str,
        reason: str,
        recipient: str | None = None,
        amount: Decimal | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, recipient, amount, details)
        self.guard_name = guard_name
        self.reason = reason

    def __str__(self) -> str:
        return f"[{self.guard_name}] {self.reason}"


class ProtocolError(PaymentError):
    def __init__(
        self,
        message: str,
        protocol: str = "unknown",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, details=details)
        self.protocol = protocol

    def __str__(self) -> str:
        return f"[{self.protocol}] {self.message}"


class ValidationError(AlgoPayError):
    pass


class InsufficientBalanceError(PaymentError):
    def __init__(
        self,
        message: str,
        current_balance: Decimal,
        required_amount: Decimal,
        wallet_id: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, details=details, amount=required_amount)
        self.current_balance = current_balance
        self.required_amount = required_amount
        self.wallet_id = wallet_id
        self.shortfall = required_amount - current_balance

    def __str__(self) -> str:
        return (
            f"{self.message} | "
            f"Balance: {self.current_balance}, Required: {self.required_amount}, "
            f"Shortfall: {self.shortfall}"
        )


class NetworkError(AlgoPayError):
    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        url: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, details)
        self.status_code = status_code
        self.url = url

