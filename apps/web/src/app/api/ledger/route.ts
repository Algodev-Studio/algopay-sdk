import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { requireWorkspace } from "@/lib/workspace";

export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const workspace = await requireWorkspace(uid);
  const entries = await prisma.ledgerEntry.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ entries });
}
