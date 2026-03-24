"""X402Adapter HTTP paths (respx)."""

from __future__ import annotations

from decimal import Decimal
from unittest.mock import MagicMock

import httpx
import pytest

from algopay.core.config import Config
from algopay.core.types import Network
from algopay.protocols.x402 import X402Adapter
from algopay.wallet.service import WalletService


@pytest.fixture
def x402_deps():
    cfg = Config.from_env(network=Network.ALGORAND_TESTNET)
    chain = MagicMock()
    chain.account_info.return_value = {"amount": 10_000_000, "assets": []}
    ws = WalletService(cfg, chain)
    return cfg, ws


@pytest.mark.asyncio
async def test_x402_execute_non_402_is_success(respx_mock, x402_deps):
    cfg, ws = x402_deps
    url = "https://x402.unit.test/resource"
    respx_mock.get(url).mock(return_value=httpx.Response(200, json={"ok": True}))
    adapter = X402Adapter(cfg, ws, http_client=httpx.AsyncClient())
    result = await adapter.execute("w1", url, Decimal("1"))
    assert result.success
    assert result.metadata.get("note") == "No 402"


@pytest.mark.asyncio
async def test_x402_execute_invalid_json_on_402(respx_mock, x402_deps):
    cfg, ws = x402_deps
    url = "https://x402.unit.test/bad-json"
    respx_mock.get(url).mock(return_value=httpx.Response(402, text="not-json"))
    adapter = X402Adapter(cfg, ws, http_client=httpx.AsyncClient())
    result = await adapter.execute("w1", url, Decimal("1"))
    assert not result.success
    assert "Invalid 402 payment requirements" in (result.error or "")
    assert "x402Version" in (result.error or "") or "Missing" in (result.error or "")


@pytest.mark.asyncio
async def test_x402_simulate_non_url(x402_deps):
    cfg, ws = x402_deps
    adapter = X402Adapter(cfg, ws)
    out = await adapter.simulate("w1", "not-a-url", Decimal("1"))
    assert not out["would_succeed"]


@pytest.mark.asyncio
async def test_x402_simulate_200(respx_mock, x402_deps):
    cfg, ws = x402_deps
    url = "https://x402.unit.test/free"
    respx_mock.get(url).mock(return_value=httpx.Response(200))
    adapter = X402Adapter(cfg, ws, http_client=httpx.AsyncClient())
    out = await adapter.simulate("w1", url, Decimal("1"))
    assert out["would_succeed"]
