"""AlgoPay — main SDK entry point for Algorand agent payments."""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from algopay.core.algorand_client import AlgorandClient
from algopay.core.config import Config
from algopay.core.exceptions import PaymentError, ValidationError
from algopay.core.types import (
    AccountType,
    AmountType,
    BatchPaymentResult,
    FeeLevel,
    Network,
    PaymentIntent,
    PaymentIntentStatus,
    PaymentMethod,
    PaymentRequest,
    PaymentResult,
    PaymentStatus,
    SimulationResult,
    TransactionInfo,
    WalletInfo,
    WalletSetInfo,
)
from algopay.guards.base import PaymentContext
from algopay.guards.manager import GuardManager
from algopay.intents.service import PaymentIntentService
from algopay.ledger import Ledger, LedgerEntry, LedgerEntryStatus
from algopay.payment.batch import BatchProcessor
from algopay.payment.router import PaymentRouter
from algopay.protocols.transfer import TransferAdapter
from algopay.protocols.x402 import X402Adapter
from algopay.storage import get_storage
from algopay.wallet.service import WalletService


class AlgoPay:
    """
    Payment SDK for AI agents on Algorand (USDC ASA, x402).

    Uses local wallet storage and Algod/Indexer — no custodial Circle API.
    """

    def __init__(
        self,
        network: Network | None = None,
        algod_url: str | None = None,
        indexer_url: str | None = None,
        usdc_asa_id: int | None = None,
        log_level: int | str | None = None,
    ) -> None:
        if log_level is None:
            log_level = os.environ.get("ALGOPAY_LOG_LEVEL", "INFO")

        from algopay.core.logging import configure_logging, get_logger

        configure_logging(level=log_level)
        self._logger = get_logger("client")

        overrides: dict[str, Any] = {}
        if network is not None:
            overrides["network"] = network
        if algod_url:
            overrides["algod_url"] = algod_url
        if indexer_url:
            overrides["indexer_url"] = indexer_url
        if usdc_asa_id is not None:
            overrides["usdc_asa_id"] = usdc_asa_id

        self._config = Config.from_env(**overrides)
        self._logger.info("Initializing AlgoPay (network=%s)", self._config.network.value)

        backend = self._config.storage_backend
        self._storage = get_storage(backend, redis_url=self._config.redis_url)
        self._ledger = Ledger(self._storage)
        self._guard_manager = GuardManager(self._storage)
        self._chain = AlgorandClient(self._config)

        self._wallet_service = WalletService(self._config, self._chain)

        self._router = PaymentRouter(self._config, self._wallet_service)
        self._router.register_adapter(X402Adapter(self._config, self._wallet_service))
        self._router.register_adapter(TransferAdapter(self._config, self._wallet_service))

        self._intent_service = PaymentIntentService(self._storage)
        self._batch_processor = BatchProcessor(self._router)

    @property
    def config(self) -> Config:
        return self._config

    @property
    def wallet(self) -> WalletService:
        return self._wallet_service

    @property
    def guards(self) -> GuardManager:
        return self._guard_manager

    @property
    def ledger(self) -> Ledger:
        return self._ledger

    async def __aenter__(self) -> AlgoPay:
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Async context manager exit."""
        pass

    async def get_balance(self, wallet_id: str) -> Decimal:
        """Get USDC balance for a wallet."""
        return self._wallet_service.get_usdc_balance_amount(wallet_id)

    async def create_wallet(
        self,
        blockchain: Network | str | None = None,
        wallet_set_id: str | None = None,
        account_type: AccountType = AccountType.EOA,
        name: str | None = None,
    ) -> WalletInfo:
        """
        Create a new wallet.

        Args:
            blockchain: Blockchain network (default: config.network)
            wallet_set_id: ID of existing wallet set. If None, creates a new set using `name` or default.
            account_type: Wallet type (EOA or SCA)
            name: Name for new wallet set if creating one (default: "default-set")

        Returns:
            Created WalletInfo
        """
        if not wallet_set_id:
            # Create a new set automatically
            set_name = name or f"set-{uuid.uuid4().hex[:8]}"
            wallet_set = self._wallet_service.create_wallet_set(name=set_name)
            wallet_set_id = wallet_set.id

        return self._wallet_service.create_wallet(
            wallet_set_id=wallet_set_id,
            blockchain=blockchain,
            account_type=account_type,
        )

    async def create_wallet_set(self, name: str | None = None) -> WalletSetInfo:
        """Create a new wallet set."""
        return self._wallet_service.create_wallet_set(name)

    async def list_wallets(self, wallet_set_id: str | None = None) -> list[WalletInfo]:
        """List wallets (optional filter by set)."""
        return self._wallet_service.list_wallets(wallet_set_id)

    async def list_wallet_sets(self) -> list[WalletSetInfo]:
        """List available wallet sets."""
        return self._wallet_service.list_wallet_sets()

    async def get_wallet(self, wallet_id: str) -> WalletInfo:
        """Get details of a specific wallet."""
        return self._wallet_service.get_wallet(wallet_id)

    async def list_transactions(
        self, wallet_id: str | None = None, blockchain: Network | str | None = None
    ) -> list[TransactionInfo]:
        """List transactions for a wallet or globally."""
        return self._wallet_service.list_transactions(wallet_id, blockchain)

    async def pay(
        self,
        wallet_id: str,
        recipient: str,
        amount: AmountType,
        destination_chain: Network | str | None = None,
        wallet_set_id: str | None = None,
        purpose: str | None = None,
        idempotency_key: str | None = None,
        fee_level: FeeLevel = FeeLevel.MEDIUM,
        skip_guards: bool = False,
        metadata: dict[str, Any] | None = None,
        wait_for_completion: bool = False,
        timeout_seconds: float | None = None,
        **kwargs: Any,
    ) -> PaymentResult:
        """
        Execute a payment with automatic routing (x402 URL or Algorand address transfer) and guard checks.

        Args:
            wallet_id: Source wallet ID (REQUIRED)
            recipient: Payment recipient (Algorand address or https URL for x402)
            amount: Max USDC for x402 quote or exact amount for direct transfer
            destination_chain: Ignored on Algorand (reserved for future bridges)
            wallet_set_id: Wallet set ID for hierarchical guards
            purpose: Human-readable purpose
            idempotency_key: Unique key for deduplication
            fee_level: Transaction fee level (Algorand min fee multiplier)
            skip_guards: Skip guard checks (dangerous!)
            metadata: Additional metadata
            wait_for_completion: Wait for transaction confirmation
            timeout_seconds: Maximum wait time
            **kwargs: Extra arguments passed to the payment router / adapters

        Returns:
            PaymentResult with transaction details
        """
        if not wallet_id:
            raise ValidationError("wallet_id is required")

        amount_decimal = Decimal(str(amount))
        if amount_decimal <= 0:
            raise ValidationError(f"Payment amount must be positive. Got: {amount_decimal}")

        idempotency_key = idempotency_key or str(uuid.uuid4())

        meta = metadata or {}
        meta["idempotency_key"] = idempotency_key

        context = PaymentContext(
            wallet_id=wallet_id,
            wallet_set_id=wallet_set_id,
            recipient=recipient,
            amount=amount_decimal,
            purpose=purpose,
            metadata=meta,
        )

        ledger_entry = LedgerEntry(
            wallet_id=wallet_id,
            recipient=recipient,
            amount=amount_decimal,
            purpose=purpose,
            metadata=metadata or {},
        )
        await self._ledger.record(ledger_entry)

        guards_chain = None
        reservation_tokens = []
        guards_passed: list[str] = []

        if not skip_guards:
            guards_chain = await self._guard_manager.get_guard_chain(
                wallet_id=wallet_id, wallet_set_id=wallet_set_id
            )
            try:
                reservation_tokens = await guards_chain.reserve(context)
                guards_passed = [g.name for g in guards_chain]
            except ValueError as e:
                await self._ledger.update_status(
                    ledger_entry.id,
                    LedgerEntryStatus.BLOCKED,
                    tx_hash=None,
                )

                return PaymentResult(
                    success=False,
                    transaction_id=None,
                    blockchain_tx=None,
                    amount=amount_decimal,
                    recipient=recipient,
                    method=PaymentMethod.TRANSFER,
                    status=PaymentStatus.BLOCKED,
                    error=f"Blocked by guard: {e}",
                    guards_passed=guards_passed,
                    metadata={"guard_reason": str(e)},
                )

        try:
            result = await self._router.pay(
                wallet_id=wallet_id,
                recipient=recipient,
                amount=amount_decimal,
                purpose=purpose,
                guards_passed=guards_passed,
                fee_level=fee_level,
                idempotency_key=idempotency_key,
                destination_chain=destination_chain,
                wait_for_completion=wait_for_completion,
                timeout_seconds=timeout_seconds,
                **kwargs,
            )

            if result.success:
                await self._ledger.update_status(
                    ledger_entry.id,
                    LedgerEntryStatus.COMPLETED
                    if result.status == PaymentStatus.COMPLETED
                    else LedgerEntryStatus.PENDING,
                    result.blockchain_tx,
                    metadata_updates={"transaction_id": result.transaction_id},
                )

                if guards_chain:
                    await guards_chain.commit(reservation_tokens)
            else:
                await self._ledger.update_status(
                    ledger_entry.id,
                    LedgerEntryStatus.FAILED,
                )
                if guards_chain:
                    await guards_chain.release(reservation_tokens)

            return result

        except Exception:
            if guards_chain:
                await guards_chain.release(reservation_tokens)

            await self._ledger.update_status(
                ledger_entry.id,
                LedgerEntryStatus.FAILED,
            )
            raise

    async def simulate(
        self,
        wallet_id: str,
        recipient: str,
        amount: Decimal | str,
        wallet_set_id: str | None = None,
        **kwargs: Any,
    ) -> SimulationResult:
        """
        Simulate a payment without executing.

        Checks:
        - Guards would pass
        - Balance is sufficient
        - Recipient is valid

        Args:
            wallet_id: Source wallet ID (REQUIRED)
            recipient: Payment recipient
            amount: Amount to simulate
            wallet_set_id: Optional wallet set ID (for set-level guards)
            **kwargs: Additional parameters

        Returns:
            SimulationResult with would_succeed and details
        """
        if not wallet_id:
            return SimulationResult(
                would_succeed=False,
                route=PaymentMethod.TRANSFER,
                reason="wallet_id is required",
            )

        amount_decimal = Decimal(str(amount))

        # Check guards first
        context = PaymentContext(
            wallet_id=wallet_id,
            wallet_set_id=wallet_set_id,
            recipient=recipient,
            amount=amount_decimal,
            purpose="Simulation",
        )

        allowed, reason, _ = await self._guard_manager.check(context)
        if not allowed:
            return SimulationResult(
                would_succeed=False,
                route=PaymentMethod.TRANSFER,
                reason=f"Would be blocked by guard: {reason}",
            )

        # Check via router
        return await self._router.simulate(
            wallet_id=wallet_id,
            recipient=recipient,
            amount=amount_decimal,
            **kwargs,
        )

    def can_pay(self, recipient: str) -> bool:
        """
        Check if a recipient can be paid.

        Args:
            recipient: Payment recipient

        Returns:
            True if an adapter can handle this recipient
        """
        return self._router.can_handle(recipient)

    def detect_method(self, recipient: str) -> PaymentMethod | None:
        """Detect which payment method would be used for a recipient."""
        return self._router.detect_method(recipient)

    @property
    def intents(self) -> PaymentIntentService:
        """Get intent management service."""
        return self._intent_service

    async def create_payment_intent(
        self,
        wallet_id: str,
        recipient: str,
        amount: AmountType,
        purpose: str | None = None,
        idempotency_key: str | None = None,
        **kwargs: Any,
    ) -> PaymentIntent:
        """Create a Payment Intent (Authorize)."""
        # Simulate check (Routing + Guards) strictly
        sim_result = await self.simulate(
            wallet_id=wallet_id, recipient=recipient, amount=amount, **kwargs
        )

        if not sim_result.would_succeed:
            raise PaymentError(f"Authorization failed: {sim_result.reason}")

        # Create Intent
        metadata = kwargs.copy()
        metadata.update(
            {
                "purpose": purpose,
                "idempotency_key": idempotency_key,
                "simulated_route": sim_result.route.value,
            }
        )

        intent = await self._intent_service.create(
            wallet_id=wallet_id, recipient=recipient, amount=Decimal(str(amount)), metadata=metadata
        )
        return intent

    async def confirm_payment_intent(self, intent_id: str) -> PaymentResult:
        """Confirm and execute a Payment Intent (Capture)."""
        intent = await self._intent_service.get(intent_id)
        if not intent:
            raise ValidationError(f"Intent not found: {intent_id}")

        if intent.status != PaymentIntentStatus.REQUIRES_CONFIRMATION:
            raise ValidationError(f"Intent cannot be confirmed. Status: {intent.status}")

        try:
            # Update to Processing
            await self._intent_service.update_status(intent.id, PaymentIntentStatus.PROCESSING)

            # Prepare exec args from intent + metadata
            exec_kwargs = intent.metadata.copy()

            # Remove internal metadata keys that aren't for routing
            purpose = exec_kwargs.pop("purpose", None)
            idempotency_key = exec_kwargs.pop("idempotency_key", None)
            exec_kwargs.pop("simulated_route", None)

            # Execute Pay
            result = await self.pay(
                wallet_id=intent.wallet_id,
                recipient=intent.recipient,
                amount=intent.amount,
                purpose=purpose,
                idempotency_key=idempotency_key,
                **exec_kwargs,
            )

            if result.success:
                await self._intent_service.update_status(intent.id, PaymentIntentStatus.SUCCEEDED)
            else:
                await self._intent_service.update_status(intent.id, PaymentIntentStatus.FAILED)

            return result

        except Exception as e:
            # Mark failed on exception
            await self._intent_service.update_status(intent.id, PaymentIntentStatus.FAILED)
            raise e

    async def get_payment_intent(self, intent_id: str) -> PaymentIntent | None:
        """Get Payment Intent by ID."""
        return await self._intent_service.get(intent_id)

    async def cancel_payment_intent(self, intent_id: str) -> PaymentIntent:
        """Cancel a Payment Intent."""
        intent = await self._intent_service.get(intent_id)
        if not intent:
            raise ValidationError(f"Intent not found: {intent_id}")

        if intent.status not in (PaymentIntentStatus.REQUIRES_CONFIRMATION,):
            raise ValidationError(f"Cannot cancel intent in status: {intent.status}")

        return await self._intent_service.update_status(intent.id, PaymentIntentStatus.CANCELED)

    async def batch_pay(
        self, requests: list[PaymentRequest], concurrency: int = 5
    ) -> BatchPaymentResult:
        """
        Execute multiple payments in batch.

        Args:
            requests: List of payment requests to execute
            concurrency: Maximum number of concurrent executions (default 5)

        Returns:
            BatchPaymentResult containing status of all payments
        """
        return await self._batch_processor.process(requests, concurrency)

    async def sync_transaction(self, entry_id: str) -> LedgerEntry:
        """Synchronize a ledger entry with Algorand indexer (confirmed tx)."""
        entry = await self._ledger.get(entry_id)
        if not entry:
            raise ValidationError(f"Ledger entry not found: {entry_id}")

        tx_id = entry.tx_hash or entry.metadata.get("transaction_id")
        if not tx_id:
            raise ValidationError("Ledger entry has no transaction id / tx_hash to sync")

        tx = self._chain.transaction_by_id(tx_id)
        if not tx:
            raise PaymentError(f"Transaction not found on indexer: {tx_id}")

        new_status = LedgerEntryStatus.COMPLETED
        await self._ledger.update_status(
            entry.id,
            new_status,
            tx_hash=tx_id,
            metadata_updates={
                "last_synced": datetime.now(timezone.utc).isoformat(),
                "indexer_confirmed": True,
            },
        )

        updated = await self._ledger.get(entry.id)
        return updated  # type: ignore

    async def add_budget_guard(
        self,
        wallet_id: str,
        daily_limit: str | Decimal | None = None,
        hourly_limit: str | Decimal | None = None,
        total_limit: str | Decimal | None = None,
        name: str = "budget",
    ) -> None:
        """
        Add a budget guard to a wallet.

        Enforce spending limits over time periods (Atomic & Reliable).

        Args:
            wallet_id: Target wallet ID
            daily_limit: Max spend per 24h
            hourly_limit: Max spend per 1h
            total_limit: Max total spend (lifetime)
            name: Custom name for the guard
        """
        from algopay.guards.budget import BudgetGuard

        d_limit = Decimal(str(daily_limit)) if daily_limit else None
        h_limit = Decimal(str(hourly_limit)) if hourly_limit else None
        t_limit = Decimal(str(total_limit)) if total_limit else None

        guard = BudgetGuard(
            daily_limit=d_limit, hourly_limit=h_limit, total_limit=t_limit, name=name
        )
        await self._guard_manager.add_guard(wallet_id, guard)

    async def add_budget_guard_for_set(
        self,
        wallet_set_id: str,
        daily_limit: str | Decimal | None = None,
        hourly_limit: str | Decimal | None = None,
        total_limit: str | Decimal | None = None,
        name: str = "budget",
    ) -> None:
        """
        Add a budget guard to a wallet set (applies to ALL wallets in the set).

        Args:
            wallet_set_id: Target wallet set ID
            daily_limit: Max spend per 24h
            hourly_limit: Max spend per 1h
            total_limit: Max total spend (lifetime)
            name: Custom name for the guard
        """
        from algopay.guards.budget import BudgetGuard

        d_limit = Decimal(str(daily_limit)) if daily_limit else None
        h_limit = Decimal(str(hourly_limit)) if hourly_limit else None
        t_limit = Decimal(str(total_limit)) if total_limit else None

        guard = BudgetGuard(
            daily_limit=d_limit, hourly_limit=h_limit, total_limit=t_limit, name=name
        )
        await self._guard_manager.add_guard_for_set(wallet_set_id, guard)

    async def add_single_tx_guard(
        self,
        wallet_id: str,
        max_amount: str | Decimal,
        min_amount: str | Decimal | None = None,
        name: str = "single_tx",
    ) -> None:
        """
        Add a Single Transaction Limit guard.

        Args:
            wallet_id: Target wallet ID
            max_amount: Max amount per transaction
            min_amount: Min amount per transaction
            name: Guard name
        """
        from algopay.guards.single_tx import SingleTxGuard

        guard = SingleTxGuard(
            max_amount=Decimal(str(max_amount)),
            min_amount=Decimal(str(min_amount)) if min_amount else None,
            name=name,
        )
        await self._guard_manager.add_guard(wallet_id, guard)

    async def add_recipient_guard(
        self,
        wallet_id: str,
        mode: str = "whitelist",
        addresses: list[str] | None = None,
        patterns: list[str] | None = None,
        domains: list[str] | None = None,
        name: str = "recipient",
    ) -> None:
        """
        Add a Recipient Access Control guard.

        Args:
            wallet_id: Target wallet ID
            mode: 'whitelist' (allow specific) or 'blacklist' (block specific)
            addresses: List of allowed/blocked addresses
            patterns: List of regex patterns
            domains: List of allowed/blocked domains (for x402/URLs)
            name: Guard name
        """
        from algopay.guards.recipient import RecipientGuard

        guard = RecipientGuard(
            mode=mode, addresses=addresses, patterns=patterns, domains=domains, name=name
        )
        await self._guard_manager.add_guard(wallet_id, guard)

    async def add_rate_limit_guard(
        self,
        wallet_id: str,
        max_per_minute: int | None = None,
        max_per_hour: int | None = None,
        max_per_day: int | None = None,
        name: str = "rate_limit",
    ) -> None:
        """
        Add a rate limit guard to a wallet.

        Limit number of transactions per time window.

        Args:
            wallet_id: Target wallet ID
            max_per_minute: Max txs per minute
            max_per_hour: Max txs per hour
            max_per_day: Max txs per day
            name: Custom name for the guard
        """
        from algopay.guards.rate_limit import RateLimitGuard

        guard = RateLimitGuard(
            max_per_minute=max_per_minute,
            max_per_hour=max_per_hour,
            max_per_day=max_per_day,
            name=name,
        )
        await self._guard_manager.add_guard(wallet_id, guard)

    async def add_confirm_guard(
        self,
        wallet_id: str,
        threshold: str | Decimal | None = None,
        always_confirm: bool = False,
        name: str = "confirm",
    ) -> None:
        """
        Add a confirmation guard to a wallet (Human-in-the-Loop).

        Payments above the threshold require explicit confirmation via callback
        or external handling (e.g., webhook approval).

        Args:
            wallet_id: Target wallet ID
            threshold: Amount above which confirmation is required
            always_confirm: If True, require confirmation for ALL payments
            name: Custom name for the guard
        """
        from algopay.guards.confirm import ConfirmGuard

        t_threshold = Decimal(str(threshold)) if threshold else None

        guard = ConfirmGuard(threshold=t_threshold, always_confirm=always_confirm, name=name)
        await self._guard_manager.add_guard(wallet_id, guard)

    async def add_confirm_guard_for_set(
        self,
        wallet_set_id: str,
        threshold: str | Decimal | None = None,
        always_confirm: bool = False,
        name: str = "confirm",
    ) -> None:
        """
        Add a confirmation guard to a wallet set (applies to ALL wallets in the set).

        Args:
            wallet_set_id: Target wallet set ID
            threshold: Amount above which confirmation is required
            always_confirm: If True, require confirmation for ALL payments
            name: Custom name for the guard
        """
        from algopay.guards.confirm import ConfirmGuard

        t_threshold = Decimal(str(threshold)) if threshold else None

        guard = ConfirmGuard(threshold=t_threshold, always_confirm=always_confirm, name=name)
        await self._guard_manager.add_guard_for_set(wallet_set_id, guard)

    async def add_rate_limit_guard_for_set(
        self,
        wallet_set_id: str,
        max_per_minute: int | None = None,
        max_per_hour: int | None = None,
        max_per_day: int | None = None,
        name: str = "rate_limit",
    ) -> None:
        """
        Add a rate limit guard to a wallet set (applies to ALL wallets in the set).

        Args:
            wallet_set_id: Target wallet set ID
            max_per_minute: Max txs per minute
            max_per_hour: Max txs per hour
            max_per_day: Max txs per day
            name: Custom name for the guard
        """
        from algopay.guards.rate_limit import RateLimitGuard

        guard = RateLimitGuard(
            max_per_minute=max_per_minute,
            max_per_hour=max_per_hour,
            max_per_day=max_per_day,
            name=name,
        )
        await self._guard_manager.add_guard_for_set(wallet_set_id, guard)

    async def add_recipient_guard_for_set(
        self,
        wallet_set_id: str,
        mode: str = "whitelist",
        addresses: list[str] | None = None,
        patterns: list[str] | None = None,
        domains: list[str] | None = None,
        name: str = "recipient",
    ) -> None:
        """
        Add a Recipient Access Control guard to a wallet set.

        Args:
            wallet_set_id: Target wallet set ID
            mode: 'whitelist' (allow specific) or 'blacklist' (block specific)
            addresses: List of allowed/blocked addresses
            patterns: List of regex patterns
            domains: List of allowed/blocked domains (for x402/URLs)
            name: Guard name
        """
        from algopay.guards.recipient import RecipientGuard

        guard = RecipientGuard(
            mode=mode, addresses=addresses, patterns=patterns, domains=domains, name=name
        )
        await self._guard_manager.add_guard_for_set(wallet_set_id, guard)

    async def list_guards(self, wallet_id: str) -> list[str]:
        """
        List all guard names registered for a wallet.

        Args:
            wallet_id: Target wallet ID

        Returns:
            List of guard names
        """
        return await self._guard_manager.list_wallet_guard_names(wallet_id)

    async def list_guards_for_set(self, wallet_set_id: str) -> list[str]:
        """
        List all guard names registered for a wallet set.

        Args:
            wallet_set_id: Target wallet set ID

        Returns:
            List of guard names
        """
        return await self._guard_manager.list_wallet_set_guard_names(wallet_set_id)

