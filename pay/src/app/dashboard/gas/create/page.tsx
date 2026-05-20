"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";

export default function CreateGasPoolPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    balanceUsdc: "",
    dailyCapCents: "",
    alertThresholdUsdc: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/gas-pools", {
        balanceUsdc: String(Number(form.balanceUsdc) * 1_000_000),
        dailyCapCents: Number(form.dailyCapCents),
        alertThresholdUsdc: String(Number(form.alertThresholdUsdc) * 1_000_000),
      });
      router.push("/dashboard/gas");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create gas pool");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto max-w-xl space-y-4">
      <Link href="/dashboard/gas" className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition hover:text-text-primary">
        <ArrowLeft size={14} /> Back to Gas Pools
      </Link>

      <AnimatedSection>
        <div className="neopop-card p-6">
          <h1 className="mb-6 font-impact text-xl uppercase tracking-wider text-text-primary">Create Gas Pool</h1>
          {error && <p className="mb-4 rounded-md bg-neopop-red/10 px-3 py-2 text-sm text-neopop-red">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="neopop-section-title mb-1 block">Initial Balance (USDC)</label>
              <input type="number" min="0" step="0.01" value={form.balanceUsdc} onChange={(e) => setForm({ ...form, balanceUsdc: e.target.value })} required placeholder="e.g. 100.00" className="neopop-input w-full" />
              {form.balanceUsdc && (
                <p className="mt-1 text-xs text-text-secondary">{Number(form.balanceUsdc).toFixed(2)} USDC</p>
              )}
            </div>
            <div>
              <label className="neopop-section-title mb-1 block">Daily Cap (USD cents)</label>
              <input type="number" min="1" value={form.dailyCapCents} onChange={(e) => setForm({ ...form, dailyCapCents: e.target.value })} required placeholder="e.g. 100000" className="neopop-input w-full" />
              {form.dailyCapCents && (
                <p className="mt-1 text-xs text-text-secondary">${(Number(form.dailyCapCents) / 100).toFixed(2)} USD per day</p>
              )}
            </div>
            <div>
              <label className="neopop-section-title mb-1 block">Alert Threshold (USDC)</label>
              <input type="number" min="0" step="0.01" value={form.alertThresholdUsdc} onChange={(e) => setForm({ ...form, alertThresholdUsdc: e.target.value })} required placeholder="e.g. 10.00" className="neopop-input w-full" />
              <p className="mt-1 text-xs text-text-muted">You&apos;ll be alerted when the pool balance drops below this amount.</p>
            </div>
            <button type="submit" disabled={submitting} className="neopop-btn neopop-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold disabled:opacity-50">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Gas Pool"}
            </button>
          </form>
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
