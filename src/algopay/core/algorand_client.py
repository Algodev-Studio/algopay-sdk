"""Thin Algod + Indexer wrapper."""

from __future__ import annotations

from typing import Any

from algosdk.error import AlgodHTTPError
from algosdk.v2client import algod, indexer

from algopay.core.config import Config
from algopay.core.exceptions import NetworkError


class AlgorandClient:
    def __init__(self, config: Config) -> None:
        self._config = config
        self._algod = algod.AlgodClient("", config.algod_url)
        self._indexer = indexer.IndexerClient("", config.indexer_url)

    @property
    def algod(self) -> algod.AlgodClient:
        return self._algod

    @property
    def indexer(self) -> indexer.IndexerClient:
        return self._indexer

    def suggested_params(self) -> Any:
        try:
            return self._algod.suggested_params()
        except Exception as e:
            raise NetworkError(f"Algod suggested_params failed: {e}", details={"error": str(e)}) from e

    def account_info(self, address: str) -> dict[str, Any]:
        try:
            return self._algod.account_info(address)
        except AlgodHTTPError as e:
            raise NetworkError(
                f"Algod account_info failed: {e}",
                details={"address": address, "error": str(e)},
            ) from e

    def send_transaction(self, signed_txn: bytes) -> str:
        try:
            return self._algod.send_raw_transaction(signed_txn)
        except Exception as e:
            raise NetworkError(f"send_raw_transaction failed: {e}", details={"error": str(e)}) from e

    def pending_transaction_info(self, txid: str) -> dict[str, Any]:
        try:
            return self._algod.pending_transaction_info(txid)
        except Exception as e:
            raise NetworkError(f"pending_transaction_info failed: {e}", details={"txid": txid}) from e

    def transaction_by_id(self, txid: str) -> dict[str, Any] | None:
        """Lookup confirmed transaction via indexer."""
        try:
            resp = self._indexer.transaction(txid)
            if "transaction" in resp:
                return resp["transaction"]
            txs = resp.get("transactions") or []
            return txs[0] if txs else None
        except Exception:
            return None
