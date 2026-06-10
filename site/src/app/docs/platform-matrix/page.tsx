export default function PlatformMatrixPage() {
  return (
    <article className="max-w-4xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">Platform Feature Matrix</h1>
      <p className="mt-3 text-lg text-text-secondary">
        AlgoPay SDK and dashboard capabilities compared to typical agent-payment platforms.
      </p>

      <section className="mt-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-neopop-yellow text-neopop-black">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Feature</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">SDK</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Dashboard</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Wallets (create, balance)", "Yes", "Yes", "Shipped"],
                ["USDC transfers", "Yes", "Yes", "Shipped"],
                ["Guards (budget, rate, recipient)", "Yes", "Partial", "Shipped"],
                ["x402 HTTP payments", "Yes", "No", "Shipped"],
                ["Payment intents & batch", "Yes", "No", "Shipped"],
                ["Ledger & storage", "Yes", "No", "Shipped"],
                ["API key management", "No", "Yes", "Shipped"],
                ["Spending controls", "SDK guards", "Yes", "Shipped"],
                ["Wrapped API gateway", "No", "UI only", "In progress"],
                ["Custom x402 endpoints", "No", "Yes", "In progress"],
                ["Checkout sessions", "No", "Yes", "In progress"],
                ["Approvals inbox", "No", "Partial", "Planned"],
                ["Multi-chain MPP", "No", "No", "Out of scope"],
              ].map(([feature, sdk, dash, status]) => (
                <tr key={feature} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium text-text-primary">{feature}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{sdk}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{dash}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase ${
                      status === "Shipped" ? "bg-neopop-green/15 text-neopop-green" :
                      status === "In progress" ? "bg-neopop-yellow/15 text-neopop-yellow" :
                      status === "Planned" ? "bg-neopop-blue/15 text-neopop-blue" :
                      "bg-surface-raised text-text-muted"
                    }`}>{status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
