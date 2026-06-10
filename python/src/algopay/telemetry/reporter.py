"""Fire-and-forget event reporter that posts SDK lifecycle events to the hosted console."""

from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from typing import Any

import httpx

import algopay

_EVENTS_PATH = "/api/sdk/events"


class TelemetryReporter:
    """Sends structured events to the AlgoPay console.

    Reads ``ALGOPAY_CONSOLE_URL`` and ``ALGOPAY_API_KEY`` from the
    environment.  When either is missing the reporter is inert — every
    public method is a silent no-op so callers never need to branch.
    """

    def __init__(
        self,
        console_url: str | None = None,
        api_key: str | None = None,
    ) -> None:
        self._console_url = (
            console_url or os.environ.get("ALGOPAY_CONSOLE_URL", "")
        ).rstrip("/")
        self._api_key = api_key or os.environ.get("ALGOPAY_API_KEY", "")
        self._enabled = bool(self._console_url and self._api_key)
        self._events_sent = 0

    @property
    def enabled(self) -> bool:
        return self._enabled

    @property
    def events_sent(self) -> int:
        return self._events_sent

    def emit(self, event_type: str, payload: dict[str, Any]) -> None:
        """Schedule an event POST without blocking the caller.

        Safe to call from any async context.  Failures are silently
        swallowed so they never interfere with payment execution.
        """
        if not self._enabled:
            return

        event = {
            "eventType": event_type,
            "sdkVersion": algopay.__version__,
            "sdkLanguage": "python",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **payload,
        }

        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._post(event))
        except RuntimeError:
            pass

    async def _post(self, event: dict[str, Any]) -> None:
        url = f"{self._console_url}{_EVENTS_PATH}"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(url, json=event, headers=headers)
            self._events_sent += 1
        except Exception:
            pass
