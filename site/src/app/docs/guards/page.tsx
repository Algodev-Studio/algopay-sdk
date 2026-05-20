export default function GuardsDocsPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">Guards</h1>
      <p className="mt-3 text-lg text-text-secondary">
        Policy enforcement for AI agent payments — budget limits, rate limiting, approval flows, and more.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Available Guards</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { title: "Budget Guard", desc: "Cap total spending over a time window (e.g., $100/day)." },
            { title: "Single-Tx Guard", desc: "Limit the maximum amount per individual transaction." },
            { title: "Recipient Guard", desc: "Restrict payments to an allowlist of approved addresses." },
            { title: "Rate-Limit Guard", desc: "Throttle transaction frequency (e.g., max 10/hour)." },
            { title: "Justification Guard", desc: "Require a purpose/reason string on every payment." },
            { title: "Confirmation Guard", desc: "Route high-value transactions through human approval." },
          ].map((g) => (
            <div key={g.title} className="neopop-card-flat p-4">
              <p className="text-sm font-bold text-text-primary">{g.title}</p>
              <p className="mt-1 text-xs text-text-muted">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Usage (Python)</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`from algopay import AlgoPay
from algopay.guards import BudgetGuard, SingleTxGuard

ap = AlgoPay(guards=[
    BudgetGuard(max_usdc=100, window_hours=24),
    SingleTxGuard(max_usdc=25),
])

# This payment will be checked against both guards
result = ap.pay(wallet_id="w1", to="ADDR", amount=10.00)`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Usage (TypeScript)</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`import { AlgoPay, BudgetGuard, SingleTxGuard } from "@algodev-studio/algopay";

const ap = new AlgoPay({
  guards: [
    new BudgetGuard({ maxUsdc: 100, windowHours: 24 }),
    new SingleTxGuard({ maxUsdc: 25 }),
  ],
});

const result = await ap.pay({
  walletId: "w1",
  to: "ADDR",
  amount: 10.0,
});`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Dashboard Controls</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Guards can also be configured through the AlgoPay dashboard under Settings &rarr; Spending Controls.
          Dashboard policies are enforced server-side on all API key authenticated calls.
        </p>
      </section>
    </article>
  );
}
