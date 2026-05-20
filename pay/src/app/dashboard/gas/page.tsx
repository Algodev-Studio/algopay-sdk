"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Fuel, AlertTriangle, Zap, Ban } from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api } from "@/lib/api-client";
import type { GasPool } from "@/lib/types";

const poolStatusConfig: Record<string, { color: string; border: string; bg: string; icon: React.ReactNode }> = {
  healthy: { color: "text-neopop-green", border: "border-neopop-green/30", bg: "bg-neopop-green/20", icon: <Zap size={16} className="text-neopop-green" /> },
  low: { color: "text-neopop-yellow", border: "border-neopop-yellow/30", bg: "bg-neopop-yellow/20", icon: <AlertTriangle size={16} className="text-neopop-yellow" /> },
  critical: { color: "text-neopop-red", border: "border-neopop-red/30", bg: "bg-neopop-red/20", icon: <AlertTriangle size={16} className="text-neopop-red" /> },
  empty: { color: "text-text-muted", border: "border-border/30", bg: "bg-surface-raised/20", icon: <Ban size={16} className="text-text-muted" /> },
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
        <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">Gas Pools</h1>
        <Link href="/dashboard/gas/create" className="neopop-btn neopop-btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus size={16} /> Create Pool
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AnimatedSection>
          <div className="neopop-card flex items-center gap-3 p-4">
            <Fuel size={20} className="text-neopop-yellow" />
            <div>
              <p className="text-2xl font-bold text-text-primary">{loading ? "..." : formatUsdc(String(totalBalance))}</p>
              <p className="neopop-section-title">Total Balance</p>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection>
          <div className="neopop-card flex items-center gap-3 p-4">
            <Zap size={20} className="text-neopop-green" />
            <div>
              <p className="text-2xl font-bold text-text-primary">{loading ? "..." : healthyCount}</p>
              <p className="neopop-section-title">Healthy Pools</p>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection>
          <div className="neopop-card flex items-center gap-3 p-4">
            <AlertTriangle size={20} className="text-neopop-yellow" />
            <div>
              <p className="text-2xl font-bold text-text-primary">{loading ? "..." : lowCount}</p>
              <p className="neopop-section-title">Low / Critical</p>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="neopop-card-flat h-48 animate-pulse" />
          ))}
        </div>
      ) : pools.length === 0 ? (
        <AnimatedSection>
          <div className="neopop-card p-10 text-center">
            <Fuel size={32} className="mx-auto mb-3 text-text-muted" />
            <p className="text-text-secondary">No gas pools configured yet.</p>
            <Link href="/dashboard/gas/create" className="mt-3 inline-block text-sm text-neopop-yellow underline">Create your first pool</Link>
          </div>
        </AnimatedSection>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => {
            const cfg = poolStatusConfig[pool.status] ?? poolStatusConfig.empty;
            const pct = balancePercent(pool);
            return (
              <AnimatedSection key={pool.id}>
                <div className="neopop-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cfg.icon}
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {pool.status}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-text-muted">{pool.id.slice(0, 8)}</span>
                  </div>
                  <p className="text-3xl font-bold text-text-primary">{formatUsdc(pool.balanceUsdc)}</p>
                  <div className="mt-3 h-2 rounded-full bg-surface-raised">
                    <div
                      className={`h-2 rounded-full transition-all ${pool.status === "healthy" ? "bg-neopop-green" : pool.status === "low" ? "bg-neopop-yellow" : pool.status === "critical" ? "bg-neopop-red" : "bg-surface-overlay"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-text-muted">Daily Cap</p>
                      <p className="font-medium text-text-secondary">{formatUsd(pool.dailyCapCents)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Alert Threshold</p>
                      <p className="font-medium text-text-secondary">{formatUsdc(pool.alertThresholdUsdc)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Agents</p>
                      <p className="font-medium text-text-secondary">{pool.agents?.length ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Network</p>
                      <p className="font-medium text-text-secondary uppercase">{pool.apiKey?.network ?? "—"}</p>
                    </div>
                  </div>
                  <button type="button" className="neopop-btn neopop-btn-secondary mt-3 w-full py-1.5 text-xs">
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
