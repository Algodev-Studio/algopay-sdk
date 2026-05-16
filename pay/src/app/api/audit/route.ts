import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "50");
    const offset = parseInt(url.searchParams.get("offset") ?? "0");

    const logs = await prisma.auditLog.findMany({
      where: { workspaceId: ws.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
