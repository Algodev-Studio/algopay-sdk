export default function ApiReferencePage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">API Reference</h1>
      <p className="mt-3 text-lg text-text-secondary">
        REST API endpoints for the AlgoPay control plane.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Authentication</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Agent API calls use Bearer token authentication with API keys generated in the dashboard.
        </p>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`Authorization: Bearer YOUR_API_KEY`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Endpoints</h2>
        <div className="mt-4 space-y-3">
          {[
            { method: "POST", path: "/api/agent/pay", desc: "Execute a USDC payment from the agent's vault wallet" },
            { method: "GET", path: "/api/wrapped/md", desc: "Fetch wrapped API catalog (markdown)" },
            { method: "POST", path: "/api/wrapped/:provider/:endpoint", desc: "Call a wrapped API endpoint" },
            { method: "POST", path: "/api/x402/:slug", desc: "Call a custom x402 endpoint" },
            { method: "GET", path: "/api/checkout", desc: "List checkout sessions" },
            { method: "POST", path: "/api/checkout", desc: "Create a checkout session" },
            { method: "GET", path: "/api/wallets/balance", desc: "Query USDC balance for an address" },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="neopop-card-flat flex items-start gap-4 p-4">
              <span className={`shrink-0 px-2 py-0.5 text-xs font-bold uppercase ${
                ep.method === "GET" ? "bg-neopop-green/15 text-neopop-green" : "bg-neopop-blue/15 text-neopop-blue"
              }`}>{ep.method}</span>
              <div>
                <code className="text-sm font-bold text-text-primary">{ep.path}</code>
                <p className="mt-0.5 text-xs text-text-muted">{ep.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Agent Pay</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`POST /api/agent/pay
Authorization: Bearer YOUR_API_KEY

{
  "to": "RECIPIENT_ALGO_ADDRESS",
  "amount": 5.00,
  "purpose": "API call fee"
}

// Response
{
  "success": true,
  "txId": "ALGO_TX_ID",
  "amount": "5.00",
  "status": "settled"
}`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Error Codes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-neopop-yellow text-neopop-black">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-green">200</td><td className="px-4 py-3 text-text-secondary">Success</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-yellow">202</td><td className="px-4 py-3 text-text-secondary">Pending approval</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-red">400</td><td className="px-4 py-3 text-text-secondary">Invalid request</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-red">403</td><td className="px-4 py-3 text-text-secondary">Policy check failed or endpoint disabled</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-red">404</td><td className="px-4 py-3 text-text-secondary">Unknown provider or endpoint</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-red">502</td><td className="px-4 py-3 text-text-secondary">Upstream API call failed (not charged)</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
