export default function ControlPlanePage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">Control Plane</h1>
      <p className="mt-3 text-lg text-text-secondary">
        The AlgoPay dashboard — a hosted Next.js control plane for managing agents, wallets, and policies.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Architecture</h2>
        <p className="mt-2 text-sm text-text-secondary">
          The control plane runs as a Next.js 15 app with Prisma/SQLite for storage and JWT session cookies
          for authentication. It provides both a web dashboard for humans and API endpoints for agents.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Dashboard Features</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { title: "Overview", desc: "Payment volume, status breakdown, gas pool balance" },
            { title: "Payments", desc: "Create, track, and process USDC payments" },
            { title: "Agents", desc: "Manage agent identities, daily limits, and status" },
            { title: "Merchants", desc: "Register payment recipients with Algorand addresses" },
            { title: "Gas Pools", desc: "Fund and monitor gas sponsorship pools" },
            { title: "APIs", desc: "Enable wrapped APIs and register custom x402 endpoints" },
            { title: "Checkout", desc: "Manage checkout sessions with analytics" },
            { title: "Wallets", desc: "Create custodial wallets with encrypted vault storage" },
            { title: "Approvals", desc: "Review and approve high-value transactions" },
            { title: "Settings", desc: "API keys, spending controls, and workspace configuration" },
          ].map((f) => (
            <div key={f.title} className="neopop-card-flat p-4">
              <p className="text-sm font-bold text-text-primary">{f.title}</p>
              <p className="mt-1 text-xs text-text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Self-Hosting</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`git clone https://github.com/Algodev-Studio/algopay-sdk.git
cd algopay-sdk
npm install
cd pay
cp .env.example .env   # Edit with your secrets
npx prisma db push
npm run dev`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Environment Variables</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-neopop-yellow text-neopop-black">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Variable</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["DATABASE_URL", "SQLite connection string"],
                ["SESSION_SECRET", "JWT signing key (min 32 chars)"],
                ["ALGOPAY_VAULT_MASTER_KEY", "AES-256 key for wallet encryption"],
                ["ALGOPAY_NETWORK", "algorand-testnet or algorand-mainnet"],
                ["ALGOD_URL", "Algod REST endpoint (optional)"],
                ["INDEXER_URL", "Indexer REST endpoint (optional)"],
              ].map(([name, desc]) => (
                <tr key={name} className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-xs text-neopop-yellow">{name}</td>
                  <td className="px-4 py-2 text-text-secondary">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
