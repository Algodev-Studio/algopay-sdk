"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-32 md:pt-40">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
        <Image
          src="/logos/logo-hero.png"
          alt=""
          width={600}
          height={600}
          className="max-w-none"
          priority
        />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-neopop-yellow">
            Built on Algorand
          </p>
          <h1 className="font-impact text-5xl uppercase leading-tight tracking-wide text-text-primary md:text-7xl">
            Agents Can Pay.
            <br />
            <span className="text-neopop-yellow">AlgoPay Makes It Safe.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            Set the rules. Bind them to an agent. Every payment justified,
            enforced, and audited. Pay-per-use APIs on Algorand. No
            subscriptions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/docs/getting-started" className="neopop-btn neopop-btn-primary px-8 py-3">
            Get Started
          </Link>
          <Link href="/docs" className="neopop-btn neopop-btn-white px-8 py-3">
            Read the Docs
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
