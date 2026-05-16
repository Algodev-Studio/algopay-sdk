"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";
import type { Payment } from "@/lib/types";

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ApprovalsPage() {
  const [pending, setPending] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const payments = await api.get<Payment[]>("/api/payments?status=pending");
      setPending(payments);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  async function handleAction(paymentId: string, action: "approve" | "reject") {
    setActionLoading(paymentId);
    try {
      if (action === "approve") {
        await api.post(`/api/payments/${paymentId}/approve`, {});
      } else {
        await api.post(`/api/payments/${paymentId}/reject`, {});
      }
      fetchPending();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="space-y-4">
      <div className="flex items-center gap-3">
        <ShieldCheck size={24} className="text-teal-400" />
        <h1 className="text-2xl font-bold text-slate-100">Approvals</h1>
        {!loading && pending.length > 0 && (
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
            {pending.length} pending
          </span>
        )}
      </div>

      <AnimatedSection>
        <div className="rounded-lg bg-[#212121] p-4">
          <p className="mb-1 text-sm text-slate-400">
            Payments that exceed the workspace approval threshold appear here for manual review.
          </p>
        </div>
      </AnimatedSection>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-[#212121]" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <AnimatedSection>
          <div className="rounded-lg bg-[#212121] p-10 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-400" />
            <p className="text-lg font-medium text-slate-200">All clear</p>
            <p className="mt-1 text-sm text-slate-400">No payments require approval right now.</p>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection>
          <div className="overflow-hidden rounded-lg bg-[#212121]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-btn-gradient uppercase text-slate-900">
                  <tr>
                    <th className="px-3 py-3">Invoice ID</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Agent</th>
                    <th className="px-3 py-3">Network</th>
                    <th className="px-3 py-3">Requested</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p) => (
                    <tr key={p.id} className="border-t border-slate-800 text-slate-200 hover:bg-slate-800/40">
                      <td className="px-3 py-3 font-mono text-xs">{p.invoiceId}</td>
                      <td className="px-3 py-3">
                        <span className="text-lg font-bold">{formatUsd(p.amountUsdCents)}</span>
                      </td>
                      <td className="px-3 py-3">{p.agent?.name ?? p.agentId.slice(0, 8)}</td>
                      <td className="px-3 py-3 text-xs uppercase text-slate-400">{p.network}</td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock size={12} /> {timeAgo(p.createdAt)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => handleAction(p.id, "approve")} disabled={actionLoading === p.id}
                            className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-40">
                            {actionLoading === p.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Approve
                          </button>
                          <button type="button" onClick={() => handleAction(p.id, "reject")} disabled={actionLoading === p.id}
                            className="flex items-center gap-1 rounded-md bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/30 disabled:opacity-40">
                            {actionLoading === p.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />} Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>
      )}
    </motion.section>
  );
}
