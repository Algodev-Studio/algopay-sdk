/**
 * Server-side key vault (Option 2 — Locus-like permissioned signing).
 * AES-256-GCM with a master key from env. Production should use KMS/HSM wrapping this key.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;
const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;

function getMasterKeyBytes(): Buffer {
  const b64 = process.env.ALGOPAY_VAULT_MASTER_KEY;
  if (!b64) {
    throw new Error("ALGOPAY_VAULT_MASTER_KEY is required (base64-encoded 32-byte key)");
  }
  const buf = Buffer.from(b64, "base64");
  if (buf.length !== KEY_LEN) {
    throw new Error("ALGOPAY_VAULT_MASTER_KEY must decode to exactly 32 bytes");
  }
  return buf;
}

function deriveKey(master: Buffer, salt: Buffer): Buffer {
  return scryptSync(master, salt, KEY_LEN);
}

/** Encrypt mnemonic or secret; returns single base64 blob. */
export function vaultEncrypt(plaintext: string, contextSalt?: Buffer): string {
  const master = getMasterKeyBytes();
  const salt = contextSalt ?? randomBytes(SALT_LEN);
  const key = deriveKey(master, salt);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([salt, iv, tag, enc]);
  return combined.toString("base64");
}

export function vaultDecrypt(blobB64: string): string {
  const master = getMasterKeyBytes();
  const combined = Buffer.from(blobB64, "base64");
  if (combined.length < SALT_LEN + IV_LEN + TAG_LEN + 1) {
    throw new Error("Invalid vault blob");
  }
  const salt = combined.subarray(0, SALT_LEN);
  const iv = combined.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = combined.subarray(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + TAG_LEN);
  const enc = combined.subarray(SALT_LEN + IV_LEN + TAG_LEN);
  const key = deriveKey(master, salt);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
