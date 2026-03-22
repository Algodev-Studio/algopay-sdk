"""Abstract storage backend for ledger, guards, intents."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

_STORAGE_BACKENDS: dict[str, type[StorageBackend]] = {}


class StorageBackend(ABC):
    @abstractmethod
    async def save(self, collection: str, key: str, data: dict[str, Any]) -> None:
        ...

    @abstractmethod
    async def get(self, collection: str, key: str) -> dict[str, Any] | None:
        ...

    @abstractmethod
    async def delete(self, collection: str, key: str) -> bool:
        ...

    @abstractmethod
    async def query(
        self,
        collection: str,
        filters: dict[str, Any] | None = None,
        limit: int | None = None,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        ...

    @abstractmethod
    async def update(self, collection: str, key: str, data: dict[str, Any]) -> bool:
        ...

    @abstractmethod
    async def count(self, collection: str, filters: dict[str, Any] | None = None) -> int:
        ...

    @abstractmethod
    async def clear(self, collection: str) -> int:
        ...

    @abstractmethod
    async def atomic_add(self, collection: str, key: str, amount: str) -> str:
        ...

    async def health_check(self) -> bool:
        return True


def register_storage_backend(name: str, backend_class: type[StorageBackend]) -> None:
    _STORAGE_BACKENDS[name] = backend_class


def get_storage_backend(name: str) -> type[StorageBackend] | None:
    return _STORAGE_BACKENDS.get(name)


def list_storage_backends() -> list[str]:
    return list(_STORAGE_BACKENDS.keys())
