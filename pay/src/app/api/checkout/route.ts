import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const ws = await requireWorkspace();
    const sessions = await prisma.checkoutSession.findMany({
      where: { workspaceId: ws.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const body = await req.json();
    const session = await prisma.checkoutSession.create({
      data: {
        workspaceId: ws.id,
        merchantId: body.merchantId || null,
        amount: String(body.amount),
        description: body.description || null,
        expiresAt: new Date(Date.now() + (body.expiryMinutes ?? 30) * 60000),
        webhookUrl: body.webhookUrl || null,
        webhookSecret: body.webhookUrl ? `whsec_${randomBytes(24).toString("hex")}` : null,
      },
    });
    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 400 });
  }
}
