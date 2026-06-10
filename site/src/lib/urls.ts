/** Deployed landing site (marketing + docs). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://algodevstudio.vercel.app";

/** Deployed AlgoPay console (dashboard + REST API). */
export const CONSOLE_URL =
  process.env.NEXT_PUBLIC_CONSOLE_URL?.replace(/\/$/, "") ??
  "https://algopay-sdk-pay.vercel.app";
