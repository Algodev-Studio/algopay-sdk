"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";
import type { Merchant } from "@/lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-text-muted transition hover:bg-surface-raised hover:text-text-primary"
      title="Copy"
    >
      {copied ? <Check size={12} className="text-neopop-green" /> : <Copy size={12} />}
    </button>
  );
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Merchant[]>("/api/merchants");
      setMerchants(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMerchants(); }, [fetchMerchants]);

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    setDeleting(id);
    setConfirmDelete(null);
    try {
      await api.delete(`/api/merchants/${id}`);
      fetchMerchants();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete merchant");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">Merchants</h1>
        <Link href="/dashboard/merchants/create" className="neopop-btn neopop-btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus size={16} /> New Merchant
        </Link>
      </div>

      <AnimatedSection>
        <div className="neopop-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="neopop-table">
              <thead className="bg-neopop-yellow text-neopop-black">
                <tr>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Name</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Merchant Ref</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Algo Address</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Created</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-20 animate-pulse rounded bg-surface-raised" /></td>
                    ))}
                  </tr>
                )) : merchants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-text-muted">
                      No merchants yet.{" "}
                      <Link href="/dashboard/merchants/create" className="text-neopop-yellow underline">Create one</Link>
                    </td>
                  </tr>
                ) : merchants.map((m) => (
                  <tr key={m.id} className="border-t border-border text-text-primary hover:bg-surface-raised">
                    <td className="px-3 py-3 font-medium">{m.name}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-text-secondary">
                        {m.merchantRef}
                        <CopyButton text={m.merchantRef} />
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-text-muted">{m.algoAddress.slice(0, 8)}...{m.algoAddress.slice(-4)}</td>
                    <td className="px-3 py-3 text-text-secondary">{timeAgo(m.createdAt)}</td>
                    <td className="px-3 py-3 text-right">
                      {confirmDelete === m.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => handleDelete(m.id)} className="rounded-md bg-neopop-red/20 px-2 py-1 text-xs text-neopop-red hover:bg-neopop-red/30">Delete</button>
                          <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-md px-2 py-1 text-xs text-text-muted hover:text-text-primary">Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => handleDelete(m.id)} disabled={deleting === m.id}
                          className="rounded-md p-1.5 text-text-muted transition hover:bg-surface-raised hover:text-neopop-red disabled:opacity-40" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      )}
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
