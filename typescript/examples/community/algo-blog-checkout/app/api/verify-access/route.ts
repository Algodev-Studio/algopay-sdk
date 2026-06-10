import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { access: false, error: "Missing slug parameter" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const paid = cookieStore.get(`paid_${slug}`)?.value === "true";

  return NextResponse.json({ access: paid, slug });
}
