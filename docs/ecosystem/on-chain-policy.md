# On-chain policy vs off-chain guards (AlgoKit)

**Current product:** Spending policy is enforced **off-chain** in the Python SDK (**guards** + Redis/memory) and in the **hosted app** (workspace fields on agent pay).

**When to add AlgoKit contracts**

- **Subwallet escrows** with on-chain disburse deadlines (Locus subwallet pattern).
- **Payment router** contract for composable checkout splits.
- **Immutable policy** commitments where auditors must see rules on-chain.

For most agent spend limits, off-chain guards + audit logs remain simpler and cheaper. Revisit after mainnet volume or compliance requirements justify contract development.
