import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const ws = await requireWorkspace();
    const pools = await prisma.gasPool.findMany({
      where: { workspaceId: ws.id },
      include: { apiKey: true, agents: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pools);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const body = await req.json();
    const pool = await prisma.gasPool.create({
      data: {
        workspaceId: ws.id,
        apiKeyId: body.apiKeyId || null,
        balanceUsdc: body.balanceUsdc ?? "0",
        dailyCapCents: body.dailyCapCents ?? 0,
        alertThresholdUsdc: body.alertThresholdUsdc ?? "0",
        status: "healthy",
      },
    });

    await prisma.auditLog.create({
      data: { workspaceId: ws.id, action: "gas_pool_created", metadata: { poolId: pool.id } },
    });

    return NextResponse.json(pool, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create gas pool" }, { status: 400 });
  }
}
