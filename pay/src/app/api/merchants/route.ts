import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const ws = await requireWorkspace();
    const merchants = await prisma.merchant.findMany({
      where: { workspaceId: ws.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(merchants);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const body = await req.json();
    const merchant = await prisma.merchant.create({
      data: {
        workspaceId: ws.id,
        name: body.name,
        algoAddress: body.algoAddress,
      },
    });
    return NextResponse.json(merchant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create merchant" }, { status: 400 });
  }
}
