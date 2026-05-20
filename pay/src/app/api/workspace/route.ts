import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, requireWorkspace } from "@/lib/workspace";

const patchSchema = z.object({
  network: z.enum(["testnet", "mainnet"]).optional(),
  maxDailyUsdc: z.string().nullable().optional(),
  maxSingleTxUsdc: z.string().nullable().optional(),
  approvalThresholdUsdc: z.string().nullable().optional(),
  requireJustification: z.boolean().optional(),
  recipientAllowlist: z.array(z.string()).nullable().optional(),
});

export async function GET() {
  try {
    const ws = await requireWorkspace();
    return NextResponse.json({
      id: ws.id,
      name: ws.name,
      network: ws.network,
      maxDailyUsdc: ws.maxDailyUsdc,
      maxSingleTxUsdc: ws.maxSingleTxUsdc,
      approvalThresholdUsdc: ws.approvalThresholdUsdc,
      requireJustification: ws.requireJustification,
      recipientAllowlist: ws.recipientAllowlist as string[] | null,
    });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const ws = await requireWorkspace();
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "validation_error" }, { status: 400 });
    const d = parsed.data;
    const updated = await prisma.workspace.update({
      where: { id: ws.id },
      data: {
        ...(d.network !== undefined && { network: d.network }),
        ...(d.maxDailyUsdc !== undefined && { maxDailyUsdc: d.maxDailyUsdc }),
        ...(d.maxSingleTxUsdc !== undefined && { maxSingleTxUsdc: d.maxSingleTxUsdc }),
        ...(d.approvalThresholdUsdc !== undefined && { approvalThresholdUsdc: d.approvalThresholdUsdc }),
        ...(d.requireJustification !== undefined && { requireJustification: d.requireJustification }),
        ...(d.recipientAllowlist !== undefined && {
          recipientAllowlist: d.recipientAllowlist,
        }),
      },
    });
    return NextResponse.json({ ok: true, id: updated.id });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
