"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Bot,
  ShieldCheck,
  ShieldOff,
  DollarSign,
  Pause,
  Play,
  Pencil,
} from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";
import type { Agent } from "@/lib/types";

const agentStatusClasses: Record<string, string> = {
  active: "bg-neopop-green/15 text-neopop-green border-neopop-green/30",
  limit_reached: "bg-neopop-yellow/15 text-neopop-yellow border-neopop-yellow/30",
  suspended: "bg-neopop-red/15 text-neopop-red border-neopop-red/30",
};

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

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmSuspend, setConfirmSuspend] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Agent[]>("/api/agents");
      setAgents(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const active = agents.filter((a) => a.status === "active").length;
  const suspended = agents.filter((a) => a.status === "suspended").length;
  const totalLimit = agents.reduce((s, a) => s + a.dailyLimitCents, 0);

  async function toggleSuspend(agent: Agent) {
    if (agent.status !== "suspended" && confirmSuspend !== agent.id) {
      setConfirmSuspend(agent.id);
      return;
    }
    setActionLoading(agent.id);
    setConfirmSuspend(null);
    try {
      const newStatus = agent.status === "suspended" ? "active" : "suspended";
      await api.patch(`/api/agents/${agent.id}`, { status: newStatus });
      fetchAgents();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">Agents</h1>
        <Link href="/dashboard/agents/create" className="neopop-btn neopop-btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus size={16} /> Create Agent
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total Agents", value: agents.length, icon: <Bot size={20} className="text-neopop-yellow" /> },
          { title: "Active", value: active, icon: <ShieldCheck size={20} className="text-neopop-green" /> },
          { title: "Suspended", value: suspended, icon: <ShieldOff size={20} className="text-neopop-red" /> },
          { title: "Daily Limit Total", value: formatUsd(totalLimit), icon: <DollarSign size={20} className="text-neopop-yellow" /> },
        ].map((card) => (
          <AnimatedSection key={card.title}>
            <div className="neopop-card-flat flex items-center gap-3 p-4">
              {card.icon}
              <div>
                <p className="text-2xl font-bold text-text-primary">{loading ? "..." : card.value}</p>
                <p className="neopop-section-title">{card.title}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection>
        <div className="neopop-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="neopop-table">
              <thead className="bg-neopop-yellow text-neopop-black">
                <tr>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Name</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Algo Address</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Daily Limit</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Daily Spent</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Created</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-16 animate-pulse rounded bg-surface-raised" /></td>
                    ))}
                  </tr>
                )) : agents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-text-muted">
                      No agents yet.{" "}
                      <Link href="/dashboard/agents/create" className="text-neopop-yellow underline">Create one</Link>
                    </td>
                  </tr>
                ) : agents.map((a) => (
                  <tr key={a.id} className="border-t border-border text-text-primary hover:bg-surface-raised">
                    <td className="px-3 py-3 font-medium">{a.name}</td>
                    <td className="px-3 py-3 font-mono text-xs text-text-muted">{a.algoAddress.slice(0, 8)}...{a.algoAddress.slice(-4)}</td>
                    <td className="px-3 py-3">{formatUsd(a.dailyLimitCents)}</td>
                    <td className="px-3 py-3">
                      <span className={a.dailySpentCents >= a.dailyLimitCents ? "text-neopop-red" : "text-text-primary"}>
                        {formatUsd(a.dailySpentCents)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-1 text-xs ${agentStatusClasses[a.status]}`}>{a.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-3 py-3 text-text-secondary">{timeAgo(a.createdAt)}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/agents/create?edit=${a.id}`} className="rounded-md p-1.5 text-text-muted transition hover:bg-surface-raised hover:text-text-primary" title="Edit">
                          <Pencil size={14} />
                        </Link>
                        {confirmSuspend === a.id ? (
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => toggleSuspend(a)} className="rounded-md bg-neopop-red/20 px-2 py-1 text-xs text-neopop-red hover:bg-neopop-red/30">Confirm</button>
                            <button type="button" onClick={() => setConfirmSuspend(null)} className="rounded-md px-2 py-1 text-xs text-text-muted hover:text-text-primary">Cancel</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => toggleSuspend(a)} disabled={actionLoading === a.id}
                            className="rounded-md p-1.5 text-text-muted transition hover:bg-surface-raised hover:text-text-primary disabled:opacity-40"
                            title={a.status === "suspended" ? "Reactivate" : "Suspend"}>
                            {a.status === "suspended" ? <Play size={14} /> : <Pause size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
