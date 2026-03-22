"""Batch payment processor."""

from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING

from algopay.core.types import (
    BatchPaymentResult,
    PaymentMethod,
    PaymentRequest,
    PaymentResult,
    PaymentStatus,
)

if TYPE_CHECKING:
    from algopay.payment.router import PaymentRouter


class BatchProcessor:
    def __init__(self, router: PaymentRouter) -> None:
        self._router = router

    async def process(self, requests: list[PaymentRequest], concurrency: int = 5) -> BatchPaymentResult:
        sem = asyncio.Semaphore(concurrency)

        async def _bounded_pay(req: PaymentRequest) -> PaymentResult:
            async with sem:
                return await self._router.pay(
                    wallet_id=req.wallet_id,
                    recipient=req.recipient,
                    amount=req.amount,
                    purpose=req.purpose,
                    idempotency_key=req.idempotency_key,
                    destination_chain=req.destination_chain,
                    **req.metadata,
                )

        results = await asyncio.gather(*[_bounded_pay(req) for req in requests], return_exceptions=True)

        final: list[PaymentResult] = []
        for i, res in enumerate(results):
            if isinstance(res, PaymentResult):
                final.append(res)
            else:
                req = requests[i]
                final.append(
                    PaymentResult(
                        success=False,
                        transaction_id=None,
                        blockchain_tx=None,
                        amount=req.amount,
                        recipient=req.recipient,
                        method=PaymentMethod.TRANSFER,
                        status=PaymentStatus.FAILED,
                        error=str(res),
                    )
                )

        success_count = sum(1 for r in final if r.success)
        tx_ids = [r.transaction_id for r in final if r.transaction_id]
        return BatchPaymentResult(
            total_count=len(final),
            success_count=success_count,
            failed_count=len(final) - success_count,
            results=final,
            transaction_ids=[t for t in tx_ids if t],
        )
