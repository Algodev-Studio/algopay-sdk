import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> },
) {
  try {
    const ws = await requireWorkspace();
    const { endpointId } = await params;
    const result = await prisma.customEndpoint.deleteMany({
      where: { id: endpointId, workspaceId: ws.id },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Endpoint deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete endpoint" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> },
) {
  try {
    const ws = await requireWorkspace();
    const { endpointId } = await params;
    const body = await req.json();

    const existing = await prisma.customEndpoint.findFirst({
      where: { id: endpointId, workspaceId: ws.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const allowed = ["name", "description", "endpointUrl", "httpMethod", "enabled"] as const;
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }

    const updated = await prisma.customEndpoint.update({
      where: { id: endpointId },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update endpoint" },
      { status: 500 },
    );
  }
}
