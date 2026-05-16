import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const ws = await requireWorkspace();
    const webhooks = await prisma.webhook.findMany({
      where: { workspaceId: ws.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(webhooks);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const body = await req.json();
    const webhook = await prisma.webhook.create({
      data: {
        workspaceId: ws.id,
        url: body.url,
        events: JSON.stringify(body.events ?? []),
        secret: `whsec_${randomBytes(24).toString("hex")}`,
      },
    });
    return NextResponse.json(webhook, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 400 });
  }
}
