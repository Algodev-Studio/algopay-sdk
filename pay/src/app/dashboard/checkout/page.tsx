"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Copy,
  ShoppingCart,
  DollarSign,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api-client";
import AnimatedSection from "@/components/animations/AnimatedSection";
import type { CheckoutSession, Merchant } from "@/lib/types";

type StatusFilter = "ALL" | "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";

const STATUS_FILTERS: StatusFilter[] = [
  "ALL",
  "PENDING",
  "PAID",
  "EXPIRED",
  "CANCELLED",
];

const statusClasses: Record<string, string> = {
  paid: "bg-neopop-green/15 text-neopop-green border-neopop-green/30",
  pending: "bg-neopop-yellow/15 text-neopop-yellow border-neopop-yellow/30",
  expired: "bg-neopop-red/15 text-neopop-red border-neopop-red/30",
  cancelled: "bg-surface-raised text-text-muted border-border",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CheckoutPage() {
  const [sessions, setSessions] = useState<CheckoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");
  const [form, setForm] = useState({
    amount: "",
    description: "",
    merchantId: "",
    webhookUrl: "",
    expiryMinutes: "30",
  });

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.allSettled([
        api.get<CheckoutSession[]>("/api/checkout"),
        api.get<Merchant[]>("/api/merchants"),
      ]);
      if (s.status === "fulfilled") setSessions(s.value);
      if (m.status === "fulfilled") setMerchants(m.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const paidCount = useMemo(
    () => sessions.filter((s) => s.status === "paid").length,
    [sessions]
  );
  const pendingCount = useMemo(
    () => sessions.filter((s) => s.status === "pending").length,
    [sessions]
  );
  const expiredCount = useMemo(
    () => sessions.filter((s) => s.status === "expired").length,
    [sessions]
  );
  const totalRevenue = useMemo(
    () =>
      sessions
        .filter((s) => s.status === "paid")
        .reduce((sum, s) => sum + parseFloat(s.amount), 0),
    [sessions]
  );
  const conversionRate = useMemo(
    () => (sessions.length > 0 ? (paidCount / sessions.length) * 100 : 0),
    [sessions, paidCount]
  );

  const filteredSessions = useMemo(() => {
    if (activeFilter === "ALL") return sessions;
    return sessions.filter(
      (s) => s.status === activeFilter.toLowerCase()
    );
  }, [sessions, activeFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/api/checkout", {
        amount: form.amount,
        description: form.description || null,
        merchantId: form.merchantId || null,
        webhookUrl: form.webhookUrl || null,
        expiryMinutes: parseInt(form.expiryMinutes) || 30,
      });
      setShowCreate(false);
      setForm({
        amount: "",
        description: "",
        merchantId: "",
        webhookUrl: "",
        expiryMinutes: "30",
      });
      fetchSessions();
    } finally {
      setCreating(false);
    }
  }

  function copyLink(id: string) {
    const link = `${window.location.origin}/checkout/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="neopop-card w-full max-w-lg"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="neopop-section-title text-lg">
                  New Checkout Session
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4 p-5">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-text-secondary">
                    Amount (USDC) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="25.00"
                    className="neopop-input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-text-secondary">
                    Description
                  </label>
                  <input
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Payment for..."
                    className="neopop-input w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-text-secondary">
                      Merchant
                    </label>
                    <select
                      value={form.merchantId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, merchantId: e.target.value }))
                      }
                      className="neopop-input w-full"
                    >
                      <option value="">None</option>
                      {merchants.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-text-secondary">
                      Expiry (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={form.expiryMinutes}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          expiryMinutes: e.target.value,
                        }))
                      }
                      className="neopop-input w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-text-secondary">
                    Webhook URL
                  </label>
                  <input
                    value={form.webhookUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, webhookUrl: e.target.value }))
                    }
                    placeholder="https://..."
                    className="neopop-input w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="neopop-btn neopop-btn-primary w-full"
                >
                  {creating ? "Creating..." : "Create Session"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatedSection className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">
            Checkout
          </h1>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="neopop-btn neopop-btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Session
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neopop-card-raised p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neopop-green/15">
                <DollarSign className="h-5 w-5 text-neopop-green" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Total Revenue
                </p>
                <p className="font-impact text-2xl tracking-tight text-text-primary">
                  {loading ? "..." : `${totalRevenue.toFixed(2)} USDC`}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neopop-card-raised p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neopop-blue/15">
                <BarChart3 className="h-5 w-5 text-neopop-blue" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Total Sessions
                </p>
                <p className="font-impact text-2xl tracking-tight text-text-primary">
                  {loading ? "..." : sessions.length}
                </p>
                {!loading && sessions.length > 0 && (
                  <p className="mt-0.5 text-xs text-text-muted">
                    <span className="text-neopop-green">{paidCount} paid</span>
                    {" / "}
                    <span className="text-neopop-yellow">
                      {pendingCount} pending
                    </span>
                    {" / "}
                    <span className="text-neopop-red">
                      {expiredCount} expired
                    </span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="neopop-card-raised p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neopop-yellow/15">
                <TrendingUp className="h-5 w-5 text-neopop-yellow" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Conversion Rate
                </p>
                <p className="font-impact text-2xl tracking-tight text-text-primary">
                  {loading ? "..." : `${conversionRate.toFixed(1)}%`}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeFilter === filter
                  ? "border-neopop-yellow/50 bg-neopop-yellow/10 text-neopop-yellow"
                  : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text-secondary"
              }`}
            >
              {filter}
              {filter !== "ALL" && !loading && (
                <span className="ml-1.5 opacity-70">
                  {
                    sessions.filter(
                      (s) => s.status === filter.toLowerCase()
                    ).length
                  }
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="neopop-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="neopop-table min-w-full text-left text-sm">
              <thead>
                <tr className="bg-neopop-yellow text-neopop-black text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Session ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-t border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 w-20 animate-pulse rounded bg-surface-raised" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16">
                      <div className="mx-auto max-w-md text-center">
                        <ShoppingCart className="mx-auto h-10 w-10 text-text-muted" />
                        <h2 className="mt-4 text-xl text-text-primary">
                          {activeFilter === "ALL"
                            ? "No checkout sessions"
                            : `No ${activeFilter.toLowerCase()} sessions`}
                        </h2>
                        <p className="mt-2 text-text-secondary">
                          {activeFilter === "ALL"
                            ? "Create your first checkout session to accept payments."
                            : "Try a different filter to see sessions."}
                        </p>
                        {activeFilter === "ALL" && (
                          <button
                            type="button"
                            onClick={() => setShowCreate(true)}
                            className="neopop-btn neopop-btn-secondary mt-5"
                          >
                            + Create Session
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((s) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-border text-text-primary hover:bg-surface-raised/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                        {s.id.slice(0, 12)}...
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {s.amount} {s.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${statusClasses[s.status]}`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {s.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">
                        {formatDate(s.expiresAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => copyLink(s.id)}
                          className="neopop-btn neopop-btn-secondary flex items-center gap-1 !px-2 !py-1 !text-xs"
                        >
                          <Copy className="h-3 w-3" />
                          {copied === s.id ? "Copied!" : "Link"}
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
