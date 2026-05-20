import { NextRequest, NextResponse } from "next/server";
import algosdk from "algosdk";
import { prisma, requireWorkspace } from "@/lib/workspace";
import { buildUnsignedPaymentTxns, getAlgodClient, USDC_ASA_ID } from "@/lib/algorand";

export async function POST(req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const ws = await requireWorkspace();
    const { paymentId } = await params;
    const body = await req.json();
    const senderAddress = body.senderAddress;

    if (!senderAddress) {
      return NextResponse.json({ error: "senderAddress is required" }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, workspaceId: ws.id, status: "pending" },
    });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found or not pending" }, { status: 404 });
    }

    const merchant = payment.merchantId
      ? await prisma.merchant.findUnique({ where: { id: payment.merchantId } })
      : null;

    const merchantAddress = merchant?.algoAddress ?? senderAddress;
    const amountMicroUsdc = BigInt(payment.amountUsdCents) * 10000n;
    const algod = getAlgodClient(payment.network);
    const suggestedParams = await algod.getTransactionParams().do();

    const txns = buildUnsignedPaymentTxns({
      senderAddress,
      merchantAddress,
      amountMicroUsdc,
      suggestedParams,
      network: payment.network,
    });

    const encodedTxns = txns.map((txn) =>
      Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64")
    );

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "processing",
        timeline: [
          { step: "initiated", status: "done", timestamp: payment.createdAt.getTime() },
          { step: "preparing", status: "done", timestamp: Date.now() },
        ],
      },
    });

    return NextResponse.json({
      paymentId,
      transactions: encodedTxns,
      usdcAsaId: USDC_ASA_ID[payment.network] ?? 10458941,
      network: payment.network,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to prepare payment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
