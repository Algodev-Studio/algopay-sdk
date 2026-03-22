"""In-memory storage backend."""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from algopay.storage.base import StorageBackend, register_storage_backend


class InMemoryStorage(StorageBackend):
    def __init__(self) -> None:
        self._data: dict[str, dict[str, dict[str, Any]]] = {}

    def _ensure_collection(self, collection: str) -> dict[str, dict[str, Any]]:
        if collection not in self._data:
            self._data[collection] = {}
        return self._data[collection]

    async def save(self, collection: str, key: str, data: dict[str, Any]) -> None:
        coll = self._ensure_collection(collection)
        coll[key] = deepcopy(data)

    async def get(self, collection: str, key: str) -> dict[str, Any] | None:
        coll = self._ensure_collection(collection)
        data = coll.get(key)
        return deepcopy(data) if data else None

    async def delete(self, collection: str, key: str) -> bool:
        coll = self._ensure_collection(collection)
        if key in coll:
            del coll[key]
            return True
        return False

    async def query(
        self,
        collection: str,
        filters: dict[str, Any] | None = None,
        limit: int | None = None,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        coll = self._ensure_collection(collection)
        results = []
        for key, data in coll.items():
            if filters:
                match = all(data.get(fk) == fv for fk, fv in filters.items())
                if not match:
                    continue
            row = deepcopy(data)
            row["_key"] = key
            results.append(row)
        results = results[offset:]
        if limit is not None:
            results = results[:limit]
        return results

    async def update(self, collection: str, key: str, data: dict[str, Any]) -> bool:
        coll = self._ensure_collection(collection)
        if key not in coll:
            return False
        coll[key].update(deepcopy(data))
        return True

    async def count(self, collection: str, filters: dict[str, Any] | None = None) -> int:
        if filters:
            return len(await self.query(collection, filters))
        return len(self._ensure_collection(collection))

    async def clear(self, collection: str) -> int:
        coll = self._ensure_collection(collection)
        n = len(coll)
        coll.clear()
        return n

    async def atomic_add(self, collection: str, key: str, amount: str) -> str:
        from decimal import Decimal

        coll = self._ensure_collection(collection)
        cur = coll.get(key)
        if isinstance(cur, dict):
            current_dec = Decimal("0")
        else:
            current_dec = Decimal(str(cur)) if cur else Decimal("0")
        new_val = current_dec + Decimal(amount)
        coll[key] = str(new_val)
        return str(new_val)


register_storage_backend("memory", InMemoryStorage)
