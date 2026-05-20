import Link from "next/link";

const cards = [
  { title: "Quick Start", desc: "Get your agent set up with AlgoPay in minutes.", href: "/docs/getting-started", accent: "border-l-neopop-yellow" },
  { title: "Wallets", desc: "Smart wallet architecture for secure, gasless transactions on Algorand.", href: "/docs/wallets", accent: "border-l-neopop-green" },
  { title: "Payments", desc: "USDC transfers, routing, and payment processing.", href: "/docs/payments", accent: "border-l-neopop-blue" },
  { title: "Wrapped APIs", desc: "Call third-party APIs and pay per use in USDC.", href: "/docs/wrapped-apis", accent: "border-l-neopop-purple" },
  { title: "Checkout", desc: "Accept USDC payments with a drop-in checkout experience.", href: "/docs/checkout", accent: "border-l-neopop-yellow" },
  { title: "TypeScript SDK", desc: "npm package @algodev-studio/algopay — guards, ledger, intents.", href: "/docs/typescript-sdk", accent: "border-l-neopop-green" },
];

export default function DocsIndex() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-impact text-4xl uppercase tracking-wide text-text-primary">
        AlgoPay Documentation
      </h1>
      <p className="mt-4 text-lg text-text-secondary">
        Payment infrastructure for AI agents on Algorand — USDC, x402, guards, ledger, and more.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}
            className={`neopop-card-flat border-l-4 ${card.accent} p-5 transition hover:border-neopop-yellow/40`}>
            <p className="text-sm font-bold uppercase tracking-wide text-text-primary">{card.title}</p>
            <p className="mt-1.5 text-sm text-text-secondary">{card.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 neopop-card-flat p-6">
        <h2 className="text-lg font-bold uppercase tracking-wide text-text-primary">Install</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neopop-yellow">Python (PyPI)</p>
            <pre className="mt-2 overflow-x-auto bg-background p-3 font-mono text-sm text-text-primary">
              <code>pip install &quot;algopay-sdk==0.1.0a2&quot;</code>
            </pre>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neopop-yellow">TypeScript (npm)</p>
            <pre className="mt-2 overflow-x-auto bg-background p-3 font-mono text-sm text-text-primary">
              <code>npm i @algodev-studio/algopay</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
