import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <h1>Overview</h1>
      <p className="muted" style={{ maxWidth: "56ch", marginBottom: "1.5rem" }}>
        Control plane for agent spending on Algorand. Configure policies,
        issue API keys under <Link href="/dashboard/apis">APIs</Link>, and fund wallets for USDC +
        x402.
      </p>

      <div className="grid-2">
        <div className="card">
          <h2>Agent guardrails</h2>
          <p className="muted" style={{ margin: "0 0 0.75rem" }}>
            Maps to allowance / max transaction / approval settings (enforced in SDK + agent
            pay API).
          </p>
          <ul className="muted" style={{ margin: 0, paddingLeft: "1.25rem" }}>
            <li>
              <Link href="/dashboard/policies">Allowance &amp; limits</Link> — daily cap (SDK),
              max single tx, justification
            </li>
            <li>Approval threshold — use Python <code>ConfirmGuard</code> / intents (queue UI TBD)</li>
          </ul>
        </div>
        <div className="card">
          <h2>Wallet &amp; balance</h2>
          <p className="muted" style={{ margin: "0 0 0.75rem" }}>
            Create funded wallets, opt in to USDC on testnet, then pay via agent API.
          </p>
          <Link href="/dashboard/wallets" className="btn-primary" style={{ display: "inline-block", width: "auto", padding: "0.5rem 1rem" }}>
            Manage wallets
          </Link>
        </div>
        <div className="card">
          <h2>Pending approvals</h2>
          <p className="muted" style={{ margin: 0 }}>
            Human-in-the-loop queue is not wired yet. See{" "}
            <Link href="/dashboard/approvals">Approvals</Link> (placeholder).
          </p>
        </div>
        <div className="card">
          <h2>Recent activity</h2>
          <p className="muted" style={{ margin: 0 }}>
            <Link href="/dashboard/transactions">Transaction history</Link> lists ledger entries from
            agent pay and future SDK sync.
          </p>
        </div>
      </div>
    </>
  );
}
