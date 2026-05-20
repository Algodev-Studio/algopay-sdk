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
      <Link href="/dashboard/merchants" className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition hover:text-text-primary">
        <ArrowLeft size={14} /> Back to Merchants
      </Link>

      <AnimatedSection>
        <div className="neopop-card p-6">
          <h1 className="font-impact mb-6 text-xl uppercase tracking-wider text-text-primary">Create Merchant</h1>
          {error && <p className="mb-4 rounded-md bg-neopop-red/10 px-3 py-2 text-sm text-neopop-red">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="neopop-section-title mb-1 block">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Coffee Shop" className="neopop-input w-full px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="neopop-section-title mb-1 block">Algorand Address</label>
              <input value={form.algoAddress} onChange={(e) => setForm({ ...form, algoAddress: e.target.value })} required placeholder="ALGO..." className="neopop-input w-full px-3 py-2 font-mono text-sm" />
              <p className="mt-1 text-xs text-text-muted">The Algorand address that will receive payments for this merchant.</p>
            </div>
            <button type="submit" disabled={submitting} className="neopop-btn neopop-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold disabled:opacity-50">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Merchant"}
            </button>
          </form>
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
