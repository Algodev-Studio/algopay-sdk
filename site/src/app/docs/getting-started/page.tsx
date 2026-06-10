export default function GettingStartedPage() {
  return (
    <article className="prose-algopay max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">Getting Started</h1>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-text-primary">Requirements</h2>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2"><span className="mt-1 block h-1.5 w-1.5 shrink-0 bg-neopop-yellow" />Python 3.10+ or Node.js 20+</li>
          <li className="flex items-start gap-2"><span className="mt-1 block h-1.5 w-1.5 shrink-0 bg-neopop-yellow" />Access to Algod and Indexer HTTP APIs (defaults use AlgoNode public endpoints)</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-text-primary">Install</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="neopop-card-flat p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neopop-yellow">Python</p>
            <pre className="mt-2 overflow-x-auto bg-background p-3 font-mono text-sm text-text-primary"><code>{`pip install "algopay-sdk==0.1.0a3"`}</code></pre>
          </div>
          <div className="neopop-card-flat p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neopop-yellow">TypeScript</p>
            <pre className="mt-2 overflow-x-auto bg-background p-3 font-mono text-sm text-text-primary"><code>{`npm i @algodev-studio/algopay`}</code></pre>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-text-primary">Configure</h2>
        <p className="mt-2 text-sm text-text-secondary">Set your network and optional overrides via environment variables:</p>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`ALGOPAY_NETWORK=algorand-testnet
ALGOD_URL=                    # defaults to AlgoNode
INDEXER_URL=                  # defaults to AlgoNode
ALGOPAY_USDC_ASA_ID=          # auto-detected per network`}</code></pre>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-text-primary">First Payment (Python)</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`from algopay import AlgoPay

ap = AlgoPay()
wallet = ap.wallet.create("my-agent")
result = ap.pay(
    wallet_id=wallet.id,
    to="RECIPIENT_ADDRESS",
    amount=1.50,
    purpose="API call fee",
)
print(result.tx_id)`}</code></pre>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-text-primary">First Payment (TypeScript)</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`import { AlgoPay } from "@algodev-studio/algopay";

const ap = new AlgoPay();
const wallet = await ap.wallet.create("my-agent");
const result = await ap.pay({
  walletId: wallet.id,
  to: "RECIPIENT_ADDRESS",
  amount: 1.50,
  purpose: "API call fee",
});
console.log(result.txId);`}</code></pre>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-text-primary">Next Steps</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { title: "Wallets", href: "/docs/wallets", desc: "Wallet sets, balance queries, custodial vs external" },
            { title: "Payments", href: "/docs/payments", desc: "Payment routing, USDC transfers, gas sponsorship" },
            { title: "Guards", href: "/docs/guards", desc: "Budget limits, rate limiting, approval flows" },
            { title: "Wrapped APIs", href: "/docs/wrapped-apis", desc: "Pay-per-use access to third-party APIs" },
          ].map((item) => (
            <a key={item.href} href={item.href} className="neopop-card-flat border-l-2 border-l-neopop-yellow p-4 transition hover:border-l-neopop-yellow">
              <p className="text-sm font-bold text-text-primary">{item.title}</p>
              <p className="mt-1 text-xs text-text-muted">{item.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
