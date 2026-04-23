import Link from "next/link";

export default function DashboardPage() {
  return (
    <main>
      <h1>Overview</h1>
      <p style={{ color: "var(--muted)", maxWidth: "60ch" }}>
        This console mirrors a Locus-style control plane: workspace network (testnet/mainnet), wallet
        sets, encrypted keys (server vault), spending policies, and agent API keys. Agents call{" "}
        <code>POST /api/agent/pay</code> with a Bearer key.
      </p>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Quick links</h2>
        <ul>
          <li>
            <Link href="/dashboard/wallets">Create a wallet</Link> and fund it with testnet ALGO +
            USDC
          </li>
          <li>
            <Link href="/dashboard/api-keys">Issue an API key</Link> for your agent
          </li>
          <li>
            <Link href="/dashboard/policies">Set policies</Link> (justification, per-tx cap,
            allowlist)
          </li>
        </ul>
      </div>
    </main>
  );
}
