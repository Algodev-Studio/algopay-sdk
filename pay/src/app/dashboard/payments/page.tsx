"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  XCircle,
  Plus,
  X,
  Search,
  Loader2,
} from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";
import type { Payment, Agent, GasPool, Merchant, Network } from "@/lib/types";

const statusClasses: Record<string, string> = {
  settled: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  pending: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  failed: "bg-rose-500/20 text-rose-300 border-rose-400/30",
  processing: "bg-blue-500/20 text-blue-300 border-blue-400/30",
};

const STATUS_FILTERS = ["All", "settled", "pending", "processing", "failed"];

const PIPELINE_STEPS = ["INITIATE", "VALIDATE", "PROCESS", "SETTLE", "WEBHOOK"];

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

function PipelineStep({ step, index, total }: { step: string; index: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300">
          {index + 1}
        </div>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{step}</span>
      </div>
      {index < total - 1 && <ArrowRight size={14} className="mt-[-16px] text-slate-600" />}
    </div>
  );
}

function generateInvoiceId(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `INV-${hex}`;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [pools, setPools] = useState<GasPool[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    invoiceId: generateInvoiceId(),
    agentId: "",
    poolId: "",
    merchantId: "",
    amountUsdCents: "",
    network: "testnet" as Network,
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "12", offset: String(page * 12) });
      if (statusFilter !== "All") params.set("status", statusFilter);
      const data = await api.get<Payment[]>(`/api/payments?${params}`);
      setPayments(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  const fetchDeps = useCallback(async () => {
    const [a, g, m] = await Promise.allSettled([
      api.get<Agent[]>("/api/agents"),
      api.get<GasPool[]>("/api/gas-pools"),
      api.get<Merchant[]>("/api/merchants"),
    ]);
    if (a.status === "fulfilled") setAgents(a.value);
    if (g.status === "fulfilled") setPools(g.value);
    if (m.status === "fulfilled") setMerchants(m.value);
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { fetchDeps(); }, [fetchDeps]);

  const filtered = search.trim()
    ? payments.filter((p) => p.invoiceId.toLowerCase().includes(search.toLowerCase()))
    : payments;

  const settled = payments.filter((p) => p.status === "settled").length;
  const failed = payments.filter((p) => p.status === "failed").length;
  const pending = payments.filter((p) => p.status === "pending" || p.status === "processing").length;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/payments", {
        invoiceId: form.invoiceId,
        agentId: form.agentId,
        poolId: form.poolId,
        merchantId: form.merchantId || undefined,
        amountUsdCents: Number(form.amountUsdCents),
        network: form.network,
      });
      setShowModal(false);
      setForm({ ...form, invoiceId: generateInvoiceId(), amountUsdCents: "", agentId: "", poolId: "", merchantId: "" });
      fetchPayments();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create payment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Payments</h1>
        <button type="button" onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-btn-gradient px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90">
          <Plus size={16} /> New Payment
        </button>
      </div>

      <AnimatedSection>
        <div className="rounded-lg bg-[#212121] p-4">
          <p className="mb-3 text-xs uppercase tracking-widest text-slate-400">Process Pipeline</p>
          <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
            {PIPELINE_STEPS.map((step, i) => (
              <PipelineStep key={step} step={step} index={i} total={PIPELINE_STEPS.length} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Settled", count: settled, icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
          { label: "Pending / Processing", count: pending, icon: <Circle size={18} className="text-amber-400" /> },
          { label: "Failed", count: failed, icon: <XCircle size={18} className="text-rose-400" /> },
        ].map((c) => (
          <AnimatedSection key={c.label}>
            <div className="flex items-center gap-3 rounded-lg bg-[#212121] p-4">
              {c.icon}
              <div>
                <p className="text-2xl font-bold text-slate-100">{loading ? "..." : c.count}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{c.label}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection>
        <div className="rounded-lg bg-[#212121] p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((f) => (
                <button key={f} type="button" onClick={() => { setStatusFilter(f); setPage(0); }}
                  className={`rounded-md px-3 py-2 text-sm uppercase tracking-wide transition ${f === statusFilter ? "bg-teal-500/20 text-teal-300" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-slate-700 bg-white py-2 pl-9 pr-4 text-sm text-black placeholder:text-slate-500 sm:w-64" placeholder="Search Invoice ID" />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="overflow-hidden rounded-lg bg-[#212121]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-btn-gradient uppercase text-slate-900">
                <tr>
                  <th className="px-3 py-3">Invoice ID</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Network</th>
                  <th className="px-3 py-3">Agent</th>
                  <th className="px-3 py-3">TxID</th>
                  <th className="px-3 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-16 animate-pulse rounded bg-slate-800" /></td>
                    ))}
                  </tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-10 text-center text-slate-400">No payments found.</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="border-t border-slate-800 text-slate-200 hover:bg-slate-800/40">
                    <td className="px-3 py-3 font-mono text-xs">{p.invoiceId}</td>
                    <td className="px-3 py-3 font-semibold">{formatUsd(p.amountUsdCents)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-1 text-xs ${statusClasses[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-3 py-3 text-xs uppercase text-slate-400">{p.network}</td>
                    <td className="px-3 py-3">{p.agent?.name ?? p.agentId.slice(0, 8)}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-400">{p.algoTxnId ? `${p.algoTxnId.slice(0, 6)}...` : "—"}</td>
                    <td className="px-3 py-3 text-slate-400">{timeAgo(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-3 py-3 text-sm text-slate-400">
            <button type="button" disabled={page === 0} onClick={() => setPage((v) => v - 1)} className="rounded-md border border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:border-slate-500 hover:text-slate-200">Previous</button>
            <span>Page {page + 1}</span>
            <button type="button" disabled={payments.length < 12} onClick={() => setPage((v) => v + 1)} className="rounded-md border border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:border-slate-500 hover:text-slate-200">Next</button>
          </div>
        </div>
      </AnimatedSection>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-xl bg-[#1d1f22] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100">New Payment</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={20} /></button>
              </div>
              {error && <p className="mb-3 rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Invoice ID</label>
                  <input value={form.invoiceId} readOnly className="w-full rounded-md border border-slate-700 bg-[#212121] px-3 py-2 font-mono text-sm text-slate-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Agent</label>
                    <select value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })} required className="w-full rounded-md border border-slate-700 bg-[#212121] px-3 py-2 text-sm text-slate-200">
                      <option value="">Select agent</option>
                      {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Gas Pool</label>
                    <select value={form.poolId} onChange={(e) => setForm({ ...form, poolId: e.target.value })} required className="w-full rounded-md border border-slate-700 bg-[#212121] px-3 py-2 text-sm text-slate-200">
                      <option value="">Select pool</option>
                      {pools.map((p) => <option key={p.id} value={p.id}>Pool {p.id.slice(0, 8)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Merchant (optional)</label>
                    <select value={form.merchantId} onChange={(e) => setForm({ ...form, merchantId: e.target.value })} className="w-full rounded-md border border-slate-700 bg-[#212121] px-3 py-2 text-sm text-slate-200">
                      <option value="">None</option>
                      {merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Amount (USD cents)</label>
                    <input type="number" min="1" value={form.amountUsdCents} onChange={(e) => setForm({ ...form, amountUsdCents: e.target.value })} required placeholder="e.g. 1500" className="w-full rounded-md border border-slate-700 bg-[#212121] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Network</label>
                  <select value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value as Network })} className="w-full rounded-md border border-slate-700 bg-[#212121] px-3 py-2 text-sm text-slate-200">
                    <option value="testnet">Testnet</option>
                    <option value="mainnet">Mainnet</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-btn-gradient py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50">
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Payment"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
