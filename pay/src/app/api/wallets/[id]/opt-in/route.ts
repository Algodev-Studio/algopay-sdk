import { NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";
import { vaultDecrypt } from "@/lib/vault";
import { optInToUsdc } from "@/lib/algorand";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspace = await requireWorkspace();
    const { id } = await params;

    const wallet = await prisma.wallet.findFirst({
      where: { id, set: { workspaceId: workspace.id } },
    });
    if (!wallet) {
      return NextResponse.json({ error: "wallet_not_found" }, { status: 404 });
    }

    const mnemonic = vaultDecrypt(wallet.vaultBlob);
    const { txId } = await optInToUsdc({ mnemonic, network: workspace.network });

    return NextResponse.json({ txId, status: "success" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "opt_in_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
