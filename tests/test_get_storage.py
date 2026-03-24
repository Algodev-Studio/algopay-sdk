"""get_storage() factory."""

from __future__ import annotations

from unittest.mock import patch

import pytest

import algopay.storage as storage_pkg
from algopay.storage import get_storage


def test_get_storage_explicit_memory():
    s = get_storage("memory")
    assert s.__class__.__name__ == "InMemoryStorage"


def test_get_storage_unknown_raises():
    with pytest.raises(ValueError, match="Unknown storage backend"):
        get_storage("not-a-backend")


@pytest.mark.asyncio
async def test_get_storage_redis_env_uses_redis_backend(monkeypatch):
    import fakeredis.aioredis

    class FakeRedisStorage(storage_pkg.RedisStorage):
        def _get_client(self):
            if self._client is None:
                self._client = fakeredis.aioredis.FakeRedis(decode_responses=True)
            return self._client

    monkeypatch.setattr(storage_pkg, "RedisStorage", FakeRedisStorage)
    with patch.dict("os.environ", {"ALGOPAY_STORAGE_BACKEND": "redis"}, clear=False):
        backend = storage_pkg.get_storage()
    await backend.save("c", "k", {"x": 2})
    assert (await backend.get("c", "k"))["x"] == 2
