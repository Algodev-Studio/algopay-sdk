/**
 * MCP Weather Payer — pay for a weather API call via AlgoPay (x402-ready).
 *
 * Run: npm install && npm start
 * Env: ALGOPAY_X402_URL (HTTPS x402 endpoint), ALGOPAY_MAX_USDC (default 0.10)
 */

import { AlgoPay, Network } from "@algodev-studio/algopay";

const WEATHER_URL =
  process.env.ALGOPAY_X402_URL ?? "https://example.com/weather/x402";
const MAX_USDC = process.env.ALGOPAY_MAX_USDC ?? "0.10";

/** MCP tool handler: get_weather(city) — pays then returns data. */
export async function getWeatherPaid(city: string): Promise<string> {
  const client = new AlgoPay({ network: Network.ALGORAND_TESTNET });
  const ws = await client.createWalletSet("mcp-weather");
  const wallet = await client.createWallet(ws.id);

  await client.addBudgetGuard(wallet.id, { dailyLimit: "1.0", name: "mcp_daily" });
  await client.addSingleTxGuard(wallet.id, { maxAmount: MAX_USDC });

  const url = `${WEATHER_URL}?city=${encodeURIComponent(city)}`;
  console.log(`[mcp-weather] Paying up to ${MAX_USDC} USDC for ${url}`);

  const sim = await client.simulate(wallet.id, url, MAX_USDC);
  if (!sim.wouldSucceed) {
    return `Blocked by guard: ${sim.reason ?? "unknown"}`;
  }

  const result = await client.pay(wallet.id, url, MAX_USDC, {
    purpose: `Weather lookup: ${city}`,
  });

  if (!result.success) {
    return `Payment failed: ${result.error ?? result.status}`;
  }

  if (result.resourceData) {
    return typeof result.resourceData === "string"
      ? result.resourceData
      : JSON.stringify(result.resourceData);
  }
  return `Paid ${result.amount} USDC (tx ${result.blockchainTx ?? "pending"})`;
}

async function main() {
  const city = process.argv[2] ?? "San Francisco";
  const out = await getWeatherPaid(city);
  console.log(out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
