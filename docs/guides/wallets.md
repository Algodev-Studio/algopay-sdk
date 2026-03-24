# Wallets

AlgoPay manages **Algorand accounts** through `AlgoPay.wallet`, a [`WalletService`](../reference/api.md#algopay.wallet.service.WalletService) backed by an in-memory [`WalletRepository`](https://github.com/Algodev-Studio/algopay-sdk/blob/main/src/algopay/wallet/repository.py) unless you inject your own.

!!! note "Keys and persistence"
    By default, **private keys live in process memory** only. For durable agents, plan **backup, encryption, or a custom repository** — out of scope for the alpha defaults.

## Wallet sets and wallets

Wallet **sets** group wallets (for example one set per agent or tenant). Each **wallet** has an `id`, Algorand `address`, and `wallet_set_id`.

```python
client = AlgoPay(network=Network.ALGORAND_TESTNET)

ws = client.wallet.create_wallet_set("production-agent-1")
w = client.wallet.create_wallet(ws.id)

print(w.id, w.address, w.wallet_set_id)
```

You can also use convenience methods on **`AlgoPay`** that mirror this flow: `create_wallet_set`, `create_wallet`, `list_wallets`, `get_wallet`, etc. (see [API reference](../reference/api.md)).

## USDC and opt-in

USDC on Algorand is an **ASA**. The account must **opt in** before it can hold USDC. Use:

```python
client.wallet.opt_in_usdc(wallet_id, fee_level=FeeLevel.MEDIUM)
```

**ASA ID** comes from `Config` / network (mainnet vs testnet defaults) or `ALGOPAY_USDC_ASA_ID`.

## Balances and transfers

- **`get_usdc_balance_amount(wallet_id)`** — `Decimal` USDC balance (via Indexer).
- Lower-level helpers on `WalletService` build and submit ASA transfers; high-level **`pay()`** on `AlgoPay` goes through the [payment router](payments.md) (transfer vs x402).

## Transaction history

`client.wallet.list_transactions(wallet_id)` returns [`TransactionInfo`](../reference/api.md#algopay.core.types.TransactionInfo) records tracked by the SDK/repository flow.

## Fee levels

[`FeeLevel`](../reference/api.md#algopay.core.types.FeeLevel) (`LOW`, `MEDIUM`, `HIGH`) maps to Algorand fee multipliers for sponsored transactions from the wallet service.

## Related

- [Environment variables](../ENVIRONMENT.md) — `ALGOPAY_NETWORK`, indexer URL, USDC ASA
- [Payments & routing](payments.md) — how `pay()` uses the wallet
- [Guards](guards.md) — wallet vs wallet-set scoped policies
