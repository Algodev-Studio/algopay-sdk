import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: { workspaces: true },
  });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    email: user.email,
    workspaces: user.workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      network: w.network,
    })),
  });
}
