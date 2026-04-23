"""
JustificationGuard — require non-empty payment purpose (Locus-style justification).
"""

from __future__ import annotations

from algopay.guards.base import Guard, GuardResult, PaymentContext


class JustificationGuard(Guard):
    """Block payments when `purpose` is missing or shorter than `min_length` (after strip)."""

    def __init__(self, min_length: int = 1, name: str = "justification") -> None:
        if min_length < 1:
            raise ValueError("min_length must be >= 1")
        self._name = name
        self._min_length = min_length

    @property
    def name(self) -> str:
        return self._name

    @property
    def min_length(self) -> int:
        return self._min_length

    async def check(self, context: PaymentContext) -> GuardResult:
        raw = (context.purpose or "").strip()
        if len(raw) < self._min_length:
            return GuardResult(
                allowed=False,
                reason=(
                    f"Payment purpose (justification) required: min length {self._min_length}, "
                    f"got {len(raw)!r}"
                ),
                guard_name=self.name,
                metadata={"purpose_len": len(raw)},
            )
        return GuardResult(allowed=True, guard_name=self.name)
