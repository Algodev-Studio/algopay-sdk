"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";
import type { GasPool } from "@/lib/types";

export default function CreateAgentPage() {
  const router = useRouter();
  const [pools, setPools] = useState<GasPool[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    algoAddress: "",
    dailyLimitCents: "",
    poolId: "",
  });

  const fetchPools = useCallback(async () => {
    try {
      const data = await api.get<GasPool[]>("/api/gas-pools");
      setPools(data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => { fetchPools(); }, [fetchPools]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/agents", {
        name: form.name,
        algoAddress: form.algoAddress,
        dailyLimitCents: Number(form.dailyLimitCents),
        poolId: form.poolId,
      });
      router.push("/dashboard/agents");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto max-w-xl space-y-4">
      <Link href="/dashboard/agents" className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition hover:text-text-primary">
        <ArrowLeft size={14} /> Back to Agents
      </Link>

      <AnimatedSection>
        <div className="neopop-card p-6">
          <h1 className="font-impact mb-6 text-xl uppercase tracking-wider text-text-primary">Create Agent</h1>
          {error && <p className="mb-4 rounded-md bg-neopop-red/10 px-3 py-2 text-sm text-neopop-red">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="neopop-section-title mb-1 block">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Purchase Bot" className="neopop-input w-full px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="neopop-section-title mb-1 block">Algorand Address</label>
              <input value={form.algoAddress} onChange={(e) => setForm({ ...form, algoAddress: e.target.value })} required placeholder="ALGO..." className="neopop-input w-full px-3 py-2 font-mono text-sm" />
            </div>
            <div>
              <label className="neopop-section-title mb-1 block">Daily Limit (USD cents)</label>
              <input type="number" min="1" value={form.dailyLimitCents} onChange={(e) => setForm({ ...form, dailyLimitCents: e.target.value })} required placeholder="e.g. 50000" className="neopop-input w-full px-3 py-2 text-sm" />
              {form.dailyLimitCents && (
                <p className="mt-1 text-xs text-text-muted">${(Number(form.dailyLimitCents) / 100).toFixed(2)} USD per day</p>
              )}
            </div>
            <div>
              <label className="neopop-section-title mb-1 block">Gas Pool</label>
              <select value={form.poolId} onChange={(e) => setForm({ ...form, poolId: e.target.value })} required className="neopop-input w-full px-3 py-2 text-sm">
                <option value="">Select a gas pool</option>
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>
                    Pool {p.id.slice(0, 8)} — {(Number(p.balanceUsdc) / 1_000_000).toFixed(2)} USDC ({p.status})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={submitting} className="neopop-btn neopop-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold disabled:opacity-50">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Agent"}
            </button>
          </form>
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
