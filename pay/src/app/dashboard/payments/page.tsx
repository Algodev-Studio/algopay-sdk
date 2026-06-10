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
  ExternalLink,
} from "lucide-react";

function explorerUrl(txId: string, network: string): string {
  const base = network === "mainnet" ? "https://allo.info/tx" : "https://testnet.explorer.perawallet.app/tx";
  return `${base}/${txId}`;
}
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";
import type { Payment, Agent, GasPool, Merchant, Network } from "@/lib/types";

const statusClasses: Record<string, string> = {
  settled: "bg-neopop-green/15 text-neopop-green border-neopop-green/30",
  pending: "bg-neopop-yellow/15 text-neopop-yellow border-neopop-yellow/30",
  failed: "bg-neopop-red/15 text-neopop-red border-neopop-red/30",
  processing: "bg-neopop-blue/15 text-neopop-blue border-neopop-blue/30",
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
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neopop-yellow/20 text-xs font-bold text-neopop-yellow">
          {index + 1}
        </div>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-text-muted">{step}</span>
      </div>
      {index < total - 1 && <ArrowRight size={14} className="mt-[-16px] text-border-strong" />}
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
        <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">Payments</h1>
        <button type="button" onClick={() => setShowModal(true)} className="neopop-btn neopop-btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus size={16} /> New Payment
        </button>
      </div>

      <AnimatedSection>
        <div className="neopop-card p-4">
          <p className="neopop-section-title mb-3">Process Pipeline</p>
          <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
            {PIPELINE_STEPS.map((step, i) => (
              <PipelineStep key={step} step={step} index={i} total={PIPELINE_STEPS.length} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Settled", count: settled, icon: <CheckCircle2 size={18} className="text-neopop-green" /> },
          { label: "Pending / Processing", count: pending, icon: <Circle size={18} className="text-neopop-yellow" /> },
          { label: "Failed", count: failed, icon: <XCircle size={18} className="text-neopop-red" /> },
        ].map((c) => (
          <AnimatedSection key={c.label}>
            <div className="neopop-card-flat flex items-center gap-3 p-4">
              {c.icon}
              <div>
                <p className="text-2xl font-bold text-text-primary">{loading ? "..." : c.count}</p>
                <p className="neopop-section-title">{c.label}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection>
        <div className="neopop-card-flat p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((f) => (
                <button key={f} type="button" onClick={() => { setStatusFilter(f); setPage(0); }}
                  className={`rounded-md px-3 py-2 text-sm uppercase tracking-wide transition ${f === statusFilter ? "bg-neopop-yellow/20 text-neopop-yellow" : "text-text-muted hover:bg-surface-raised hover:text-text-primary"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="neopop-input w-full py-2 pl-9 pr-4 text-sm sm:w-64" placeholder="Search Invoice ID" />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="neopop-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="neopop-table">
              <thead className="bg-neopop-yellow text-neopop-black">
                <tr>
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
                {loading ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-16 animate-pulse rounded bg-surface-raised" /></td>
                    ))}
                  </tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-10 text-center text-text-muted">No payments found.</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="border-t border-border text-text-primary hover:bg-surface-raised">
                    <td className="px-3 py-3 font-mono text-xs">{p.invoiceId}</td>
                    <td className="px-3 py-3 font-semibold">{formatUsd(p.amountUsdCents)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-1 text-xs ${statusClasses[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-3 py-3 text-xs uppercase text-text-muted">{p.network}</td>
                    <td className="px-3 py-3">{p.agent?.name ?? p.agentId.slice(0, 8)}</td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {p.algoTxnId ? (
                        <a
                          href={explorerUrl(p.algoTxnId, p.network)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-neopop-blue hover:underline"
                          title={p.algoTxnId}
                        >
                          {p.algoTxnId.slice(0, 8)}… <ExternalLink size={10} />
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">{timeAgo(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-3 py-3 text-sm text-text-secondary">
            <button type="button" disabled={page === 0} onClick={() => setPage((v) => v - 1)} className="neopop-btn neopop-btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Previous</button>
            <span>Page {page + 1}</span>
            <button type="button" disabled={payments.length < 12} onClick={() => setPage((v) => v + 1)} className="neopop-btn neopop-btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </AnimatedSection>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="neopop-card-raised w-full max-w-lg p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">New Payment</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
              </div>
              {error && <p className="mb-3 rounded-md bg-neopop-red/10 px-3 py-2 text-sm text-neopop-red">{error}</p>}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="neopop-section-title mb-1 block">Invoice ID</label>
                  <input value={form.invoiceId} readOnly className="neopop-input w-full px-3 py-2 font-mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="neopop-section-title mb-1 block">Agent</label>
                    <select value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })} required className="neopop-input w-full px-3 py-2 text-sm">
                      <option value="">Select agent</option>
                      {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="neopop-section-title mb-1 block">Gas Pool</label>
                    <select value={form.poolId} onChange={(e) => setForm({ ...form, poolId: e.target.value })} required className="neopop-input w-full px-3 py-2 text-sm">
                      <option value="">Select pool</option>
                      {pools.map((p) => <option key={p.id} value={p.id}>Pool {p.id.slice(0, 8)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="neopop-section-title mb-1 block">Merchant (optional)</label>
                    <select value={form.merchantId} onChange={(e) => setForm({ ...form, merchantId: e.target.value })} className="neopop-input w-full px-3 py-2 text-sm">
                      <option value="">None</option>
                      {merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="neopop-section-title mb-1 block">Amount (USD cents)</label>
                    <input type="number" min="1" value={form.amountUsdCents} onChange={(e) => setForm({ ...form, amountUsdCents: e.target.value })} required placeholder="e.g. 1500" className="neopop-input w-full px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="neopop-section-title mb-1 block">Network</label>
                  <select value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value as Network })} className="neopop-input w-full px-3 py-2 text-sm">
                    <option value="testnet">Testnet</option>
                    <option value="mainnet">Mainnet</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="neopop-btn neopop-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold disabled:opacity-50">
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
