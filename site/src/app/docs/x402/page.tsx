export default function X402DocsPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">x402 HTTP Payments</h1>
      <p className="mt-3 text-lg text-text-secondary">
        Pay-per-request API access using the HTTP 402 protocol on Algorand.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">What is x402?</h2>
        <p className="mt-2 text-sm text-text-secondary">
          x402 is an open protocol that uses the HTTP 402 &quot;Payment Required&quot; status code to enable
          machine-to-machine payments. When an agent hits a paywalled endpoint, the server responds with
          402 and payment instructions. The agent pays on-chain and retries with proof of payment.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Flow</h2>
        <div className="mt-4 space-y-3">
          {[
            { step: "1", text: "Agent sends a request to a resource server" },
            { step: "2", text: "Server returns HTTP 402 with payment details (amount, recipient, asset)" },
            { step: "3", text: "Agent constructs and signs an Algorand USDC transaction" },
            { step: "4", text: "Agent retries the request with the transaction proof" },
            { step: "5", text: "Server verifies payment on-chain and returns the resource" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-4 neopop-card-flat p-4">
              <span className="font-impact text-2xl text-neopop-yellow">{s.step}</span>
              <p className="text-sm text-text-secondary">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Client Usage (Python)</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`from algopay import AlgoPay

ap = AlgoPay()
response = ap.x402_fetch(
    url="https://api.example.com/premium-data",
    wallet_id="wallet_123",
    max_usdc=0.50,
)
print(response.json())`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Custom x402 Endpoints</h2>
        <p className="mt-2 text-sm text-text-secondary">
          You can register custom x402 endpoints in the AlgoPay dashboard under APIs &rarr; Custom Endpoints.
          Your agent calls them via <code className="bg-surface-raised px-1.5 py-0.5 text-neopop-yellow">/api/x402/:slug</code> and
          AlgoPay handles the 402 negotiation automatically.
        </p>
      </section>
    </article>
  );
}
