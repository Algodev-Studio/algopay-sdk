import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const offset = parseInt(url.searchParams.get("offset") ?? "0");
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = { workspaceId: ws.id };
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: { agent: true, pool: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const body = await req.json();
    const payment = await prisma.payment.create({
      data: {
        invoiceId: body.invoiceId,
        workspaceId: ws.id,
        agentId: body.agentId,
        poolId: body.poolId,
        merchantId: body.merchantId || null,
        amountUsdCents: body.amountUsdCents,
        network: body.network ?? "testnet",
      },
    });

    await prisma.auditLog.create({
      data: { workspaceId: ws.id, action: "payment_initiated", metadata: { paymentId: payment.id } },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 400 });
  }
}
