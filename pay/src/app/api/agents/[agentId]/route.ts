import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const ws = await requireWorkspace();
    const { agentId } = await params;
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, workspaceId: ws.id },
      include: { pool: true },
    });
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(agent);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const ws = await requireWorkspace();
    const { agentId } = await params;
    const body = await req.json();
    const agent = await prisma.agent.updateMany({
      where: { id: agentId, workspaceId: ws.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.dailyLimitCents !== undefined && { dailyLimitCents: body.dailyLimitCents }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.poolId !== undefined && { poolId: body.poolId }),
      },
    });
    if (agent.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}
