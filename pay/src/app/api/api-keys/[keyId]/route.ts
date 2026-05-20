import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ keyId: string }> }) {
  try {
    const ws = await requireWorkspace();
    const { keyId } = await params;
    const result = await prisma.apiKey.deleteMany({
      where: { id: keyId, workspaceId: ws.id },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
