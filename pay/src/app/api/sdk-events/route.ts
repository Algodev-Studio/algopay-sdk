import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "100");
    const eventType = url.searchParams.get("eventType");
    const sdkLanguage = url.searchParams.get("sdkLanguage");

    const where: Record<string, unknown> = { workspaceId: ws.id };
    if (eventType) where.eventType = eventType;
    if (sdkLanguage) where.sdkLanguage = sdkLanguage;

    const events = await prisma.sdkEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
