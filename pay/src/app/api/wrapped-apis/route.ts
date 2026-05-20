import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";

const DEFAULT_PROVIDERS = [
  {
    slug: "openai",
    name: "OpenAI",
    description:
      "GPT chat, embeddings, image generation, text-to-speech",
    endpoints: 8,
  },
  {
    slug: "firecrawl",
    name: "Firecrawl",
    description:
      "Web scraping, crawling, and structured data extraction",
    endpoints: 4,
  },
  {
    slug: "tavily",
    name: "Tavily",
    description:
      "AI-optimized web search, extraction, and crawling",
    endpoints: 3,
  },
];

export async function GET() {
  try {
    const ws = await requireWorkspace();
    let providers = await prisma.wrappedApiProvider.findMany({
      where: { workspaceId: ws.id },
      orderBy: { createdAt: "asc" },
    });

    if (providers.length === 0) {
      await prisma.wrappedApiProvider.createMany({
        data: DEFAULT_PROVIDERS.map((p) => ({
          workspaceId: ws.id,
          ...p,
        })),
      });
      providers = await prisma.wrappedApiProvider.findMany({
        where: { workspaceId: ws.id },
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({ providers });
  } catch {
    return NextResponse.json(
      { error: "Failed to load providers" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ws = await requireWorkspace();
    const body = await req.json();
    const { slug } = body;

    const provider = await prisma.wrappedApiProvider.findUnique({
      where: { workspaceId_slug: { workspaceId: ws.id, slug } },
    });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const updated = await prisma.wrappedApiProvider.update({
      where: { id: provider.id },
      data: { enabled: !provider.enabled },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to toggle provider" },
      { status: 500 },
    );
  }
}
