"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Copy, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api-client";
import type { CheckoutSession, Merchant } from "@/lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const statusClasses: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  paid: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  expired: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  cancelled: "bg-rose-500/20 text-rose-300 border-rose-400/30",
};

export default function CheckoutPage() {
  const [sessions, setSessions] = useState<CheckoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
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

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

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
      setForm({ amount: "", description: "", merchantId: "", webhookUrl: "", expiryMinutes: "30" });
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

  const pendingCount = sessions.filter((s) => s.status === "pending").length;
  const paidCount = sessions.filter((s) => s.status === "paid").length;
  const totalRevenue = sessions
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + parseFloat(s.amount), 0);

  return (
    <>
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-md border border-slate-700 bg-[#1d1f22] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <h2 className="text-lg text-slate-100">New Checkout Session</h2>
                <button type="button" onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4 p-5">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Amount (USDC)</label>
                  <input
                    required type="number" min="0.01" step="0.01" value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="25.00"
                    className="h-10 w-full rounded-md border border-slate-700 bg-[#242629] px-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Payment for..."
                    className="h-10 w-full rounded-md border border-slate-700 bg-[#242629] px-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Merchant</label>
                    <select
                      value={form.merchantId}
                      onChange={(e) => setForm((f) => ({ ...f, merchantId: e.target.value }))}
                      className="h-10 w-full rounded-md border border-slate-700 bg-[#242629] px-3 text-sm text-slate-100"
                    >
                      <option value="">None</option>
                      {merchants.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Expiry (minutes)</label>
                    <input
                      type="number" min="5" value={form.expiryMinutes}
                      onChange={(e) => setForm((f) => ({ ...f, expiryMinutes: e.target.value }))}
                      className="h-10 w-full rounded-md border border-slate-700 bg-[#242629] px-3 text-sm text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Webhook URL (optional)</label>
                  <input
                    value={form.webhookUrl}
                    onChange={(e) => setForm((f) => ({ ...f, webhookUrl: e.target.value }))}
                    placeholder="https://..."
                    className="h-10 w-full rounded-md border border-slate-700 bg-[#242629] px-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <button type="submit" disabled={creating}
                  className="h-11 w-full rounded-md bg-btn-gradient text-sm uppercase tracking-wide text-slate-900 disabled:opacity-50">
                  {creating ? "Creating..." : "Create Session"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl text-slate-100">Checkout</h1>
            <p className="mt-1 text-lg text-slate-400">Accept USDC Payments Via Checkout Sessions</p>
          </div>
          <button type="button" onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-md border border-amber-100/20 bg-btn-gradient px-4 py-2.5 text-sm uppercase tracking-wide text-slate-900">
            <Plus className="h-4 w-4" /> New Session
          </button>
        </div>

        <div className="grid gap-2 lg:grid-cols-3">
          {[
            { label: "PENDING SESSIONS", value: loading ? "..." : String(pendingCount) },
            { label: "PAID SESSIONS", value: loading ? "..." : String(paidCount) },
            { label: "TOTAL REVENUE", value: loading ? "..." : `${totalRevenue.toFixed(2)} USDC` },
          ].map((card) => (
            <div key={card.label} className="bg-[#212121] rounded-lg p-4">
              <p className="text-sm uppercase text-slate-400">{card.label}</p>
              <p className="mt-1 font-impact text-4xl tracking-tight text-slate-100">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-md border border-slate-800 bg-[#1f1f1f]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-btn-gradient text-sm uppercase tracking-wide text-[#111111]">
                <tr>
                  <th className="px-4 py-3">Session ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-t border-slate-800">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-slate-800" /></td>
                      ))}
                    </tr>
                  ))
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16">
                      <div className="mx-auto max-w-md text-center">
                        <ShoppingCart className="mx-auto h-10 w-10 text-slate-500" />
                        <h2 className="mt-4 text-2xl text-slate-100">No checkout sessions</h2>
                        <p className="mt-2 text-slate-400">Create your first checkout session to accept payments.</p>
                        <button type="button" onClick={() => setShowCreate(true)}
                          className="mt-5 inline-block rounded-md bg-btn-gradient px-4 py-2 text-xs uppercase text-slate-900">
                          + Create Session
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="border-t border-slate-800 text-slate-200 hover:bg-white/5">
                      <td className="px-4 py-3 font-mono text-xs">{s.id.slice(0, 12)}...</td>
                      <td className="px-4 py-3 font-medium">{s.amount} {s.currency}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs ${statusClasses[s.status]}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{s.description || "—"}</td>
                      <td className="px-4 py-3 text-slate-400">{timeAgo(s.expiresAt)}</td>
                      <td className="px-4 py-3 text-slate-400">{timeAgo(s.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => copyLink(s.id)}
                          className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">
                          <Copy className="h-3 w-3" />
                          {copied === s.id ? "Copied!" : "Link"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>
    </>
  );
}
