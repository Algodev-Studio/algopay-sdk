import { CONSOLE_URL } from "@/lib/urls";

export default function AgentIntegrationPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">Agent Integration</h1>
      <p className="mt-3 text-lg text-text-secondary">
        How AI agents authenticate, discover, and call wrapped APIs through AlgoPay.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Authentication</h2>
        <p className="mt-2 text-sm text-text-secondary">
          All wrapped API requests require an AlgoPay API key in the Authorization header:
        </p>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`Authorization: Bearer YOUR_API_KEY`}</code></pre>
        <p className="mt-2 text-sm text-text-secondary">
          API keys are created in the AlgoPay dashboard under Settings. The key identifies which agent
          is making the call and which wallet to charge.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Discover Available APIs</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`# Fetch the catalog index
curl -s ${CONSOLE_URL}/api/wrapped/md \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Fetch details for a specific provider
curl -s "${CONSOLE_URL}/api/wrapped/md?provider=firecrawl" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Make a Call</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`curl -X POST ${CONSOLE_URL}/api/wrapped/firecrawl/scrape \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "formats": ["markdown"]}'`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Approval Flow</h2>
        <p className="mt-2 text-sm text-text-secondary">
          If a call&apos;s cost exceeds your agent&apos;s approval threshold, the response is 202:
        </p>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-xs text-text-primary"><code>{`{
  "success": true,
  "data": {
    "pending_approval_id": "uuid",
    "approval_url": "${CONSOLE_URL}/dashboard/approvals",
    "status": "PENDING_APPROVAL",
    "estimated_cost_usdc": 0.50
  }
}`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Error Handling</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-neopop-yellow text-neopop-black">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-green">200</td><td className="px-4 py-3 text-text-secondary">Success. Data contains upstream response.</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-yellow">202</td><td className="px-4 py-3 text-text-secondary">Pending approval. Send the approval_url to your human.</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-red">403</td><td className="px-4 py-3 text-text-secondary">Policy check failed, endpoint disabled, or allowance exceeded.</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-red">502</td><td className="px-4 py-3 text-text-secondary">Upstream API call failed. You are not charged.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
