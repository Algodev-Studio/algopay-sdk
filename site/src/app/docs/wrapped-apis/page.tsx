import Link from "next/link";
import { CONSOLE_URL } from "@/lib/urls";

const providers = [
  { name: "OpenAI", slug: "openai", desc: "GPT chat, embeddings, image generation, text-to-speech, and moderation.", endpoints: 8 },
  { name: "Firecrawl", slug: "firecrawl", desc: "Web scraping, crawling, and structured data extraction.", endpoints: 4 },
  { name: "Tavily", slug: "tavily", desc: "AI-optimized web search, extraction, and crawling.", endpoints: 3 },
  { name: "Google Gemini", slug: "gemini", desc: "Multimodal chat, vision, PDF processing, and embeddings.", endpoints: 6 },
  { name: "Anthropic", slug: "anthropic", desc: "Claude models — chat, vision, document processing.", endpoints: 4 },
  { name: "DeepSeek", slug: "deepseek", desc: "DeepSeek-V3 and R1 for chat, code, and reasoning.", endpoints: 3 },
  { name: "Exa", slug: "exa", desc: "AI-native semantic search and content retrieval.", endpoints: 3 },
  { name: "Brave Search", slug: "brave", desc: "Independent web search — web, news, images, videos.", endpoints: 5 },
  { name: "Groq", slug: "groq", desc: "Ultra-fast LLM inference — Llama, DeepSeek R1, Gemma.", endpoints: 3 },
  { name: "Replicate", slug: "replicate", desc: "Run thousands of open-source AI models via API.", endpoints: 4 },
  { name: "Stability AI", slug: "stability", desc: "Image generation, editing, upscaling, 3D, and audio.", endpoints: 6 },
  { name: "Deepgram", slug: "deepgram", desc: "Speech-to-text, text-to-speech, and text analysis.", endpoints: 3 },
  { name: "Mistral AI", slug: "mistral", desc: "Mistral Large, Codestral, Magistral reasoning.", endpoints: 4 },
  { name: "CoinGecko", slug: "coingecko", desc: "Cryptocurrency market data — prices, charts, trending.", endpoints: 5 },
  { name: "Wolfram|Alpha", slug: "wolfram", desc: "Computational knowledge — math, science, finance.", endpoints: 3 },
  { name: "Judge0", slug: "judge0", desc: "Code execution sandbox — run code in 60+ languages.", endpoints: 2 },
];

export default function WrappedApisPage() {
  return (
    <article className="max-w-4xl">
      <h1 className="font-impact text-3xl uppercase tracking-wide text-text-primary">Wrapped APIs</h1>
      <p className="mt-3 text-lg text-text-secondary">
        Call third-party APIs and pay per use in USDC on Algorand. No upstream accounts or API keys needed.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-text-primary">How it works</h2>
        <div className="mt-4 space-y-4">
          {[
            { step: "1", title: "Discover available APIs", desc: "Fetch the catalog to see which providers and endpoints are available for your agent.", code: `curl -s ${CONSOLE_URL}/api/wrapped/md \\\n  -H "Authorization: Bearer YOUR_API_KEY"` },
            { step: "2", title: "Call any endpoint", desc: "Send a POST request with the parameters the upstream API expects.", code: `curl -X POST ${CONSOLE_URL}/api/wrapped/firecrawl/scrape \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"url": "https://example.com", "formats": ["markdown"]}'` },
            { step: "3", title: "Get the response, pay automatically", desc: "The upstream API response is returned directly. The cost is deducted from your wallet in USDC.", code: `{\n  "success": true,\n  "data": { "...response from the upstream API..." }\n}` },
          ].map((s) => (
            <div key={s.step} className="neopop-card-flat border-l-4 border-l-neopop-yellow p-5">
              <div className="flex items-center gap-3">
                <span className="font-impact text-2xl text-neopop-yellow">{s.step}</span>
                <h3 className="font-bold text-text-primary">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{s.desc}</p>
              <pre className="mt-3 overflow-x-auto bg-background p-3 font-mono text-xs text-text-primary"><code>{s.code}</code></pre>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-text-primary">Available Providers</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <div key={p.slug} className="neopop-card-flat p-4 transition hover:border-neopop-yellow/40">
              <p className="text-sm font-bold text-text-primary">{p.name}</p>
              <p className="mt-1 text-xs text-text-muted">{p.desc}</p>
              <p className="mt-2 text-xs font-bold text-neopop-yellow">{p.endpoints} endpoints</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12" id="pricing">
        <h2 className="text-xl font-bold text-text-primary">Pricing</h2>
        <p className="mt-2 text-sm text-text-secondary">Every wrapped API call has two cost components:</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-neopop-yellow text-neopop-black">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Component</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-bold text-text-primary">Upstream cost</td>
                <td className="px-4 py-3 text-text-secondary">The actual cost of the third-party API call (varies by provider and endpoint)</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-bold text-text-primary">AlgoPay fee</td>
                <td className="px-4 py-3 text-text-secondary">A flat $0.003 per call for most providers. AI model providers use a 15% markup on token costs instead.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-text-primary">Billing and Safety</h2>
        <p className="mt-2 text-sm text-text-secondary">Wrapped APIs use a charge-on-success model:</p>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2"><span className="mt-1 block h-1.5 w-1.5 shrink-0 bg-neopop-yellow" />Your allowance is reserved before the upstream call to prevent overspending</li>
          <li className="flex items-start gap-2"><span className="mt-1 block h-1.5 w-1.5 shrink-0 bg-neopop-yellow" />If the upstream call fails, your allowance is restored — you&apos;re never charged for failed calls</li>
          <li className="flex items-start gap-2"><span className="mt-1 block h-1.5 w-1.5 shrink-0 bg-neopop-yellow" />High-value calls above your approval threshold return a 202 with an approval URL</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-text-primary">Next Steps</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href="/docs/agent-integration" className="neopop-card-flat border-l-2 border-l-neopop-yellow p-4 transition hover:border-neopop-yellow/40">
            <p className="text-sm font-bold text-text-primary">Agent Integration</p>
            <p className="mt-1 text-xs text-text-muted">Authentication, discovery, calling endpoints</p>
          </Link>
          <Link href="/docs/x402" className="neopop-card-flat border-l-2 border-l-neopop-blue p-4 transition hover:border-neopop-yellow/40">
            <p className="text-sm font-bold text-text-primary">x402 HTTP Payments</p>
            <p className="mt-1 text-xs text-text-muted">Pay-per-request via HTTP 402 on Algorand</p>
          </Link>
        </div>
      </section>
    </article>
  );
}
