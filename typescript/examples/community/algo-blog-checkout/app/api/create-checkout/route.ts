import { NextResponse } from "next/server";
import { AlgoPay, Network } from "@algodev-studio/algopay";

const MERCHANT_ADDRESS =
  process.env.ALGOPAY_MERCHANT_ADDRESS ??
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";

export async function POST(req: Request) {
  try {
    const { slug, amount } = (await req.json()) as {
      slug?: string;
      amount?: string;
    };

    if (!slug || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing slug or amount" },
        { status: 400 },
      );
    }

    const client = new AlgoPay({ network: Network.ALGORAND_TESTNET });

    const walletSet = await client.createWalletSet("blog-checkout");
    const wallet = await client.createWallet(walletSet.id);

    await client.addSingleTxGuard(wallet.id, {
      maxAmount: "1.00",
      name: "article_cap",
    });

    const result = await client.pay(wallet.id, MERCHANT_ADDRESS, amount, {
      purpose: `Blog article: ${slug}`,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        txId: result.blockchainTx ?? result.transactionId,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error ?? "Payment failed" },
      { status: 402 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
