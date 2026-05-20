"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api } from "@/lib/api-client";
import type { Payment, GasPool } from "@/lib/types";

const statusClasses: Record<string, string> = {
  settled: "bg-neopop-green/15 text-neopop-green border-neopop-green/30",
  pending: "bg-neopop-yellow/15 text-neopop-yellow border-neopop-yellow/30",
  failed: "bg-neopop-red/15 text-neopop-red border-neopop-red/30",
  processing: "bg-neopop-blue/15 text-neopop-blue border-neopop-blue/30",
};

const STATUS_FILTERS = ["All", "settled", "pending", "processing", "failed"];

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatUsdc(micro: string): string {
  return `${(Number(micro) / 1_000_000).toFixed(2)} USDC`;
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

export default function DashboardPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pools, setPools] = useState<GasPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "9", offset: String(page * 9) });
      if (statusFilter !== "All") params.set("status", statusFilter);
      const [p, g] = await Promise.allSettled([
        api.get<Payment[]>(`/api/payments?${params}`),
        api.get<GasPool[]>("/api/gas-pools"),
      ]);
      if (p.status === "fulfilled") setPayments(p.value);
      if (g.status === "fulfilled") setPools(g.value);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = search.trim()
    ? payments.filter((p) => p.invoiceId.toLowerCase().includes(search.toLowerCase()))
    : payments;

  const settled = payments.filter((p) => p.status === "settled").length;
  const failed = payments.filter((p) => p.status === "failed").length;
  const pending = payments.filter((p) => p.status === "pending" || p.status === "processing").length;
  const totalVolumeCents = payments.reduce((s, p) => s + p.amountUsdCents, 0);
  const totalPoolBalance = pools.reduce((s, p) => s + Number(p.balanceUsdc), 0);

  const kpiCards = [
    { title: "Total Volume", value: formatUsd(totalVolumeCents), meta: `${payments.length} PAYMENTS`, accent: "border-l-neopop-yellow" },
    { title: "Settled", value: String(settled), meta: `${payments.length ? Math.round((settled / payments.length) * 100) : 0}% SUCCESS`, accent: "border-l-neopop-green" },
    { title: "Failed", value: String(failed), meta: `${payments.length ? Math.round((failed / payments.length) * 100) : 0}% FAILURE`, accent: "border-l-neopop-red" },
    { title: "Pending", value: String(pending), meta: "AWAITING", accent: "border-l-neopop-blue" },
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="space-y-4">
      <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">Overview</h1>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <AnimatedSection key={card.title}>
            <div className={`neopop-card-flat border-l-4 ${card.accent} p-4`}>
              <p className="neopop-section-title">{card.title}</p>
              <p className="mt-2 font-impact text-4xl uppercase leading-none text-text-primary">{loading ? "..." : card.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-neopop-yellow">{card.meta}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection>
        <div className="neopop-card-flat p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button key={filter} type="button" onClick={() => { setStatusFilter(filter); setPage(0); }}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    filter === statusFilter
                      ? "bg-neopop-yellow text-neopop-black"
                      : "text-text-muted hover:bg-surface-raised hover:text-text-primary"
                  }`}>
                  {filter}
                </button>
              ))}
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="neopop-input w-full sm:w-64" placeholder="Search Invoice ID" />
          </div>
        </div>
      </AnimatedSection>

      <div className="grid gap-4 xl:grid-cols-[1fr_325px]">
        <AnimatedSection>
          <div className="neopop-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="neopop-table">
                <thead>
                  <tr className="bg-neopop-yellow text-neopop-black">
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Invoice ID</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Network</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Agent</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">TxID</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-3 py-3"><div className="h-3 w-16 animate-pulse rounded bg-surface-raised" /></td>
                      ))}
                    </tr>
                  )) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-3 py-10 text-center text-text-muted">No payments found.</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id} onClick={() => router.push(`/dashboard/payments`)}
                      className="cursor-pointer border-t border-border text-text-primary transition hover:bg-surface-raised">
                      <td className="px-3 py-3 font-mono text-xs">{p.invoiceId}</td>
                      <td className="px-3 py-3 font-semibold">{formatUsd(p.amountUsdCents)}</td>
                      <td className="px-3 py-3"><span className={`border px-2 py-0.5 text-xs font-bold uppercase ${statusClasses[p.status]}`}>{p.status}</span></td>
                      <td className="px-3 py-3 text-xs uppercase text-text-muted">{p.network}</td>
                      <td className="px-3 py-3">{p.agent?.name ?? p.agentId.slice(0, 8)}</td>
                      <td className="px-3 py-3 font-mono text-xs text-text-muted">{p.algoTxnId ? `${p.algoTxnId.slice(0, 6)}...` : "—"}</td>
                      <td className="px-3 py-3 text-text-muted">{timeAgo(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-3 py-3 text-sm text-text-muted">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                className="neopop-btn neopop-btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Previous</button>
              <span className="text-xs uppercase tracking-wider">Page {page + 1}</span>
              <button type="button" disabled={payments.length < 9} onClick={() => setPage((p) => p + 1)}
                className="neopop-btn neopop-btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="neopop-card-raised p-4">
            <p className="neopop-section-title">Gas Pool Balance</p>
            <p className="mt-2 font-impact text-4xl tracking-tight text-neopop-yellow">{loading ? "..." : formatUsdc(String(totalPoolBalance))}</p>
            <p className="mt-1 text-xs text-text-muted">{pools.length} pool{pools.length !== 1 ? "s" : ""}</p>
            <div className="mt-4 rounded bg-background p-4">
              <div className="h-2 rounded-full bg-border">
                <div className="h-2 rounded-full bg-neopop-yellow transition-all" style={{ width: `${Math.min(pools.length > 0 ? 60 : 0, 100)}%` }} />
              </div>
              <p className="mt-3 text-sm text-text-secondary">{pools.length > 0 ? `${pools.filter(p => p.status !== "empty").length} active` : "No pools configured"}</p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-text-muted">Active</p><p className="font-bold text-neopop-green">{pools.filter(p => p.status !== "empty").length}</p></div>
                <div><p className="text-xs text-text-muted">Low</p><p className="font-bold text-neopop-yellow">{pools.filter(p => p.status === "low" || p.status === "critical").length}</p></div>
                <div><p className="text-xs text-text-muted">Empty</p><p className="font-bold text-neopop-red">{pools.filter(p => p.status === "empty").length}</p></div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </motion.section>
  );
}
