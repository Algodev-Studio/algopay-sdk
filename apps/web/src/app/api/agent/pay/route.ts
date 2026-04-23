import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/api-key";
import { vaultDecrypt } from "@/lib/vault";
import { validatePayAgainstWorkspace } from "@/lib/policy";
import { submitUsdcTransfer } from "@/lib/algorand";

const bodySchema = z.object({
  walletId: z.string(),
  recipient: z.string(),
  amount: z.string(),
  purpose: z.string().optional(),
  feeLevelMult: z.number().int().min(1).max(4).optional(),
});

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "missing_bearer_token" }, { status: 401 });
  }
  const keyHash = hashApiKey(token);
  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (!apiKey) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
  }
  const workspace = await prisma.workspace.findUnique({ where: { id: apiKey.workspaceId } });
  if (!workspace) {
    return NextResponse.json({ error: "workspace_missing" }, { status: 500 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { walletId, recipient, amount, purpose, feeLevelMult } = parsed.data;

  const policy = validatePayAgainstWorkspace(workspace, { amount, recipient, purpose });
  if (!policy.ok) {
    return NextResponse.json({ error: policy.error, status: "blocked" }, { status: 403 });
  }

  const wallet = await prisma.wallet.findFirst({
    where: {
      id: walletId,
      set: { workspaceId: workspace.id },
    },
  });
  if (!wallet) {
    return NextResponse.json({ error: "wallet_not_found" }, { status: 404 });
  }

  let mnemonic: string;
  try {
    mnemonic = vaultDecrypt(wallet.vaultBlob);
  } catch {
    return NextResponse.json({ error: "vault_decrypt_failed" }, { status: 500 });
  }

  const dec = amount.includes(".") ? amount : `${amount}.0`;
  const micro = BigInt(Math.round(Number(dec) * 1_000_000));
  if (micro <= 0n) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  const entry = await prisma.ledgerEntry.create({
    data: {
      workspaceId: workspace.id,
      walletId: wallet.id,
      recipient,
      amount,
      purpose: purpose ?? null,
      status: "pending",
    },
  });

  try {
    const { txId } = await submitUsdcTransfer({
      mnemonic,
      network: workspace.network,
      to: recipient,
      amountMicro: micro,
      feeLevelMult,
    });
    await prisma.ledgerEntry.update({
      where: { id: entry.id },
      data: { status: "completed", txHash: txId },
    });
    return NextResponse.json({
      success: true,
      txId,
      walletId: wallet.id,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.ledgerEntry.update({
      where: { id: entry.id },
      data: { status: "failed" },
    });
    return NextResponse.json({ success: false, error: msg }, { status: 502 });
  }
}
