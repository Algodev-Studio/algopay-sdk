import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const ws = await requireWorkspace();
    const { paymentId } = await params;
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, workspaceId: ws.id },
      include: { agent: true, pool: true },
    });
    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(payment);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
