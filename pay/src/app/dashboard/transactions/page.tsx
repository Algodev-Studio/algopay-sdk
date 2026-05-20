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
  "payment.created": "bg-neopop-blue/20 text-neopop-blue",
  "payment.settled": "bg-neopop-green/20 text-neopop-green",
  "payment.failed": "bg-neopop-red/20 text-neopop-red",
  "agent.created": "bg-neopop-green/20 text-neopop-green",
  "agent.updated": "bg-neopop-yellow/20 text-neopop-yellow",
  "agent.suspended": "bg-neopop-red/20 text-neopop-red",
  "merchant.created": "bg-neopop-green/20 text-neopop-green",
  "merchant.deleted": "bg-neopop-red/20 text-neopop-red",
  "pool.created": "bg-neopop-green/20 text-neopop-green",
  "pool.topped_up": "bg-neopop-green/20 text-neopop-green",
  "key.created": "bg-neopop-blue/20 text-neopop-blue",
  "key.revoked": "bg-neopop-red/20 text-neopop-red",
  "webhook.created": "bg-neopop-green/20 text-neopop-green",
  "checkout.created": "bg-neopop-blue/20 text-neopop-blue",
  "checkout.paid": "bg-neopop-green/20 text-neopop-green",
};

function getActionColor(action: string): string {
  return ACTION_COLORS[action] ?? "bg-surface-raised text-text-secondary";
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
        <Activity size={24} className="text-neopop-yellow" />
        <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">Activity Log</h1>
      </div>

      <AnimatedSection>
        <div className="neopop-card-flat flex items-center gap-3 p-3">
          <div className="relative">
            <button type="button" onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="neopop-btn neopop-btn-secondary flex items-center gap-2 px-3 py-2 text-sm">
              <Filter size={14} />
              {actionFilter === "All" ? "All Actions" : actionFilter}
              <ChevronDown size={14} />
            </button>
            {showFilterMenu && (
              <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-xl">
                {ACTION_FILTER_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => { setActionFilter(opt); setShowFilterMenu(false); setPage(0); }}
                    className={`block w-full px-3 py-1.5 text-left text-sm transition ${opt === actionFilter ? "bg-neopop-yellow/20 text-neopop-yellow" : "text-text-secondary hover:bg-surface-raised"}`}>
                    {opt === "All" ? "All Actions" : opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            {loading ? "Loading..." : `${logs.length} entries`}
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="neopop-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="neopop-table text-left text-sm">
              <thead className="bg-neopop-yellow text-neopop-black">
                <tr>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Action</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Details</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-24 animate-pulse rounded bg-surface-raised" /></td>
                    ))}
                  </tr>
                )) : logs.length === 0 ? (
                  <tr><td colSpan={3} className="px-3 py-10 text-center text-text-muted">No activity recorded yet.</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="border-t border-border text-text-primary hover:bg-surface-raised">
                    <td className="px-3 py-3">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="max-w-md truncate px-3 py-3 text-xs text-text-secondary">
                      {formatMetadata(log.metadata)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-text-secondary">
                      {formatTimestamp(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-3 py-3 text-sm text-text-secondary">
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="neopop-btn neopop-btn-secondary px-3 py-1.5 disabled:opacity-40">Previous</button>
            <span>Page {page + 1}</span>
            <button type="button" disabled={logs.length < 20} onClick={() => setPage((p) => p + 1)} className="neopop-btn neopop-btn-secondary px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
