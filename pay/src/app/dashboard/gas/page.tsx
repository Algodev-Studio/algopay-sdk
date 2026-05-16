"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Fuel, AlertTriangle, Zap, Ban } from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api } from "@/lib/api-client";
import type { GasPool } from "@/lib/types";

const poolStatusConfig: Record<string, { color: string; border: string; bg: string; icon: React.ReactNode }> = {
  healthy: { color: "text-emerald-300", border: "border-emerald-400/30", bg: "bg-emerald-500/20", icon: <Zap size={16} className="text-emerald-400" /> },
  low: { color: "text-amber-300", border: "border-amber-400/30", bg: "bg-amber-500/20", icon: <AlertTriangle size={16} className="text-amber-400" /> },
  critical: { color: "text-rose-300", border: "border-rose-400/30", bg: "bg-rose-500/20", icon: <AlertTriangle size={16} className="text-rose-400" /> },
  empty: { color: "text-slate-400", border: "border-slate-600/30", bg: "bg-slate-700/20", icon: <Ban size={16} className="text-slate-500" /> },
};

function formatUsdc(micro: string): string {
  return `${(Number(micro) / 1_000_000).toFixed(2)} USDC`;
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function balancePercent(pool: GasPool): number {
  const balance = Number(pool.balanceUsdc);
  const cap = pool.dailyCapCents * 10_000;
  if (cap <= 0) return 0;
  return Math.min(Math.round((balance / cap) * 100), 100);
}

export default function GasPoolsPage() {
  const [pools, setPools] = useState<GasPool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPools = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<GasPool[]>("/api/gas-pools");
      setPools(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPools(); }, [fetchPools]);

  const totalBalance = pools.reduce((s, p) => s + Number(p.balanceUsdc), 0);
  const healthyCount = pools.filter((p) => p.status === "healthy").length;
  const lowCount = pools.filter((p) => p.status === "low" || p.status === "critical").length;

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Gas Pools</h1>
        <Link href="/dashboard/gas/create" className="flex items-center gap-2 rounded-lg bg-btn-gradient px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90">
          <Plus size={16} /> Create Pool
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AnimatedSection>
          <div className="flex items-center gap-3 rounded-lg bg-[#212121] p-4">
            <Fuel size={20} className="text-teal-400" />
            <div>
              <p className="text-2xl font-bold text-slate-100">{loading ? "..." : formatUsdc(String(totalBalance))}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">Total Balance</p>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection>
          <div className="flex items-center gap-3 rounded-lg bg-[#212121] p-4">
            <Zap size={20} className="text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-slate-100">{loading ? "..." : healthyCount}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">Healthy Pools</p>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection>
          <div className="flex items-center gap-3 rounded-lg bg-[#212121] p-4">
            <AlertTriangle size={20} className="text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-slate-100">{loading ? "..." : lowCount}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">Low / Critical</p>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-[#212121]" />
          ))}
        </div>
      ) : pools.length === 0 ? (
        <AnimatedSection>
          <div className="rounded-lg bg-[#212121] p-10 text-center">
            <Fuel size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No gas pools configured yet.</p>
            <Link href="/dashboard/gas/create" className="mt-3 inline-block text-sm text-teal-400 underline">Create your first pool</Link>
          </div>
        </AnimatedSection>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => {
            const cfg = poolStatusConfig[pool.status] ?? poolStatusConfig.empty;
            const pct = balancePercent(pool);
            return (
              <AnimatedSection key={pool.id}>
                <div className="rounded-lg bg-[#212121] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cfg.icon}
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {pool.status}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500">{pool.id.slice(0, 8)}</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-100">{formatUsdc(pool.balanceUsdc)}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div
                      className={`h-2 rounded-full transition-all ${pool.status === "healthy" ? "bg-emerald-400" : pool.status === "low" ? "bg-amber-400" : pool.status === "critical" ? "bg-rose-400" : "bg-slate-600"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Daily Cap</p>
                      <p className="font-medium text-slate-200">{formatUsd(pool.dailyCapCents)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Alert Threshold</p>
                      <p className="font-medium text-slate-200">{formatUsdc(pool.alertThresholdUsdc)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Agents</p>
                      <p className="font-medium text-slate-200">{pool.agents?.length ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Network</p>
                      <p className="font-medium text-slate-200 uppercase">{pool.apiKey?.network ?? "—"}</p>
                    </div>
                  </div>
                  <button type="button" className="mt-3 w-full rounded-md border border-slate-700 py-1.5 text-xs text-slate-400 transition hover:border-slate-500 hover:text-slate-200">
                    Top Up (coming soon)
                  </button>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
