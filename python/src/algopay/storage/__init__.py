"""Storage backends for AlgoPay."""

from __future__ import annotations

import os

from algopay.storage.base import (
    StorageBackend,
    get_storage_backend,
    list_storage_backends,
    register_storage_backend,
)
from algopay.storage.memory import InMemoryStorage

try:
    from algopay.storage.redis import RedisStorage
except ImportError:
    RedisStorage = None  # type: ignore[misc, assignment]


def get_storage(backend_name: str | None = None, redis_url: str | None = None) -> StorageBackend:
    name = backend_name or os.environ.get("ALGOPAY_STORAGE_BACKEND", "memory")
    if name == "redis":
        if RedisStorage is None:
            raise ValueError("Redis backend requested but redis package is not available")
        return RedisStorage(redis_url=redis_url)
    cls = get_storage_backend(name)
    if cls is None:
        raise ValueError(
            f"Unknown storage backend: {name!r}. Available: {', '.join(list_storage_backends())}"
        )
    return cls()


__all__ = [
    "StorageBackend",
    "InMemoryStorage",
    "RedisStorage",
    "get_storage",
    "get_storage_backend",
    "list_storage_backends",
    "register_storage_backend",
]
