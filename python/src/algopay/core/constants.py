"""Algorand network and USDC (ASA) defaults."""

from __future__ import annotations

try:
    from x402.mechanisms.avm.constants import (
        ALGORAND_MAINNET_CAIP2,
        ALGORAND_TESTNET_CAIP2,
        USDC_MAINNET_ASA_ID,
        USDC_TESTNET_ASA_ID,
    )
except ImportError:
    _MH = "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8="
    _TH = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="
    ALGORAND_MAINNET_CAIP2 = f"algorand:{_MH}"
    ALGORAND_TESTNET_CAIP2 = f"algorand:{_TH}"
    USDC_MAINNET_ASA_ID = 31566704
    USDC_TESTNET_ASA_ID = 10458941

__all__ = [
    "ALGORAND_MAINNET_CAIP2",
    "ALGORAND_TESTNET_CAIP2",
    "USDC_MAINNET_ASA_ID",
    "USDC_TESTNET_ASA_ID",
]
