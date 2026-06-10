import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/api-key";

const eventSchema = z.object({
  eventType: z.string(),
  walletId: z.string().optional(),
  recipient: z.string().optional(),
  amount: z.string().optional(),
  purpose: z.string().nullable().optional(),
  guardsPassed: z.array(z.string()).optional().default([]),
  guardBlockReason: z.string().nullable().optional(),
  txHash: z.string().nullable().optional(),
  sdkVersion: z.string().optional(),
  sdkLanguage: z.string().optional(),
  idempotencyKey: z.string().optional(),
  timestamp: z.string().optional(),
});

const bodySchema = z.union([
  eventSchema,
  z.object({ events: z.array(eventSchema) }),
]);

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "missing_bearer_token" }, { status: 401 });
  }

  const keyHash = hashApiKey(token);
  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (!apiKey) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const events = "events" in parsed.data ? parsed.data.events : [parsed.data];

  const created = await Promise.all(
    events.map(async (evt) => {
      const sdkEvent = await prisma.sdkEvent.create({
        data: {
          workspaceId: apiKey.workspaceId,
          eventType: evt.eventType,
          walletId: evt.walletId ?? null,
          recipient: evt.recipient ?? null,
          amount: evt.amount ?? null,
          purpose: evt.purpose ?? null,
          guardsPassed: evt.guardsPassed ?? [],
          guardBlockReason: evt.guardBlockReason ?? null,
          txHash: evt.txHash ?? null,
          sdkVersion: evt.sdkVersion ?? null,
          sdkLanguage: evt.sdkLanguage ?? null,
          idempotencyKey: evt.idempotencyKey ?? null,
          timestamp: evt.timestamp ? new Date(evt.timestamp) : new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          workspaceId: apiKey.workspaceId,
          action: `sdk.${evt.eventType}`,
          metadata: {
            sdkEventId: sdkEvent.id,
            walletId: evt.walletId,
            recipient: evt.recipient,
            amount: evt.amount,
            sdkLanguage: evt.sdkLanguage,
          },
        },
      });

      return sdkEvent.id;
    }),
  );

  return NextResponse.json({ accepted: created.length, ids: created }, { status: 202 });
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "missing_bearer_token" }, { status: 401 });
  }

  const keyHash = hashApiKey(token);
  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (!apiKey) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "50");
  const eventType = url.searchParams.get("eventType");
  const sdkLanguage = url.searchParams.get("sdkLanguage");

  const where: Record<string, unknown> = { workspaceId: apiKey.workspaceId };
  if (eventType) where.eventType = eventType;
  if (sdkLanguage) where.sdkLanguage = sdkLanguage;

  const events = await prisma.sdkEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ events });
}
