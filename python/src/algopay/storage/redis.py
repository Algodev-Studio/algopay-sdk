"""Redis storage backend."""

from __future__ import annotations

import json
import os
from typing import Any

from algopay.storage.base import StorageBackend, register_storage_backend


class RedisStorage(StorageBackend):
    def __init__(
        self,
        redis_url: str | None = None,
        prefix: str = "algopay",
    ) -> None:
        self._redis_url = redis_url or os.environ.get(
            "ALGOPAY_REDIS_URL",
            "redis://localhost:6379/0",
        )
        self._prefix = prefix
        self._client = None

    def _get_client(self):
        if self._client is None:
            import redis.asyncio as redis

            self._client = redis.from_url(self._redis_url, decode_responses=True)
        return self._client

    def _make_key(self, collection: str, key: str) -> str:
        return f"{self._prefix}:{collection}:{key}"

    async def save(self, collection: str, key: str, data: dict[str, Any]) -> None:
        client = self._get_client()
        await client.set(self._make_key(collection, key), json.dumps(data))
        await client.sadd(f"{self._prefix}:{collection}:_index", key)

    async def get(self, collection: str, key: str) -> dict[str, Any] | None:
        client = self._get_client()
        raw = await client.get(self._make_key(collection, key))
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"value": raw}

    async def delete(self, collection: str, key: str) -> bool:
        client = self._get_client()
        n = await client.delete(self._make_key(collection, key))
        await client.srem(f"{self._prefix}:{collection}:_index", key)
        return n > 0

    async def atomic_add(self, collection: str, key: str, amount: str) -> str:
        client = self._get_client()
        redis_key = self._make_key(collection, key)
        new_val = await client.incrbyfloat(redis_key, float(amount))
        await client.sadd(f"{self._prefix}:{collection}:_index", key)
        return str(new_val)

    async def query(
        self,
        collection: str,
        filters: dict[str, Any] | None = None,
        limit: int | None = None,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        client = self._get_client()
        keys = await client.smembers(f"{self._prefix}:{collection}:_index")
        results: list[dict[str, Any]] = []
        for key in keys:
            data = await self.get(collection, key)
            if data is None:
                continue
            if filters and not all(data.get(fk) == fv for fk, fv in filters.items()):
                continue
            data["_key"] = key
            results.append(data)
        results = results[offset:]
        if limit is not None:
            results = results[:limit]
        return results

    async def update(self, collection: str, key: str, data: dict[str, Any]) -> bool:
        existing = await self.get(collection, key)
        if existing is None:
            return False
        existing.update(data)
        await self.save(collection, key, existing)
        return True

    async def count(self, collection: str, filters: dict[str, Any] | None = None) -> int:
        if filters:
            return len(await self.query(collection, filters))
        return await self._get_client().scard(f"{self._prefix}:{collection}:_index")

    async def clear(self, collection: str) -> int:
        client = self._get_client()
        index_key = f"{self._prefix}:{collection}:_index"
        keys = await client.smembers(index_key)
        for key in keys:
            await self.delete(collection, key)
        return len(keys)

    async def health_check(self) -> bool:
        try:
            await self._get_client().ping()
            return True
        except Exception:
            return False


register_storage_backend("redis", RedisStorage)
