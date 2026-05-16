import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const ws = await requireWorkspace();
    const agents = await prisma.agent.findMany({
      where: { workspaceId: ws.id },
      include: { pool: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(agents);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const body = await req.json();
    const agent = await prisma.agent.create({
      data: {
        workspaceId: ws.id,
        name: body.name,
        algoAddress: body.algoAddress,
        dailyLimitCents: body.dailyLimitCents ?? 10000,
        poolId: body.poolId || null,
      },
    });

    await prisma.auditLog.create({
      data: { workspaceId: ws.id, action: "agent_created", metadata: JSON.stringify({ agentId: agent.id }) },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create agent" }, { status: 400 });
  }
}
