import { NextRequest, NextResponse } from "next/server";
import { prisma, requireWorkspace } from "@/lib/workspace";
import { getAlgodClient, getExplorerUrl } from "@/lib/algorand";

export async function POST(req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const ws = await requireWorkspace();
    const { paymentId } = await params;
    const body = await req.json();
    const signedTxns: string[] = body.signedTransactions;

    if (!signedTxns || !Array.isArray(signedTxns)) {
      return NextResponse.json({ error: "signedTransactions array is required" }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, workspaceId: ws.id, status: "processing" },
    });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found or not in processing state" }, { status: 404 });
    }

    const algod = getAlgodClient(payment.network);
    const rawTxns = signedTxns.map((txn) => Buffer.from(txn, "base64"));

    try {
      const { txid } = await algod.sendRawTransaction(rawTxns).do();

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "settled",
          algoTxnId: txid,
          confirmedAt: new Date(),
          timeline: JSON.stringify([
            { step: "initiated", status: "done", timestamp: payment.createdAt.getTime() },
            { step: "processing", status: "done", timestamp: Date.now() - 2000 },
            { step: "settled", status: "done", timestamp: Date.now() },
          ]),
        },
      });

      await prisma.auditLog.create({
        data: {
          workspaceId: ws.id,
          action: "payment_settled",
          metadata: JSON.stringify({ paymentId, txid, explorer: getExplorerUrl(txid, payment.network) }),
        },
      });

      return NextResponse.json({
        paymentId,
        txId: txid,
        status: "settled",
        explorerUrl: getExplorerUrl(txid, payment.network),
      });
    } catch (submitErr) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "failed",
          timeline: JSON.stringify([
            { step: "initiated", status: "done", timestamp: payment.createdAt.getTime() },
            { step: "processing", status: "done", timestamp: Date.now() - 2000 },
            { step: "submission", status: "failed", timestamp: Date.now(), detail: String(submitErr) },
          ]),
        },
      });
      return NextResponse.json({ error: "Transaction submission failed" }, { status: 500 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to submit payment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
