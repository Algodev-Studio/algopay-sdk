"""x402 HTTP 402 client flow for Algorand (exact / AVM scheme)."""

from __future__ import annotations

import base64
import json
import re
from decimal import Decimal
from typing import TYPE_CHECKING, Any

import httpx
from x402 import max_amount, prefer_network, x402Client
from x402.mechanisms.avm.exact.register import register_exact_avm_client
from x402.schemas import parse_payment_required

from algopay.core.logging import get_logger
from algopay.core.types import FeeLevel, Network, PaymentMethod, PaymentResult, PaymentStatus
from algopay.protocols.base import ProtocolAdapter
from algopay.wallet.signer import AlgorandWalletSigner

if TYPE_CHECKING:
    from algopay.core.config import Config
    from algopay.wallet.service import WalletService

HEADER_PAYMENT_SIGNATURE = "PAYMENT-SIGNATURE"
HEADER_PAYMENT_RESPONSE = "PAYMENT-RESPONSE"
HEADER_PAYMENT_REQUIRED = "payment-required"
URL_PATTERN = re.compile(r"^https?://")


def _payment_required_dict_from_402(response: httpx.Response) -> dict[str, Any]:
    """
    x402 servers may return requirements in the JSON body or in a base64 ``payment-required`` header.
    """
    body: dict[str, Any] = {}
    try:
        raw = response.json()
        if isinstance(raw, dict) and raw.get("x402Version") is not None:
            body = raw
    except Exception:
        pass
    if not body or body.get("x402Version") is None:
        pr_hdr: str | None = None
        for key, val in response.headers.items():
            if key.lower() == HEADER_PAYMENT_REQUIRED:
                pr_hdr = val
                break
        if pr_hdr:
            body = json.loads(base64.b64decode(pr_hdr))
    return body


def _payment_required_for_network(body: dict[str, Any], network_caip2: str) -> dict[str, Any]:
    """Keep only ``accepts`` entries for this chain (multi-chain responses are common)."""
    acc = body.get("accepts")
    if not isinstance(acc, list):
        return body
    filtered = [
        a for a in acc if isinstance(a, dict) and str(a.get("network")) == network_caip2
    ]
    if not filtered:
        raise ValueError(f"No x402 accept for network {network_caip2!r}")
    return {**body, "accepts": filtered}


def _payment_payload_to_header(payload: Any) -> str:
    data = payload.model_dump(mode="json", by_alias=True)
    return base64.b64encode(json.dumps(data, separators=(",", ":")).encode()).decode()


