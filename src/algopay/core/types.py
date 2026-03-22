"""Types for AlgoPay (Algorand-focused)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any, TypeAlias

AmountType: TypeAlias = Decimal | int | float | str


class Network(str, Enum):
    """Supported Algorand networks (CAIP-2 style identifier values)."""

    ALGORAND_MAINNET = "algorand-mainnet"
    ALGORAND_TESTNET = "algorand-testnet"

    @classmethod
    def from_string(cls, value: str) -> Network:
        v = value.strip().lower().replace("_", "-")
        if v.startswith("algorand:"):
            from algopay.core.constants import ALGORAND_MAINNET_CAIP2, ALGORAND_TESTNET_CAIP2

            if value == ALGORAND_MAINNET_CAIP2:
                return cls.ALGORAND_MAINNET
            if value == ALGORAND_TESTNET_CAIP2:
                return cls.ALGORAND_TESTNET
            raise ValueError(f"Unknown Algorand CAIP-2 network: {value}")
        for m in cls:
            if m.value == v:
                return m
        raise ValueError(f"Unknown network: {value}. Use algorand-mainnet or algorand-testnet.")

    def to_caip2(self) -> str:
        from algopay.core.constants import ALGORAND_MAINNET_CAIP2, ALGORAND_TESTNET_CAIP2

        if self == Network.ALGORAND_MAINNET:
            return ALGORAND_MAINNET_CAIP2
        return ALGORAND_TESTNET_CAIP2

    def usdc_asa_id(self) -> int:
        from algopay.core.constants import USDC_MAINNET_ASA_ID, USDC_TESTNET_ASA_ID

        return USDC_MAINNET_ASA_ID if self == Network.ALGORAND_MAINNET else USDC_TESTNET_ASA_ID


class PaymentMethod(str, Enum):
    X402 = "x402"
    TRANSFER = "transfer"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    BLOCKED = "blocked"


class PaymentIntentStatus(str, Enum):
    REQUIRES_CONFIRMATION = "requires_confirmation"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    CANCELED = "canceled"
    FAILED = "failed"


class WalletState(str, Enum):
    LIVE = "LIVE"
    FROZEN = "FROZEN"


class AccountType(str, Enum):
    EOA = "EOA"


class TransactionState(str, Enum):
    """Approximate lifecycle for Algorand txs (indexer/algod)."""

    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"


class FeeLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


@dataclass
class TokenInfo:
    id: str
    blockchain: str
    symbol: str
    name: str
    decimals: int
    is_native: bool = False
    token_address: str | None = None


@dataclass
class Balance:
    amount: Decimal
    token: TokenInfo

    @property
    def currency(self) -> str:
        return self.token.symbol


@dataclass
class WalletSetInfo:
    id: str
    name: str | None
    create_date: datetime | None = None
    update_date: datetime | None = None


@dataclass
class WalletInfo:
    id: str
    address: str
    blockchain: str
    state: WalletState
    wallet_set_id: str
    account_type: AccountType = AccountType.EOA
    name: str | None = None
    create_date: datetime | None = None
    update_date: datetime | None = None


@dataclass
class TransactionInfo:
    id: str
    state: TransactionState
    blockchain: str | None = None
    tx_hash: str | None = None
    wallet_id: str | None = None
    source_address: str | None = None
    destination_address: str | None = None
    error_reason: str | None = None

    def is_terminal(self) -> bool:
        return self.state in (
            TransactionState.COMPLETE,
            TransactionState.FAILED,
        )

    def is_successful(self) -> bool:
        return self.state == TransactionState.COMPLETE


@dataclass
class PaymentRequest:
    wallet_id: str
    recipient: str
    amount: Decimal
    purpose: str | None = None
    idempotency_key: str | None = None
    destination_chain: Network | str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.amount <= 0:
            raise ValueError("Amount must be positive")
        if not self.recipient:
            raise ValueError("Recipient is required")
        if not self.wallet_id:
            raise ValueError("wallet_id is required")


@dataclass
class PaymentIntent:
    id: str
    wallet_id: str
    recipient: str
    amount: Decimal
    currency: str
    status: PaymentIntentStatus
    created_at: datetime
    expires_at: datetime | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    client_secret: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "wallet_id": self.wallet_id,
            "recipient": self.recipient,
            "amount": str(self.amount),
            "currency": self.currency,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "metadata": self.metadata,
            "client_secret": self.client_secret,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> PaymentIntent:
        return cls(
            id=data["id"],
            wallet_id=data["wallet_id"],
            recipient=data["recipient"],
            amount=Decimal(data["amount"]),
            currency=data["currency"],
            status=PaymentIntentStatus(data["status"]),
            created_at=datetime.fromisoformat(data["created_at"]),
            expires_at=datetime.fromisoformat(data["expires_at"]) if data.get("expires_at") else None,
            metadata=data.get("metadata", {}),
            client_secret=data.get("client_secret"),
        )


@dataclass
class PaymentResult:
    success: bool
    transaction_id: str | None
    blockchain_tx: str | None
    amount: Decimal
    recipient: str
    method: PaymentMethod
    status: PaymentStatus
    guards_passed: list[str] = field(default_factory=list)
    error: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    resource_data: Any = None


@dataclass
class SimulationResult:
    would_succeed: bool
    route: PaymentMethod
    guards_that_would_pass: list[str] = field(default_factory=list)
    guards_that_would_fail: list[str] = field(default_factory=list)
    estimated_fee: Decimal | None = None
    reason: str | None = None


@dataclass
class BatchPaymentResult:
    total_count: int
    success_count: int
    failed_count: int
    results: list[PaymentResult]
    transaction_ids: list[str] = field(default_factory=list)
