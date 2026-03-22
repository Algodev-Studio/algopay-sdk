"""High-level wallet operations on Algorand."""

from __future__ import annotations

import base64
import time
from dataclasses import dataclass
from decimal import Decimal

from algosdk import encoding, transaction

from algopay.core.algorand_client import AlgorandClient
from algopay.core.config import Config
from algopay.core.exceptions import InsufficientBalanceError, WalletError
from algopay.core.types import (
    AccountType,
    Balance,
    FeeLevel,
    Network,
    TokenInfo,
    TransactionInfo,
    TransactionState,
    WalletInfo,
    WalletSetInfo,
)
from algopay.wallet.repository import WalletRecord, WalletRepository


@dataclass
class TransferResult:
    success: bool
    transaction: TransactionInfo | None = None
    tx_hash: str | None = None
    error: str | None = None

    @property
    def id(self) -> str | None:
        return self.transaction.id if self.transaction else None


def _fee_level_multiplier(level: FeeLevel) -> int:
    return {FeeLevel.LOW: 1, FeeLevel.MEDIUM: 2, FeeLevel.HIGH: 4}[level]


class WalletService:
    def __init__(
        self,
        config: Config,
        chain: AlgorandClient | None = None,
        repository: WalletRepository | None = None,
    ) -> None:
        self._config = config
        self._chain = chain or AlgorandClient(config)
        self._repo = repository or WalletRepository()
        self._wallet_cache: dict[str, WalletInfo] = {}

    @property
    def repository(self) -> WalletRepository:
        return self._repo

    def _record_to_info(self, rec: WalletRecord) -> WalletInfo:
        return WalletInfo(
            id=rec.id,
            address=rec.address,
            blockchain=rec.network_caip2,
            state=rec.state,
            wallet_set_id=rec.wallet_set_id,
            account_type=AccountType.EOA,
            name=rec.name,
            create_date=rec.created_at,
        )

    # --- wallet sets ---
    def create_wallet_set(self, name: str | None = None) -> WalletSetInfo:
        return self._repo.create_wallet_set(name or "AlgoPay Wallet Set")

    def list_wallet_sets(self) -> list[WalletSetInfo]:
        return self._repo.list_wallet_sets()

    def get_wallet_set(self, wallet_set_id: str) -> WalletSetInfo:
        ws = self._repo.get_wallet_set(wallet_set_id)
        if not ws:
            raise WalletError(f"Wallet set not found: {wallet_set_id}")
        return ws

    # --- wallets ---
    def create_wallet(
        self,
        wallet_set_id: str,
        blockchain: Network | str | None = None,
        account_type: AccountType = AccountType.EOA,
        name: str | None = None,
    ) -> WalletInfo:
        net = self._config.network if blockchain is None else (
            blockchain if isinstance(blockchain, Network) else Network.from_string(str(blockchain))
        )
        rec = self._repo.create_wallet(wallet_set_id, net.to_caip2(), name=name)
        info = self._record_to_info(rec)
        self._wallet_cache[info.id] = info
        return info

    def create_wallets(
        self,
        wallet_set_id: str,
        count: int,
        blockchain: Network | str | None = None,
        account_type: AccountType = AccountType.EOA,
    ) -> list[WalletInfo]:
        return [self.create_wallet(wallet_set_id, blockchain, account_type) for _ in range(count)]

    def get_wallet(self, wallet_id: str) -> WalletInfo:
        if wallet_id in self._wallet_cache:
            return self._wallet_cache[wallet_id]
        rec = self._repo.get_wallet(wallet_id)
        if not rec:
            raise WalletError(f"Wallet not found: {wallet_id}", wallet_id=wallet_id)
        info = self._record_to_info(rec)
        self._wallet_cache[wallet_id] = info
        return info

    def list_wallets(self, wallet_set_id: str | None = None, blockchain: object | None = None) -> list[WalletInfo]:
        recs = self._repo.list_wallets(wallet_set_id)
        return [self._record_to_info(r) for r in recs]

    def get_private_key(self, wallet_id: str) -> bytes:
        return self._repo.get_private_key(wallet_id)

    # --- balances ---
    def _micro_algo(self, wallet_id: str) -> int:
        w = self.get_wallet(wallet_id)
        info = self._chain.account_info(w.address)
        return int(info.get("amount", 0))

    def get_balances(self, wallet_id: str) -> list[Balance]:
        w = self.get_wallet(wallet_id)
        info = self._chain.account_info(w.address)
        assets = info.get("assets", []) or []
        balances: list[Balance] = []
        for a in assets:
            aid = a["asset-id"]
            amt = Decimal(a.get("amount", 0))
            if aid == self._config.usdc_asa_id:
                balances.append(
                    Balance(
                        amount=amt / Decimal(10**6),
                        token=TokenInfo(
                            id=str(aid),
                            blockchain=w.blockchain,
                            symbol="USDC",
                            name="USDC",
                            decimals=6,
                        ),
                    )
                )
        return balances

    def get_usdc_balance(self, wallet_id: str) -> Balance | None:
        for b in self.get_balances(wallet_id):
            if b.token.symbol == "USDC":
                return b
        return None

    def get_usdc_balance_amount(self, wallet_id: str) -> Decimal:
        b = self.get_usdc_balance(wallet_id)
        return b.amount if b else Decimal("0")

    def ensure_sufficient_balance(self, wallet_id: str, required: Decimal) -> Balance:
        b = self.get_usdc_balance(wallet_id)
        cur = b.amount if b else Decimal("0")
        if cur < required:
            raise InsufficientBalanceError(
                "Insufficient USDC balance",
                current_balance=cur,
                required_amount=required,
                wallet_id=wallet_id,
            )
        return b  # type: ignore[return-value]

    def opt_in_usdc(self, wallet_id: str, fee_level: FeeLevel = FeeLevel.MEDIUM) -> str:
        """Submit 0-amount axfer to opt in to configured USDC ASA. Returns txid."""
        w = self.get_wallet(wallet_id)
        sk = self.get_private_key(wallet_id)
        sp = self._chain.suggested_params()
        mf = sp.min_fee or 1000
        fee = mf * _fee_level_multiplier(fee_level)
        nsp = transaction.SuggestedParams(
            fee=fee,
            flat_fee=True,
            first=sp.first,
            last=sp.last,
            gh=sp.gh,
            gen=sp.gen,
            min_fee=sp.min_fee,
        )
        txn = transaction.AssetTransferTxn(
            sender=w.address,
            sp=nsp,
            receiver=w.address,
            amt=0,
            index=self._config.usdc_asa_id,
        )
        stxn = txn.sign(sk)
        raw = base64.b64decode(encoding.msgpack_encode(stxn))
        txid = self._chain.send_transaction(raw)
        return txid

    def transfer(
        self,
        wallet_id: str,
        destination_address: str,
        amount: Decimal | str,
        fee_level: FeeLevel = FeeLevel.MEDIUM,
        check_balance: bool = True,
        wait_for_completion: bool = False,
        timeout_seconds: float | None = None,
        idempotency_key: str | None = None,
    ) -> TransferResult:
        amount_decimal = Decimal(str(amount))
        if check_balance:
            self.ensure_sufficient_balance(wallet_id, amount_decimal)

        w = self.get_wallet(wallet_id)
        sk = self.get_private_key(wallet_id)
        sp = self._chain.suggested_params()
        mf = sp.min_fee or 1000
        fee = mf * _fee_level_multiplier(fee_level)
        nsp = transaction.SuggestedParams(
            fee=fee,
            flat_fee=True,
            first=sp.first,
            last=sp.last,
            gh=sp.gh,
            gen=sp.gen,
            min_fee=sp.min_fee,
        )
        micro = int(amount_decimal * Decimal(10**6))
        txn = transaction.AssetTransferTxn(
            sender=w.address,
            sp=nsp,
            receiver=destination_address,
            amt=micro,
            index=self._config.usdc_asa_id,
        )
        stxn = txn.sign(sk)
        raw = base64.b64decode(encoding.msgpack_encode(stxn))
        txid = self._chain.send_transaction(raw)
        tx_info = TransactionInfo(
            id=txid,
            state=TransactionState.PENDING,
            blockchain=w.blockchain,
            tx_hash=txid,
            wallet_id=wallet_id,
            source_address=w.address,
            destination_address=destination_address,
        )
        if wait_for_completion:
            timeout = timeout_seconds or self._config.transaction_poll_timeout
            tx_info = self._wait_for_confirmation(txid, timeout)
        return TransferResult(success=True, transaction=tx_info, tx_hash=txid)

    def _wait_for_confirmation(self, txid: str, timeout_seconds: float) -> TransactionInfo:
        deadline = time.time() + timeout_seconds
        poll = self._config.transaction_poll_interval
        while time.time() < deadline:
            try:
                pending = self._chain.pending_transaction_info(txid)
                if "confirmed-round" in pending:
                    return TransactionInfo(
                        id=txid,
                        state=TransactionState.COMPLETE,
                        tx_hash=txid,
                    )
                if pending.get("pool-error"):
                    return TransactionInfo(
                        id=txid,
                        state=TransactionState.FAILED,
                        tx_hash=txid,
                        error_reason=str(pending.get("pool-error")),
                    )
            except Exception:
                pass
            time.sleep(poll)
        return TransactionInfo(id=txid, state=TransactionState.PENDING, tx_hash=txid)

    def list_transactions(self, wallet_id: str | None = None, blockchain: object | None = None) -> list[TransactionInfo]:
        """Best-effort: recent USDC axfers from indexer for wallet address."""
        if not wallet_id:
            return []
        w = self.get_wallet(wallet_id)
        try:
            resp = self._chain.indexer.search_asset_transactions(
                asset_id=self._config.usdc_asa_id,
                address=w.address,
                limit=20,
            )
        except Exception:
            return []
        txs = resp.get("transactions", []) or []
        out: list[TransactionInfo] = []
        for t in txs:
            tid = t.get("id")
            out.append(
                TransactionInfo(
                    id=tid,
                    state=TransactionState.COMPLETE,
                    tx_hash=tid,
                    wallet_id=wallet_id,
                )
            )
        return out

    def create_agent_wallet(
        self,
        agent_name: str,
        blockchain: Network | str | None = None,
        count: int = 1,
    ) -> tuple[WalletSetInfo, WalletInfo | list[WalletInfo]]:
        name = f"agent-{agent_name}"
        existing = next((s for s in self.list_wallet_sets() if s.name == name), None)
        ws = existing or self.create_wallet_set(name)
        if count == 1:
            return ws, self.create_wallet(ws.id, blockchain)
        return ws, self.create_wallets(ws.id, count, blockchain)
