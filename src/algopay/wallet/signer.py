"""Ed25519 signing for AVM / x402 (implements x402 ClientAvmSigner protocol)."""

from __future__ import annotations

import base64

from algosdk import encoding


class AlgorandWalletSigner:
    """Signs Algorand transactions for a single account (x402 ClientAvmSigner)."""

    def __init__(self, private_key: bytes) -> None:
        if len(private_key) != 64:
            raise ValueError("Algorand private key must be 64 bytes")
        self._private_key = private_key
        self._address = encoding.encode_address(private_key[32:])

    @property
    def address(self) -> str:
        return self._address

    def sign_transactions(
        self,
        unsigned_txns: list[bytes],
        indexes_to_sign: list[int],
    ) -> list[bytes | None]:
        """unsigned_txns are raw msgpack bodies (as produced by x402 ExactAvmScheme)."""
        out: list[bytes | None] = [None] * len(unsigned_txns)
        for i in indexes_to_sign:
            b64 = base64.b64encode(unsigned_txns[i]).decode()
            txn = encoding.msgpack_decode(b64)
            sk_b64 = base64.b64encode(self._private_key).decode()
            stxn = txn.sign(sk_b64)
            sb64 = encoding.msgpack_encode(stxn)
            out[i] = base64.b64decode(sb64)
        return out