class X402Adapter(ProtocolAdapter):
    def __init__(
        self,
        config: Config,
        wallet_service: WalletService,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        self._config = config
        self._wallet_service = wallet_service
        self._http_client = http_client
        self._logger = get_logger("x402")

    @property
    def method(self) -> PaymentMethod:
        return PaymentMethod.X402

    def supports(
        self,
        recipient: str,
        source_network: Network | str | None = None,
        destination_chain: Network | str | None = None,
        **kwargs: Any,
    ) -> bool:
        return bool(URL_PATTERN.match(recipient))

    async def _get_http_client(self) -> httpx.AsyncClient:
        if self._http_client is None:
            self._http_client = httpx.AsyncClient(timeout=self._config.http_timeout)
        return self._http_client

    def _build_x402_client(self, wallet_id: str, max_amount_usdc: Decimal) -> x402Client:
        sk = self._wallet_service.get_private_key(wallet_id)
        signer = AlgorandWalletSigner(sk)
        client = x402Client()
        caip2 = self._config.network_caip2
        client.register_policy(prefer_network(caip2))
        micro_max = int(max_amount_usdc * Decimal(10**6))
        if micro_max > 0:
            client.register_policy(max_amount(micro_max))
        register_exact_avm_client(client, signer, algod_url=self._config.algod_url)
        return client

    async def execute(
        self,
        wallet_id: str,
        recipient: str,
        amount: Decimal,
        fee_level: FeeLevel = FeeLevel.MEDIUM,
        idempotency_key: str | None = None,
        purpose: str | None = None,
        destination_chain: Network | str | None = None,
        source_network: Network | str | None = None,
        wait_for_completion: bool = False,
        timeout_seconds: float | None = None,
        **kwargs: Any,
    ) -> PaymentResult:
        url = recipient
        try:
            client_http = await self._get_http_client()
            response = await client_http.get(url)

            if response.status_code != 402:
                return PaymentResult(
                    success=True,
                    transaction_id=None,
                    blockchain_tx=None,
                    amount=Decimal("0"),
                    recipient=url,
                    method=self.method,
                    status=PaymentStatus.COMPLETED,
                    metadata={"http_status": response.status_code, "note": "No 402"},
                )

            try:
                body = _payment_required_dict_from_402(response)
                body = _payment_required_for_network(body, self._config.network_caip2)
                payment_required = parse_payment_required(body)
            except Exception as e:
                return PaymentResult(
                    success=False,
                    transaction_id=None,
                    blockchain_tx=None,
                    amount=amount,
                    recipient=url,
                    method=self.method,
                    status=PaymentStatus.FAILED,
                    error=f"Invalid 402 payment requirements: {e}",
                )
            x402_client = self._build_x402_client(wallet_id, amount)
            payment_payload = await x402_client.create_payment_payload(payment_required)

            accepted = payment_payload.accepted
            required_atomic = int(accepted.amount)
            required_usdc = Decimal(required_atomic) / Decimal(10**6)
            if required_usdc > amount:
                return PaymentResult(
                    success=False,
                    transaction_id=None,
                    blockchain_tx=None,
                    amount=required_usdc,
                    recipient=url,
                    method=self.method,
                    status=PaymentStatus.FAILED,
                    error=f"Required {required_usdc} > max {amount}",
                )

            balance = self._wallet_service.get_usdc_balance_amount(wallet_id)
            if balance < required_usdc:
                return PaymentResult(
                    success=False,
                    transaction_id=None,
                    blockchain_tx=None,
                    amount=required_usdc,
                    recipient=url,
                    method=self.method,
                    status=PaymentStatus.FAILED,
                    error=f"Insufficient USDC: {balance} < {required_usdc}",
                )

            header_val = _payment_payload_to_header(payment_payload)
            final_response = await client_http.get(
                url,
                headers={HEADER_PAYMENT_SIGNATURE: header_val},
            )

            if final_response.status_code == 200:
                try:
                    response_data = final_response.json()
                except Exception:
                    response_data = final_response.text
                tx_id = None
                pr_hdr = final_response.headers.get(HEADER_PAYMENT_RESPONSE)
                if pr_hdr:
                    try:
                        pr_dec = json.loads(base64.b64decode(pr_hdr))
                        tx_id = pr_dec.get("transaction")
                    except Exception:
                        pass
                return PaymentResult(
                    success=True,
                    transaction_id=tx_id,
                    blockchain_tx=tx_id,
                    amount=required_usdc,
                    recipient=url,
                    method=self.method,
                    status=PaymentStatus.COMPLETED,
                    resource_data=response_data,
                    metadata={
                        "http_status": final_response.status_code,
                        "payment_response_header": pr_hdr or "",
                    },
                )

            return PaymentResult(
                success=False,
                transaction_id=None,
                blockchain_tx=None,
                amount=required_usdc,
                recipient=url,
                method=self.method,
                status=PaymentStatus.FAILED,
                error=f"Rejected: HTTP {final_response.status_code}",
            )

        except Exception as e:
            self._logger.exception("x402 payment failed")
            return PaymentResult(
                success=False,
                transaction_id=None,
                blockchain_tx=None,
                amount=amount,
                recipient=url,
                method=self.method,
                status=PaymentStatus.FAILED,
                error=f"x402 error: {e}",
            )

    async def simulate(
        self,
        wallet_id: str,
        recipient: str,
        amount: Decimal,
        **kwargs: Any,
    ) -> dict[str, Any]:
        result: dict[str, Any] = {
            "method": self.method.value,
            "recipient": recipient,
            "amount": str(amount),
        }
        if not self.supports(recipient):
            result["would_succeed"] = False
            result["reason"] = f"Invalid URL: {recipient}"
            return result
        try:
            client_http = await self._get_http_client()
            response = await client_http.get(recipient)
            if response.status_code != 402:
                result["would_succeed"] = True
                result["http_status"] = response.status_code
                result["reason"] = "Resource does not require payment"
                return result
            body = _payment_required_dict_from_402(response)
            body = _payment_required_for_network(body, self._config.network_caip2)
            pr = parse_payment_required(body)
            req0 = pr.accepts[0]
            required_usdc = Decimal(int(req0.amount)) / Decimal(10**6)
            result["required_amount"] = str(required_usdc)
            result["payment_network"] = str(req0.network)
            if required_usdc <= amount:
                bal = self._wallet_service.get_usdc_balance_amount(wallet_id)
                result["current_balance"] = str(bal)
                result["would_succeed"] = bal >= required_usdc
                if bal < required_usdc:
                    result["reason"] = f"Insufficient balance: {bal} < {required_usdc}"
            else:
                result["would_succeed"] = False
                result["reason"] = f"Required {required_usdc} exceeds max {amount}"
        except Exception as e:
            result["would_succeed"] = False
            result["reason"] = str(e)
        return result

    def get_priority(self) -> int:
        return 10
