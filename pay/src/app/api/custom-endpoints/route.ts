import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const ws = await requireWorkspace();
    const endpoints = await prisma.customEndpoint.findMany({
      where: { workspaceId: ws.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ endpoints });
  } catch {
    return NextResponse.json(
      { error: "Failed to load endpoints" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const body = await req.json();
    const { slug, name, description, endpointUrl, httpMethod } = body;

    if (!slug || !name || !endpointUrl || !httpMethod) {
      return NextResponse.json(
        { error: "slug, name, endpointUrl, and httpMethod are required" },
        { status: 400 },
      );
    }

    const endpoint = await prisma.customEndpoint.create({
      data: {
        workspaceId: ws.id,
        slug,
        name,
        description: description || null,
        endpointUrl,
        httpMethod,
      },
    });

    return NextResponse.json(
      { endpoint, message: "Endpoint created" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create endpoint" },
      { status: 500 },
    );
  }
}
