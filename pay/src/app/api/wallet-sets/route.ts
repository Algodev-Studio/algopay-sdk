import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const workspace = await requireWorkspace();
    const sets = await prisma.walletSet.findMany({
      where: { workspaceId: workspace.id },
      include: { _count: { select: { wallets: true } } },
    });
    return NextResponse.json({
      walletSets: sets.map((s) => ({
        id: s.id,
        name: s.name,
        walletCount: s._count.wallets,
      })),
    });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}

const postSchema = z.object({ name: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const workspace = await requireWorkspace();
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "validation_error" }, { status: 400 });
    const set = await prisma.walletSet.create({
      data: { workspaceId: workspace.id, name: parsed.data.name },
    });
    return NextResponse.json({ id: set.id, name: set.name });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
