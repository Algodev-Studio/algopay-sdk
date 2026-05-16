import { NextRequest, NextResponse } from "next/server";
import { getUsdcBalance, getAlgoBalance } from "@/lib/algorand";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  const network = url.searchParams.get("network") ?? "testnet";

  if (!address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  try {
    const [algoBalance, usdcBalance] = await Promise.all([
      getAlgoBalance(address, network),
      getUsdcBalance(address, network).catch(() => "0.000000"),
    ]);

    return NextResponse.json({ address, network, algoBalance, usdcBalance });
  } catch {
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
}
