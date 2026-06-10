"""TelemetryReporter contract tests."""

from __future__ import annotations

import asyncio

import pytest
import respx
from httpx import Response

from algopay.telemetry.reporter import TelemetryReporter


def test_telemetry_inert_without_config():
    reporter = TelemetryReporter(console_url="", api_key="")
    assert not reporter.enabled
    reporter.emit("payment_started", {"walletId": "w1"})
    assert reporter.events_sent == 0


def test_telemetry_inert_with_partial_config():
    reporter = TelemetryReporter(console_url="http://localhost:3000", api_key="")
    assert not reporter.enabled
    reporter.emit("payment_started", {})
    assert reporter.events_sent == 0


@pytest.mark.asyncio
@respx.mock
async def test_telemetry_posts_event_when_enabled():
    route = respx.post("http://console.test/api/sdk/events").mock(
        return_value=Response(200, json={"ok": True})
    )
    reporter = TelemetryReporter(
        console_url="http://console.test",
        api_key="test-key-123",
    )
    assert reporter.enabled
    await reporter._post(
        {
            "eventType": "payment_completed",
            "sdkVersion": "0.0.0",
            "sdkLanguage": "python",
            "walletId": "w1",
            "amount": "1.50",
            "recipient": "ADDR",
        }
    )
    assert reporter.events_sent == 1
    assert route.called
    request = route.calls.last.request
    assert request.headers["authorization"] == "Bearer test-key-123"
    body = request.read().decode()
    assert "payment_completed" in body
    assert "python" in body


@pytest.mark.asyncio
@respx.mock
async def test_telemetry_emit_schedules_background_post():
    route = respx.post("http://console.test/api/sdk/events").mock(
        return_value=Response(200, json={"ok": True})
    )
    reporter = TelemetryReporter(
        console_url="http://console.test",
        api_key="test-key-123",
    )
    reporter.emit(
        "payment_completed",
        {"walletId": "w1", "amount": "1.50", "recipient": "ADDR"},
    )
    await asyncio.sleep(0.2)
    assert route.called
    assert reporter.events_sent == 1


@pytest.mark.asyncio
@respx.mock
async def test_telemetry_swallows_network_errors():
    respx.post("http://console.test/api/sdk/events").mock(side_effect=ConnectionError("offline"))
    reporter = TelemetryReporter(
        console_url="http://console.test",
        api_key="test-key-123",
    )
    await reporter._post({"eventType": "payment_failed", "guardBlockReason": "budget"})
    assert reporter.events_sent == 0
