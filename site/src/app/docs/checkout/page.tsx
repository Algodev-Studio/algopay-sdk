export default function CheckoutDocsPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">Checkout with AlgoPay</h1>
      <p className="mt-3 text-lg text-text-secondary">
        Accept USDC payments on Algorand with a drop-in checkout experience.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { step: "1", title: "Create a session", desc: "A checkout session is created with an amount, description, and optional webhook URL." },
            { step: "2", title: "Show the checkout", desc: "Embed the checkout UI using the React SDK — inline, as a popup, or via redirect." },
            { step: "3", title: "Buyer pays", desc: "The buyer chooses a payment method and completes the transaction." },
            { step: "4", title: "You get notified", desc: "AlgoPay confirms the payment on-chain and fires a webhook to your server." },
          ].map((s) => (
            <div key={s.step} className="neopop-card-flat p-4">
              <span className="font-impact text-2xl text-neopop-yellow">{s.step}</span>
              <h3 className="mt-1 font-bold text-text-primary">{s.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Install</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`npm install @algodev-studio/checkout-react`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Embed Checkout</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`import { AlgoPayCheckout } from "@algodev-studio/checkout-react";

function CheckoutPage({ sessionId }) {
  return (
    <AlgoPayCheckout
      sessionId={sessionId}
      mode="embedded"
      onSuccess={(data) => {
        console.log("Paid!", data.txHash);
      }}
      onCancel={() => {
        console.log("Buyer cancelled");
      }}
    />
  );
}`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Payment Methods</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { title: "AlgoPay Wallet", desc: "One-click payment for users with an AlgoPay account. No wallet popups, no gas fees." },
            { title: "External Wallet", desc: "Pera, Defly, or any WalletConnect-compatible Algorand wallet." },
            { title: "AI Agent", desc: "Agents with AlgoPay can create and pay checkout sessions programmatically." },
          ].map((m) => (
            <div key={m.title} className="neopop-card-flat border-l-2 border-l-neopop-yellow p-4">
              <p className="text-sm font-bold text-text-primary">{m.title}</p>
              <p className="mt-1 text-xs text-text-muted">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Session Lifecycle</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-neopop-yellow text-neopop-black">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-yellow">PENDING</td><td className="px-4 py-3 text-text-secondary">Session is active and awaiting payment</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-green">PAID</td><td className="px-4 py-3 text-text-secondary">Payment confirmed on-chain</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-neopop-red">EXPIRED</td><td className="px-4 py-3 text-text-secondary">No payment received before expiration</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3 font-bold text-text-muted">CANCELLED</td><td className="px-4 py-3 text-text-secondary">The seller cancelled the session</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Webhooks</h2>
        <p className="mt-2 text-sm text-text-secondary">When a session is paid or expires, AlgoPay sends a POST request to your webhook URL.</p>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-xs text-text-primary"><code>{`{
  "event": "checkout.session.paid",
  "data": {
    "sessionId": "SESSION_ID",
    "amount": "25.00",
    "currency": "USDC",
    "paymentTxHash": "...",
    "payerAddress": "ALGO...",
    "paidAt": "2026-03-01T12:00:00.000Z"
  }
}`}</code></pre>
      </section>
    </article>
  );
}
