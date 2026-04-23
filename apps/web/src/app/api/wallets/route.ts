import algosdk from "algosdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { requireWorkspace } from "@/lib/workspace";
import { vaultEncrypt } from "@/lib/vault";
import { getUsdcBalance } from "@/lib/algorand";

export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const workspace = await requireWorkspace(uid);
  const wallets = await prisma.wallet.findMany({
    where: { set: { workspaceId: workspace.id } },
    include: { set: true },
  });
  const withBal = await Promise.all(
    wallets.map(async (w) => {
      let balance = "0.000000";
      try {
        balance = await getUsdcBalance(w.address, workspace.network);
      } catch {
        /* indexer miss */
      }
      return {
        id: w.id,
        address: w.address,
        walletSetId: w.walletSetId,
        walletSetName: w.set.name,
        usdcBalance: balance,
      };
    }),
  );
  return NextResponse.json({ wallets: withBal });
}

const postSchema = z.object({
  walletSetId: z.string(),
  label: z.string().optional(),
});

export async function POST(req: Request) {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const workspace = await requireWorkspace(uid);
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "validation_error" }, { status: 400 });

  const set = await prisma.walletSet.findFirst({
    where: { id: parsed.data.walletSetId, workspaceId: workspace.id },
  });
  if (!set) return NextResponse.json({ error: "wallet_set_not_found" }, { status: 404 });

  const acc = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(acc.sk);
  const vaultBlob = vaultEncrypt(mnemonic);

  const w = await prisma.wallet.create({
    data: {
      walletSetId: set.id,
      address: acc.addr.toString(),
      vaultBlob,
    },
  });
  return NextResponse.json({
    id: w.id,
    address: w.address,
    walletSetId: w.walletSetId,
  });
}
