import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const ws = await requireWorkspace();
    const { agentId } = await params;
    const result = await prisma.agent.updateMany({
      where: { id: agentId, workspaceId: ws.id },
      data: { status: "suspended" },
    });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.auditLog.create({
      data: { workspaceId: ws.id, action: "agent_suspended", metadata: JSON.stringify({ agentId }) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
