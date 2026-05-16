import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, requireWorkspace } from "@/lib/workspace";
import { generateApiKey } from "@/lib/api-key";

export async function GET() {
  try {
    const workspace = await requireWorkspace();
    const keys = await prisma.apiKey.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      keys: keys.map((k) => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        createdAt: k.createdAt,
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

    const { full, prefix, hash } = generateApiKey();
    await prisma.apiKey.create({
      data: {
        workspaceId: workspace.id,
        name: parsed.data.name,
        keyHash: hash,
        prefix,
      },
    });
    return NextResponse.json({
      apiKey: full,
      message: "Store this key securely; it is shown only once.",
    });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
