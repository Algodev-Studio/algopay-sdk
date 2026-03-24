"""AlgorandWalletSigner."""

from __future__ import annotations

import base64

from algosdk import account

from algopay.wallet.signer import AlgorandWalletSigner


def test_signer_address_matches_generated_account():
    sk_b64, expected_addr = account.generate_account()
    raw = base64.b64decode(sk_b64)
    signer = AlgorandWalletSigner(raw)
    assert signer.address == expected_addr
