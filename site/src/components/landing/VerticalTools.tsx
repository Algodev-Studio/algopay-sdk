"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Globe, ShoppingCart } from "lucide-react";

const tools = [
  {
    Icon: Globe,
    title: "Wrapped APIs",
    subtitle: "Pay-per-use API access for AI agents",
    desc: "Call third-party APIs — AI models, search engines, data providers — and pay per use from your agent's Algorand wallet. No upstream accounts needed.",
    features: [
      "30+ pre-configured providers",
      "Flat or dynamic per-call pricing",
      "Policy enforcement on every call",
      "Charge-on-success billing",
    ],
    href: "/docs/wrapped-apis",
    cta: "Explore APIs",
  },
  {
    Icon: ShoppingCart,
    title: "Checkout with AlgoPay",
    subtitle: "Agent-native checkout SDK",
    desc: "A Stripe-style checkout SDK built for AI. Accept USDC payments in your product and route funds directly into the buyer's AlgoPay wallet.",
    features: [
      "Drop-in React SDK",
      "Funds land in AlgoPay wallet",
      "Spending controls apply automatically",
      "Works for humans and agents",
    ],
    href: "/docs/checkout",
    cta: "Read the Docs",
  },
];

export default function VerticalTools() {
  return (
    <section className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neopop-yellow">
          Vertical Tools
        </p>
        <h2 className="mt-2 font-impact text-3xl uppercase tracking-wide text-text-primary md:text-4xl">
          Agent-native tools built on AlgoPay
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="neopop-card p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <tool.Icon size={24} className="text-neopop-yellow" />
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wide text-text-primary">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-text-muted">{tool.subtitle}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                {tool.desc}
              </p>
              <ul className="mt-4 space-y-2">
                {tool.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 bg-neopop-yellow" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tool.href}
                className="mt-6 inline-block text-sm font-bold uppercase tracking-wide text-neopop-yellow transition hover:underline"
              >
                {tool.cta} &rarr;
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
