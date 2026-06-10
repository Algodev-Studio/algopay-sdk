"use client";

import { motion } from "framer-motion";

const providers = [
  { name: "OpenAI", desc: "GPT chat, embeddings, image generation" },
  { name: "Anthropic", desc: "Claude models, vision, extended thinking" },
  { name: "Firecrawl", desc: "Web scraping, crawling, extraction" },
  { name: "Tavily", desc: "AI-optimized web search and crawling" },
  { name: "Brave Search", desc: "Independent web, news, and image search" },
  { name: "DeepSeek", desc: "V3 and R1 for chat, code, reasoning" },
  { name: "Google Gemini", desc: "Multimodal chat, vision, embeddings" },
  { name: "Groq", desc: "Ultra-fast LLM inference" },
  { name: "Exa", desc: "AI-native semantic search" },
  { name: "Deepgram", desc: "Speech-to-text and text-to-speech" },
  { name: "Replicate", desc: "Thousands of open-source AI models" },
  { name: "Stability AI", desc: "Image generation, editing, upscaling" },
  { name: "Mistral AI", desc: "Mistral Large, Codestral, Pixtral" },
  { name: "CoinGecko", desc: "Cryptocurrency market data" },
  { name: "Wolfram|Alpha", desc: "Computational knowledge engine" },
  { name: "Judge0", desc: "Code execution in 60+ languages" },
];

const moreCount = 15;

export default function ProviderGrid() {
  return (
    <section className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neopop-yellow">
          Pay-Per-Use APIs
        </p>
        <h2 className="mt-2 font-impact text-3xl uppercase tracking-wide text-text-primary md:text-4xl">
          {providers.length + moreCount}+ APIs. Zero subscriptions.
        </h2>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Your agent calls any provider — AI models, data providers, search
          engines, maps — paying per use from its AlgoPay wallet. No accounts.
          No API key management.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {providers.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="neopop-card-flat p-4 transition hover:border-neopop-yellow/40"
            >
              <p className="text-sm font-bold text-text-primary">{p.name}</p>
              <p className="mt-1 text-xs text-text-muted">{p.desc}</p>
            </motion.div>
          ))}
          <div className="flex items-center justify-center border border-dashed border-border-strong p-4 text-sm text-text-muted">
            +{moreCount} more providers
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Zero Setup",
              desc: "Enable any provider in the dashboard. Your agent gets access immediately — no accounts, no keys.",
            },
            {
              title: "Per-Call Pricing",
              desc: "Pay fractions of a cent per API call. No monthly commitments. Spend only what you use.",
            },
            {
              title: "Policy Enforced",
              desc: "Every API call respects your spending limits, approval thresholds, and vendor allowlists.",
            },
          ].map((item) => (
            <div key={item.title} className="neopop-card-flat border-l-4 border-l-neopop-yellow p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-text-primary">
                {item.title}
              </p>
              <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
