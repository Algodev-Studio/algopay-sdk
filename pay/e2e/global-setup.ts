import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default async function globalSetup() {
  const dbUrl =
    process.env.DATABASE_URL ??
    "postgresql://algopay_e2e:algopay_e2e@localhost:5433/algopay_e2e?schema=public";
  const directUrl = process.env.DIRECT_URL ?? dbUrl;
  const env = {
    ...process.env,
    DATABASE_URL: dbUrl,
    DIRECT_URL: directUrl,
    SESSION_SECRET: process.env.SESSION_SECRET ?? "0123456789abcdef0123456789abcdef",
    ALGOPAY_VAULT_MASTER_KEY:
      process.env.ALGOPAY_VAULT_MASTER_KEY ?? "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
  };
  execSync("npx prisma db push --skip-generate", {
    cwd: root,
    env,
    stdio: "inherit",
  });
}
