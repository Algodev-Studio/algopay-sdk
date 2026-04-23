import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/session";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "email_in_use" }, { status: 409 });
  }
  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      workspaces: {
        create: {
          name: "Default",
          network: process.env.ALGOPAY_NETWORK === "algorand-mainnet" ? "mainnet" : "testnet",
        },
      },
    },
  });
  const token = await createSessionToken(user.id);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, userId: user.id });
}
