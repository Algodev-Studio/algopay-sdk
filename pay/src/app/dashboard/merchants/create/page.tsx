"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";

export default function CreateMerchantPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    algoAddress: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/merchants", {
        name: form.name,
        algoAddress: form.algoAddress,
      });
      router.push("/dashboard/merchants");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create merchant");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto max-w-xl space-y-4">
      <Link href="/dashboard/merchants" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-200">
        <ArrowLeft size={14} /> Back to Merchants
      </Link>

      <AnimatedSection>
        <div className="rounded-lg bg-[#212121] p-6">
          <h1 className="mb-6 text-xl font-bold text-slate-100">Create Merchant</h1>
          {error && <p className="mb-4 rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Coffee Shop" className="w-full rounded-md border border-slate-700 bg-[#1d1f22] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Algorand Address</label>
              <input value={form.algoAddress} onChange={(e) => setForm({ ...form, algoAddress: e.target.value })} required placeholder="ALGO..." className="w-full rounded-md border border-slate-700 bg-[#1d1f22] px-3 py-2 font-mono text-sm text-slate-200 placeholder:text-slate-500" />
              <p className="mt-1 text-xs text-slate-500">The Algorand address that will receive payments for this merchant.</p>
            </div>
            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-btn-gradient py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Merchant"}
            </button>
          </form>
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
