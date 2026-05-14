"""Configuration for AlgoPay."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

from algopay.core.types import Network


def _env(name: str, default: str | None = None) -> str | None:
    return os.environ.get(name, default)


@dataclass(frozen=True)
class Config:
    """SDK configuration for Algorand."""

    network: Network = Network.ALGORAND_TESTNET
    algod_url: str = ""
    indexer_url: str = ""
    usdc_asa_id: int = 0
    storage_backend: str = "memory"
    redis_url: str | None = None
    log_level: str = "INFO"
    http_timeout: float = 30.0
    request_timeout: float = 30.0
    transaction_poll_interval: float = 2.0
    transaction_poll_timeout: float = 120.0
    env: str = "development"
    default_wallet_id: str | None = None

    @property
    def network_caip2(self) -> str:
        return self.network.to_caip2()

    @classmethod
    def from_env(cls, **overrides: Any) -> Config:
        net_raw = overrides.get("network") or _env("ALGOPAY_NETWORK", "algorand-testnet")
        network = net_raw if isinstance(net_raw, Network) else Network.from_string(str(net_raw))

        usdc = overrides.get("usdc_asa_id")
        if usdc is None and _env("ALGOPAY_USDC_ASA_ID"):
            usdc = int(_env("ALGOPAY_USDC_ASA_ID", "0") or 0)
        if not usdc:
            usdc = network.usdc_asa_id()

        algod = overrides.get("algod_url") or _env("ALGOD_URL") or _env("ALGOPAY_ALGOD_URL") or ""
        indexer = overrides.get("indexer_url") or _env("INDEXER_URL") or _env("ALGOPAY_INDEXER_URL") or ""

        if not algod or not indexer:
            if network == Network.ALGORAND_MAINNET:
                algod = algod or "https://mainnet-api.algonode.cloud"
                indexer = indexer or "https://mainnet-idx.algonode.cloud"
            else:
                algod = algod or "https://testnet-api.algonode.cloud"
                indexer = indexer or "https://testnet-idx.algonode.cloud"

        return cls(
            network=network,
            algod_url=str(algod),
            indexer_url=str(indexer),
            usdc_asa_id=int(usdc),
            storage_backend=str(overrides.get("storage_backend") or _env("ALGOPAY_STORAGE_BACKEND", "memory")),
            redis_url=overrides.get("redis_url") or _env("ALGOPAY_REDIS_URL"),
            log_level=str(overrides.get("log_level") or _env("ALGOPAY_LOG_LEVEL", "INFO")),
            default_wallet_id=overrides.get("default_wallet_id") or _env("ALGOPAY_DEFAULT_WALLET"),
            env=str(overrides.get("env") or _env("ALGOPAY_ENV", "development")),
        )

    def with_updates(self, **updates: Any) -> Config:
        fields = {
            "network": self.network,
            "algod_url": self.algod_url,
            "indexer_url": self.indexer_url,
            "usdc_asa_id": self.usdc_asa_id,
            "storage_backend": self.storage_backend,
            "redis_url": self.redis_url,
            "log_level": self.log_level,
            "default_wallet_id": self.default_wallet_id,
            "env": self.env,
        }
        fields.update(updates)
        return Config(**fields)


# For guards PaymentContext - import from guards.base in omniagentpay - we'll define in guards
