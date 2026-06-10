# MCP Weather Payer

TypeScript **MCP tool** that pays for weather data via AlgoPay (`pay()` → x402 HTTPS URL).

## Quick start

```bash
cd typescript/examples/community/mcp-weather-payer
npm install
npm run build --workspace=@algodev-studio/algopay   # from repo root, once
npm start -- San Francisco
```

## MCP server (optional)

```bash
npm install @modelcontextprotocol/sdk
npm run mcp
```

Connect from Cursor / Claude Desktop MCP config (stdio).

## Environment

| Variable | Description |
|----------|-------------|
| `ALGOPAY_X402_URL` | x402-protected weather API base URL |
| `ALGOPAY_MAX_USDC` | Max USDC per call (default `0.10`) |

## What it demonstrates

- TypeScript SDK x402 routing from an MCP tool handler
- Budget + single-tx guards before pay
- `simulate()` then `pay()` agent pattern

## Built by

Reference integration by the AlgoPay team.

**Design partner quote slot:** *"[Your name]: Plugged it into my agent in an afternoon."*
