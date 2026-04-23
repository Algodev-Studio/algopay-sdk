# Algorand wallet UX vs Locus (fee payer, subwallets)

Locus uses ERC-4337 **paymasters** and **subwallet** contracts on Base. On Algorand the closest patterns are:

| Goal | Approach |
|------|----------|
| Agent does not hold ALGO for fees | Use a **fee payer** account: transactions are partially signed by the user/agent account and completed by a sponsor, or use a **rekey** scheme where a service account pays fees per documented policy. |
| Isolated spend buckets | **Multiple standard accounts** per agent (wallet sets) or a future **smart contract** escrow built with [AlgoKit](https://algorand.co/algokit). |
| Email / escrow claims | Off-chain product flow + optional **stateful smart contract** for time-locked disbursement. |

The hosted app currently generates **standard Algorand accounts** and stores keys in the **vault** (server-assisted signing). Fee payer support is **not** implemented in the scaffold; add it when agents must not hold ALGO.
