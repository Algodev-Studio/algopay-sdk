import type { Workspace } from "@prisma/client";

export function validatePayAgainstWorkspace(
  ws: Pick<
    Workspace,
    "maxSingleTxUsdc" | "requireJustification" | "recipientAllowlist"
  >,
  input: { amount: string; recipient: string; purpose?: string | null },
): { ok: true } | { ok: false; error: string } {
  if (ws.requireJustification) {
    const p = (input.purpose ?? "").trim();
    if (p.length < 1) {
      return { ok: false, error: "purpose_required: workspace mandates justification (Locus-style)" };
    }
  }

  if (ws.maxSingleTxUsdc) {
    const max = Number(ws.maxSingleTxUsdc);
    const amt = Number(input.amount);
    if (!Number.isFinite(amt) || amt > max) {
      return { ok: false, error: `amount exceeds max_single_tx (${ws.maxSingleTxUsdc})` };
    }
  }

  if (ws.recipientAllowlist) {
    let list: string[] = [];
    try {
      list = JSON.parse(ws.recipientAllowlist) as string[];
    } catch {
      return { ok: false, error: "invalid_workspace_allowlist_config" };
    }
    if (list.length && !list.includes(input.recipient.trim())) {
      return { ok: false, error: "recipient_not_in_allowlist" };
    }
  }

  return { ok: true };
}
