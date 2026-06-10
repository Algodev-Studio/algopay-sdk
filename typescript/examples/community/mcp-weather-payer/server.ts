/**
 * Optional MCP server exposing get_weather with AlgoPay x402 payments.
 * Requires: npm install @modelcontextprotocol/sdk
 * Run: npm run mcp
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getWeatherPaid } from "./weather-tool.js";

const server = new Server(
  { name: "mcp-weather-payer", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_weather",
      description: "Fetch weather for a city (x402 pay-per-call via AlgoPay)",
      inputSchema: {
        type: "object",
        properties: { city: { type: "string" } },
        required: ["city"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name !== "get_weather") {
    throw new Error(`Unknown tool: ${req.params.name}`);
  }
  const city = String((req.params.arguments as { city?: string })?.city ?? "London");
  const text = await getWeatherPaid(city);
  return { content: [{ type: "text", text }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
