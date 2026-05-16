"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Shield,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";
import type { ApiKey, ApiKeyCreated } from "@/lib/types";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-200">
      {copied ? <><Check size={12} className="text-emerald-400" /> Copied</> : <><Copy size={12} /> Copy</>}
    </button>
  );
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<ApiKeyCreated | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [spending, setSpending] = useState({
    allowanceCents: 100000,
    maxTxCents: 50000,
    approvalThresholdCents: 25000,
  });
  const [savingSpending, setSavingSpending] = useState(false);
  const [spendingSaved, setSpendingSaved] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<ApiKey[]>("/api/api-keys");
      setKeys(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  async function generateKey(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError("");
    setNewKey(null);
    try {
      const created = await api.post<ApiKeyCreated>("/api/api-keys", { name: newKeyName });
      setNewKey(created);
      setNewKeyName("");
      fetchKeys();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate key");
    } finally {
      setGenerating(false);
    }
  }

  async function revokeKey(id: string) {
    if (revokeConfirm !== id) {
      setRevokeConfirm(id);
      return;
    }
    setRevoking(id);
    setRevokeConfirm(null);
    try {
      await api.delete(`/api/api-keys/${id}`);
      fetchKeys();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to revoke key");
    } finally {
      setRevoking(null);
    }
  }

  async function saveSpending() {
    setSavingSpending(true);
    try {
      await api.patch("/api/workspace", spending);
      setSpendingSaved(true);
      setTimeout(() => setSpendingSaved(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setSavingSpending(false);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Settings</h1>

      <AnimatedSection>
        <div className="rounded-lg bg-[#212121] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Key size={18} className="text-teal-400" />
            <h2 className="text-lg font-semibold text-slate-100">API Keys</h2>
          </div>

          <form onSubmit={generateKey} className="mb-4 flex gap-2">
            <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} required placeholder="Key name (e.g. Production)" className="flex-1 rounded-md border border-slate-700 bg-[#1d1f22] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" />
            <button type="submit" disabled={generating} className="flex items-center gap-2 rounded-lg bg-btn-gradient px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50">
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Generate
            </button>
          </form>

          {error && <p className="mb-3 rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}

          {newKey && (
            <div className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">New API Key Created</p>
              <p className="mb-1 text-xs text-slate-400">Copy this key now — it won&apos;t be shown again.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-black/40 px-2 py-1 font-mono text-sm text-slate-200">
                  {showKey ? newKey.key : `${newKey.prefix}${"•".repeat(32)}`}
                </code>
                <button type="button" onClick={() => setShowKey(!showKey)} className="text-slate-400 hover:text-slate-200">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <CopyButton text={newKey.key} />
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-btn-gradient uppercase text-slate-900">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Prefix</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-16 animate-pulse rounded bg-slate-800" /></td>
                    ))}
                  </tr>
                )) : keys.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-400">No API keys. Generate one above.</td></tr>
                ) : keys.map((k) => (
                  <tr key={k.id} className="border-t border-slate-800 text-slate-200 hover:bg-slate-800/40">
                    <td className="px-3 py-3 font-medium">{k.name}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-400">{k.prefix}...</td>
                    <td className="px-3 py-3 text-slate-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-right">
                      {revokeConfirm === k.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => revokeKey(k.id)} className="rounded-md bg-rose-500/20 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/30">Revoke</button>
                          <button type="button" onClick={() => setRevokeConfirm(null)} className="rounded-md px-2 py-1 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => revokeKey(k.id)} disabled={revoking === k.id}
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-rose-300 disabled:opacity-40" title="Revoke">
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

      <AnimatedSection>
        <div className="rounded-lg bg-[#212121] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Shield size={18} className="text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-100">Spending Controls</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Daily Allowance (cents)</label>
              <input type="number" value={spending.allowanceCents} onChange={(e) => setSpending({ ...spending, allowanceCents: Number(e.target.value) })} className="w-full rounded-md border border-slate-700 bg-[#1d1f22] px-3 py-2 text-sm text-slate-200" />
              <p className="mt-1 text-xs text-slate-500">${(spending.allowanceCents / 100).toFixed(2)}/day</p>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Max Transaction (cents)</label>
              <input type="number" value={spending.maxTxCents} onChange={(e) => setSpending({ ...spending, maxTxCents: Number(e.target.value) })} className="w-full rounded-md border border-slate-700 bg-[#1d1f22] px-3 py-2 text-sm text-slate-200" />
              <p className="mt-1 text-xs text-slate-500">${(spending.maxTxCents / 100).toFixed(2)} max per tx</p>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Approval Threshold (cents)</label>
              <input type="number" value={spending.approvalThresholdCents} onChange={(e) => setSpending({ ...spending, approvalThresholdCents: Number(e.target.value) })} className="w-full rounded-md border border-slate-700 bg-[#1d1f22] px-3 py-2 text-sm text-slate-200" />
              <p className="mt-1 text-xs text-slate-500">Require approval above ${(spending.approvalThresholdCents / 100).toFixed(2)}</p>
            </div>
          </div>
          <button type="button" onClick={saveSpending} disabled={savingSpending}
            className="mt-4 flex items-center gap-2 rounded-lg bg-btn-gradient px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50">
            {savingSpending ? <Loader2 size={14} className="animate-spin" /> : spendingSaved ? <Check size={14} /> : null}
            {spendingSaved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="rounded-lg border border-rose-500/20 bg-[#212121] p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-400" />
            <h2 className="text-lg font-semibold text-rose-300">Danger Zone</h2>
          </div>
          <p className="mb-3 text-sm text-slate-400">Permanently delete this organization and all its data. This action cannot be undone.</p>
          <button type="button" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20">
            Delete Organization
          </button>
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
