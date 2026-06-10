import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Trace deps hoisted to the monorepo root (required for Vercel workspace deploys).
  outputFileTracingRoot: path.join(__dirname, ".."),
  transpilePackages: ["@txnlab/use-wallet-react", "@txnlab/use-wallet"],
  webpack: (config) => {
    // Optional Web3Auth peers — only needed when that wallet adapter is enabled.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@web3auth/modal": false,
      "@web3auth/single-factor-auth": false,
      "@web3auth/base": false,
      "@web3auth/base-provider": false,
    };
    return config;
  },
};

export default nextConfig;
