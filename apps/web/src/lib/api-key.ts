import { createHash, randomBytes } from "node:crypto";

export function generateApiKey(): { full: string; prefix: string; hash: string } {
  const secret = randomBytes(24).toString("base64url");
  const full = `sk_live_${secret}`;
  const prefix = full.slice(0, 12);
  const hash = createHash("sha256").update(full).digest("hex");
  return { full, prefix, hash };
}

export function hashApiKey(full: string): string {
  return createHash("sha256").update(full).digest("hex");
}
