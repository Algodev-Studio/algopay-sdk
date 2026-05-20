import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const ws = await requireWorkspace();
    const { paymentId } = await params;

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, workspaceId: ws.id, status: "pending" },
    });
    if (!payment) return NextResponse.json({ error: "Payment not found or already processed" }, { status: 404 });

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "processing" },
    });

    const txnId = `SIM_${Date.now()}_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "settled",
        algoTxnId: txnId,
        confirmedAt: new Date(),
        timeline: [
          { step: "initiated", status: "done", timestamp: payment.createdAt.getTime() },
          { step: "processing", status: "done", timestamp: Date.now() - 1000 },
          { step: "settled", status: "done", timestamp: Date.now() },
        ],
      },
    });

    await prisma.auditLog.create({
      data: { workspaceId: ws.id, action: "payment_settled", metadata: { paymentId, txnId } },
    });

    const updated = await prisma.payment.findUnique({ where: { id: paymentId }, include: { agent: true } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
