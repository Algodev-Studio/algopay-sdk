export default function PaymentsDocsPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">Payments</h1>
      <p className="mt-3 text-lg text-text-secondary">
        USDC transfers, payment routing, and gas-sponsored transactions on Algorand.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Simple Payment</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`from algopay import AlgoPay

ap = AlgoPay()
result = ap.pay(
    wallet_id="wallet_123",
    to="RECIPIENT_ALGO_ADDRESS",
    amount=5.00,        # USDC
    purpose="API usage fee",
)
print(result.tx_id)     # Algorand transaction ID
print(result.status)    # "settled"`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Payment Lifecycle</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-neopop-yellow text-neopop-black">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-yellow">pending</td><td className="px-4 py-3 text-text-secondary">Payment created, awaiting processing</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-blue">processing</td><td className="px-4 py-3 text-text-secondary">Transaction submitted to Algorand</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-green">settled</td><td className="px-4 py-3 text-text-secondary">Confirmed on-chain</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-red">failed</td><td className="px-4 py-3 text-text-secondary">Transaction failed or rejected by policy</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Gas Sponsorship</h2>
        <p className="mt-2 text-sm text-text-secondary">
          AlgoPay supports gas-sponsored transactions via gas pools. Agents can send USDC
          without holding ALGO for transaction fees — the gas pool covers the fee.
        </p>
        <div className="mt-4 neopop-card-flat border-l-4 border-l-neopop-green p-5">
          <p className="text-sm font-bold text-text-primary">How gas pools work</p>
          <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
            <li>1. Create a gas pool and fund it with ALGO</li>
            <li>2. Assign agents to the pool</li>
            <li>3. Agent USDC transfers use pool ALGO for fees</li>
            <li>4. Daily caps prevent excessive gas usage</li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Payment Intents</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Payment intents let you create, preview, and confirm payments in separate steps.
          Useful for approval flows or when the agent needs to show the user what will happen.
        </p>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`intent = ap.intents.create(
    wallet_id="wallet_123",
    to="RECIPIENT",
    amount=10.00,
)
print(intent.estimated_fee)

# Later, after approval:
result = ap.intents.confirm(intent.id)`}</code></pre>
      </section>
    </article>
  );
}
