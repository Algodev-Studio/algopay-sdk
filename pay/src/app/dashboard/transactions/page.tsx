"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Filter,
  ChevronDown,
} from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api } from "@/lib/api-client";
import type { AuditLog } from "@/lib/types";

const ACTION_COLORS: Record<string, string> = {
  "payment.created": "bg-blue-500/20 text-blue-300",
  "payment.settled": "bg-emerald-500/20 text-emerald-300",
  "payment.failed": "bg-rose-500/20 text-rose-300",
  "agent.created": "bg-teal-500/20 text-teal-300",
  "agent.updated": "bg-amber-500/20 text-amber-300",
  "agent.suspended": "bg-rose-500/20 text-rose-300",
  "merchant.created": "bg-teal-500/20 text-teal-300",
  "merchant.deleted": "bg-rose-500/20 text-rose-300",
  "pool.created": "bg-teal-500/20 text-teal-300",
  "pool.topped_up": "bg-emerald-500/20 text-emerald-300",
  "key.created": "bg-blue-500/20 text-blue-300",
  "key.revoked": "bg-rose-500/20 text-rose-300",
  "webhook.created": "bg-teal-500/20 text-teal-300",
  "checkout.created": "bg-blue-500/20 text-blue-300",
  "checkout.paid": "bg-emerald-500/20 text-emerald-300",
};

function getActionColor(action: string): string {
  return ACTION_COLORS[action] ?? "bg-slate-500/20 text-slate-300";
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatMetadata(meta: Record<string, unknown> | null): string {
  if (!meta) return "—";
  const entries = Object.entries(meta);
  if (entries.length === 0) return "—";
  return entries
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(" · ");
}

const ACTION_FILTER_OPTIONS = [
  "All",
  "payment.created",
  "payment.settled",
  "payment.failed",
  "agent.created",
  "agent.updated",
  "merchant.created",
  "pool.created",
  "key.created",
  "key.revoked",
  "webhook.created",
  "checkout.created",
];

export default function TransactionsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20", offset: String(page * 20) });
      if (actionFilter !== "All") params.set("action", actionFilter);
      const data = await api.get<AuditLog[]>(`/api/audit?${params}`);
      setLogs(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Activity size={24} className="text-teal-400" />
        <h1 className="text-2xl font-bold text-slate-100">Activity Log</h1>
      </div>

      <AnimatedSection>
        <div className="flex items-center gap-3 rounded-lg bg-[#212121] p-3">
          <div className="relative">
            <button type="button" onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500">
              <Filter size={14} />
              {actionFilter === "All" ? "All Actions" : actionFilter}
              <ChevronDown size={14} />
            </button>
            {showFilterMenu && (
              <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-lg border border-slate-700 bg-[#1d1f22] py-1 shadow-xl">
                {ACTION_FILTER_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => { setActionFilter(opt); setShowFilterMenu(false); setPage(0); }}
                    className={`block w-full px-3 py-1.5 text-left text-sm transition ${opt === actionFilter ? "bg-teal-500/20 text-teal-300" : "text-slate-300 hover:bg-slate-800"}`}>
                    {opt === "All" ? "All Actions" : opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-slate-400">
            {loading ? "Loading..." : `${logs.length} entries`}
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="overflow-hidden rounded-lg bg-[#212121]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-btn-gradient uppercase text-slate-900">
                <tr>
                  <th className="px-3 py-3">Action</th>
                  <th className="px-3 py-3">Details</th>
                  <th className="px-3 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-24 animate-pulse rounded bg-slate-800" /></td>
                    ))}
                  </tr>
                )) : logs.length === 0 ? (
                  <tr><td colSpan={3} className="px-3 py-10 text-center text-slate-400">No activity recorded yet.</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-800 text-slate-200 hover:bg-slate-800/40">
                    <td className="px-3 py-3">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="max-w-md truncate px-3 py-3 text-xs text-slate-400">
                      {formatMetadata(log.metadata)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-400">
                      {formatTimestamp(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-3 py-3 text-sm text-slate-400">
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:border-slate-500 hover:text-slate-200">Previous</button>
            <span>Page {page + 1}</span>
            <button type="button" disabled={logs.length < 20} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:border-slate-500 hover:text-slate-200">Next</button>
          </div>
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
