/** Deployed landing site (marketing + docs). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://algopay-sdk-pay.vercel.app";

/** Docs base URL on the landing site. */
export const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL?.replace(/\/$/, "") ??
  `${SITE_URL}/docs`;
