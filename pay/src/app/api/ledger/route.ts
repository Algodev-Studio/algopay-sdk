import { NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const workspace = await requireWorkspace();
    const entries = await prisma.ledgerEntry.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
