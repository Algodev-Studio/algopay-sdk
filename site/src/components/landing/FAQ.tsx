"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is AlgoPay?",
    a: "AlgoPay is payment infrastructure for AI agents on Algorand. It gives your agent a single USDC/ALGO balance to pay for APIs, services, and tools — with spending controls, approval flows, and full audit logs.",
  },
  {
    q: "How do AI agents pay for APIs?",
    a: "Your agent calls wrapped APIs through AlgoPay using a simple REST interface. Each call is charged per-use from the agent's wallet in USDC on Algorand. No upstream accounts or API keys are needed.",
  },
  {
    q: "Do I need crypto to use AlgoPay?",
    a: "You need USDC or ALGO on the Algorand blockchain. You can fund your wallet by sending USDC to your agent's Algorand wallet address. Testnet credits are available for development.",
  },
  {
    q: "What is an AlgoPay wallet?",
    a: "An AlgoPay wallet is a standard Algorand account managed through the AlgoPay dashboard. You can create custodial wallets (encrypted in the vault) or connect external wallets like Pera.",
  },
  {
    q: "How much do API calls cost?",
    a: "Pricing varies by provider and endpoint. Most calls cost fractions of a cent. Some providers have flat per-call pricing, while AI model calls scale with token usage. Check the provider catalog for details.",
  },
  {
    q: "What happens if my agent overspends?",
    a: "AlgoPay enforces spending controls at every transaction. Daily allowances, per-transaction limits, and approval thresholds prevent overspending. Transactions exceeding thresholds require human approval.",
  },
  {
    q: "Is AlgoPay secure?",
    a: "Yes. Wallet mnemonics are encrypted with AES-256-GCM at rest. API keys are SHA-256 hashed. All policy checks run server-side before any transaction executes. Every action is logged in the audit trail.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neopop-yellow">
          FAQ
        </p>
        <h2 className="mt-2 font-impact text-3xl uppercase tracking-wide text-text-primary md:text-4xl">
          Frequently asked questions
        </h2>

        <div className="mt-10 space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="neopop-card-flat overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="pr-4 text-sm font-bold text-text-primary">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="border-t border-border px-5 pb-5 pt-4 text-sm leading-relaxed text-text-secondary">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
