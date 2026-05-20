"use client";

import { motion } from "framer-motion";
import { Wallet, ShieldCheck, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Fund Wallet",
    desc: "Deposit USDC or ALGO to your agent's wallet on Algorand. Your funds stay in your control — AlgoPay never takes custody.",
    Icon: Wallet,
  },
  {
    number: "02",
    title: "Set Rules",
    desc: "Define spending limits, per-transaction budgets, approval thresholds, and vendor allowlists. Policies are enforced on every transaction.",
    Icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Agent Pays",
    desc: "Your agent autonomously pays for APIs, services, and tools — all within the guardrails you set. Every transaction is auditable.",
    Icon: Zap,
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neopop-yellow">
          How it works
        </p>
        <h2 className="mt-2 font-impact text-3xl uppercase tracking-wide text-text-primary md:text-4xl">
          Three steps to autonomous payments
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="neopop-card p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="font-impact text-3xl text-neopop-yellow">
                  {step.number}
                </span>
                <step.Icon size={28} className="text-text-muted" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wide text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
