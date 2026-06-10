# Algo Blog Checkout

Built by a community contributor who wanted **Stripe-like checkout** for their Algorand-powered blog. Uses `@algodev-studio/algopay` to gate premium content behind USDC payments with the **x402 / HTTP 402 Payment Required** pattern.

Readers browse freely, hit a paywall on premium articles, pay 0.10 USDC via AlgoPay, and unlock the content instantly — no accounts, no subscriptions, just a single on-chain payment.

## How it works

1. Blog index shows free and premium posts.
2. Clicking a premium post returns an **HTTP 402**-style paywall page.
3. The reader clicks **"Pay to Read"**, gets redirected to a checkout page.
4. Checkout calls the API to create an AlgoPay payment session (wallet → USDC transfer → merchant address).
5. On success, a `paid_{slug}` cookie is set and the reader is redirected to the full article.

## Setup

```bash
cd typescript/examples/community/algo-blog-checkout
npm install
```

### Environment variables

Create a `.env.local` file:

```env
# Algorand address that receives article payments
ALGOPAY_MERCHANT_ADDRESS=YOUR_ALGORAND_ADDRESS_HERE
```

> The SDK picks up its own config from the environment automatically (API keys, network, etc.). See the main AlgoPay docs for details.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 15** (App Router)
- **@algodev-studio/algopay** — wallet creation, USDC payments, guards
- **Tailwind CSS** — dark theme, yellow accents
- **Cookies** — lightweight access control (no database needed)

## What it demonstrates

- HTTP 402 Payment Required pattern for content monetization
- AlgoPay `createWalletSet` → `createWallet` → `pay()` flow
- SingleTxGuard to cap per-article spend
- Cookie-based access gating (simple, demo-appropriate)
- Clean Stripe-like checkout UX on Algorand

## Built by

Community contribution — feel free to fork and adapt for your own blog or content platform.

**Design partner quote slot:** *"[Your name]: Added pay-per-article to my blog in a weekend."*
