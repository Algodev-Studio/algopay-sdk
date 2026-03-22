"""In-memory wallet and wallet-set repository (replace with Redis-backed later)."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from algopay.core.types import WalletSetInfo, WalletState


@dataclass
class WalletRecord:
    id: str
    address: str
    private_key: bytes  # 64-byte secret
    wallet_set_id: str
    network_caip2: str
    state: WalletState = WalletState.LIVE
    name: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class WalletRepository:
    """Stores wallet sets and wallet key material (memory only)."""

    def __init__(self) -> None:
        self._sets: dict[str, dict[str, Any]] = {}
        self._wallets: dict[str, WalletRecord] = {}

    def create_wallet_set(self, name: str | None) -> WalletSetInfo:
        sid = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        self._sets[sid] = {"name": name, "created": now}
        return WalletSetInfo(id=sid, name=name, create_date=now, update_date=now)

    def list_wallet_sets(self) -> list[WalletSetInfo]:
        out: list[WalletSetInfo] = []
        for sid, data in self._sets.items():
            out.append(
                WalletSetInfo(
                    id=sid,
                    name=data.get("name"),
                    create_date=data.get("created"),
                    update_date=data.get("created"),
                )
            )
        return out

    def get_wallet_set(self, wallet_set_id: str) -> WalletSetInfo | None:
        data = self._sets.get(wallet_set_id)
        if not data:
            return None
        return WalletSetInfo(
            id=wallet_set_id,
            name=data.get("name"),
            create_date=data.get("created"),
            update_date=data.get("created"),
        )

    def create_wallet(
        self,
        wallet_set_id: str,
        network_caip2: str,
        name: str | None = None,
    ) -> WalletRecord:
        if wallet_set_id not in self._sets:
            raise KeyError(f"Unknown wallet_set_id: {wallet_set_id}")
        import base64

        from algosdk import account

        sk_b64, addr = account.generate_account()
        private_key = base64.b64decode(sk_b64)
        wid = str(uuid.uuid4())
        rec = WalletRecord(
            id=wid,
            address=addr,
            private_key=private_key,
            wallet_set_id=wallet_set_id,
            network_caip2=network_caip2,
            name=name,
        )
        self._wallets[wid] = rec
        return rec

    def get_wallet(self, wallet_id: str) -> WalletRecord | None:
        return self._wallets.get(wallet_id)

    def list_wallets(
        self,
        wallet_set_id: str | None = None,
    ) -> list[WalletRecord]:
        wallets = list(self._wallets.values())
        if wallet_set_id:
            wallets = [w for w in wallets if w.wallet_set_id == wallet_set_id]
        return wallets

    def get_private_key(self, wallet_id: str) -> bytes:
        w = self._wallets.get(wallet_id)
        if not w:
            raise KeyError(wallet_id)
        return w.private_key
