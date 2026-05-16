import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ merchantId: string }> }) {
  try {
    const ws = await requireWorkspace();
    const { merchantId } = await params;
    await prisma.merchant.deleteMany({
      where: { id: merchantId, workspaceId: ws.id },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
