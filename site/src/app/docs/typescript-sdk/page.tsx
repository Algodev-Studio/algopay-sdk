export default function TypeScriptSdkPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">TypeScript SDK</h1>
      <p className="mt-3 text-lg text-text-secondary">
        <code className="bg-surface-raised px-1.5 py-0.5 text-neopop-yellow">@algodev-studio/algopay</code> — guards, ledger, intents, payments, and x402 for Node.js.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Install</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`npm install @algodev-studio/algopay`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Quick Start</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`import { AlgoPay, Config } from "@algodev-studio/algopay";

const config = Config.fromEnv();
const ap = new AlgoPay(config);

// Create a wallet
const wallet = await ap.wallet.create("my-agent");

// Send USDC
const result = await ap.pay({
  walletId: wallet.id,
  to: "RECIPIENT_ADDRESS",
  amount: 5.00,
  purpose: "Service fee",
});

console.log(result.txId);`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">API Map (Python ↔ TypeScript)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-neopop-yellow text-neopop-black">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Python</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">TypeScript</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["AlgoPay()", "new AlgoPay(config)"],
                ["ap.pay(...)", "await ap.pay({...})"],
                ["ap.wallet.create(name)", "await ap.wallet.create(name)"],
                ["ap.wallet.balance(id)", "await ap.wallet.balance(id)"],
                ["ap.x402_fetch(url, ...)", "await ap.x402Fetch(url, ...)"],
                ["BudgetGuard(max_usdc=100)", "new BudgetGuard({ maxUsdc: 100 })"],
                ["ap.ledger.entries()", "await ap.ledger.entries()"],
                ["ap.intents.create(...)", "await ap.intents.create({...})"],
              ].map(([py, ts]) => (
                <tr key={py} className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-xs text-text-primary">{py}</td>
                  <td className="px-4 py-2 font-mono text-xs text-text-primary">{ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Guards</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`import {
  AlgoPay,
  BudgetGuard,
  SingleTxGuard,
  RecipientGuard,
  RateLimitGuard,
} from "@algodev-studio/algopay";

const ap = new AlgoPay({
  guards: [
    new BudgetGuard({ maxUsdc: 100, windowHours: 24 }),
    new SingleTxGuard({ maxUsdc: 25 }),
    new RecipientGuard({ allowlist: ["ADDR1", "ADDR2"] }),
    new RateLimitGuard({ maxPerHour: 20 }),
  ],
});`}</code></pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">Configuration</h2>
        <pre className="mt-3 overflow-x-auto neopop-card-flat p-4 font-mono text-sm text-text-primary"><code>{`# Environment variables
ALGOPAY_NETWORK=algorand-testnet
ALGOD_URL=https://testnet-api.algonode.cloud
INDEXER_URL=https://testnet-idx.algonode.cloud
ALGOPAY_USDC_ASA_ID=10458941`}</code></pre>
      </section>
    </article>
  );
}
