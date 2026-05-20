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

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-text-muted transition hover:bg-surface-raised hover:text-text-primary">
      {copied ? <><Check size={12} className="text-neopop-green" /> Copied</> : <><Copy size={12} /> Copy</>}
    </button>
  );
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [spending, setSpending] = useState({
    maxDailyUsdc: "1000",
    maxSingleTxUsdc: "500",
    approvalThresholdUsdc: "250",
  });
  const [savingSpending, setSavingSpending] = useState(false);
  const [spendingSaved, setSpendingSaved] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ keys: ApiKeyRow[] }>("/api/api-keys");
      setKeys(data.keys ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWorkspace = useCallback(async () => {
    try {
      const ws = await api.get<{
        maxDailyUsdc: string | null;
        maxSingleTxUsdc: string | null;
        approvalThresholdUsdc: string | null;
      }>("/api/workspace");
      setSpending({
        maxDailyUsdc: ws.maxDailyUsdc ?? "1000",
        maxSingleTxUsdc: ws.maxSingleTxUsdc ?? "500",
        approvalThresholdUsdc: ws.approvalThresholdUsdc ?? "250",
      });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => { fetchKeys(); fetchWorkspace(); }, [fetchKeys, fetchWorkspace]);

  async function generateKey(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError("");
    setGeneratedKey(null);
    try {
      const result = await api.post<{ apiKey: string; message: string }>("/api/api-keys", { name: newKeyName });
      setGeneratedKey(result.apiKey);
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
      <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">Settings</h1>

      <AnimatedSection>
        <div className="neopop-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Key size={18} className="text-neopop-yellow" />
            <h2 className="text-lg font-bold uppercase tracking-wide text-text-primary">API Keys</h2>
          </div>

          <form onSubmit={generateKey} className="mb-4 flex gap-2">
            <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} required placeholder="Key name (e.g. Production)"
              className="neopop-input flex-1" />
            <button type="submit" disabled={generating}
              className="neopop-btn neopop-btn-primary disabled:opacity-50">
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Generate
            </button>
          </form>

          {error && <p className="mb-3 border border-neopop-red/30 bg-neopop-red/10 px-3 py-2 text-sm text-neopop-red">{error}</p>}

          {generatedKey && (
            <div className="mb-4 border border-neopop-green/30 bg-neopop-green/5 p-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neopop-green">New API Key Created</p>
              <p className="mb-1 text-xs text-text-muted">Copy this key now — it won&apos;t be shown again.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto bg-background px-2 py-1 font-mono text-sm text-text-primary">
                  {showKey ? generatedKey : `${generatedKey.slice(0, 8)}${"•".repeat(32)}`}
                </code>
                <button type="button" onClick={() => setShowKey(!showKey)} className="text-text-muted hover:text-text-primary">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <CopyButton text={generatedKey} />
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="neopop-table">
              <thead>
                <tr className="bg-neopop-yellow text-neopop-black">
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Name</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Prefix</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Created</th>
                  <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-16 animate-pulse rounded bg-surface-raised" /></td>
                    ))}
                  </tr>
                )) : keys.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-8 text-center text-text-muted">No API keys. Generate one above.</td></tr>
                ) : keys.map((k) => (
                  <tr key={k.id} className="border-t border-border text-text-primary transition hover:bg-surface-raised">
                    <td className="px-3 py-3 font-medium">{k.name}</td>
                    <td className="px-3 py-3 font-mono text-xs text-text-muted">{k.prefix}...</td>
                    <td className="px-3 py-3 text-text-muted">{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-right">
                      {revokeConfirm === k.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => revokeKey(k.id)}
                            className="neopop-btn neopop-btn-danger px-2 py-1 text-xs">Confirm Revoke</button>
                          <button type="button" onClick={() => setRevokeConfirm(null)}
                            className="px-2 py-1 text-xs text-text-muted hover:text-text-primary">Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => revokeKey(k.id)} disabled={revoking === k.id}
                          className="p-1.5 text-text-muted transition hover:bg-surface-raised hover:text-neopop-red disabled:opacity-40" title="Revoke">
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
        <div className="neopop-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Shield size={18} className="text-neopop-yellow" />
            <h2 className="text-lg font-bold uppercase tracking-wide text-text-primary">Spending Controls</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="neopop-section-title mb-1 block">Daily Allowance (USDC)</label>
              <input type="number" value={spending.maxDailyUsdc} onChange={(e) => setSpending({ ...spending, maxDailyUsdc: e.target.value })}
                className="neopop-input w-full" />
              <p className="mt-1 text-xs text-neopop-yellow">${spending.maxDailyUsdc}/day</p>
            </div>
            <div>
              <label className="neopop-section-title mb-1 block">Max Transaction (USDC)</label>
              <input type="number" value={spending.maxSingleTxUsdc} onChange={(e) => setSpending({ ...spending, maxSingleTxUsdc: e.target.value })}
                className="neopop-input w-full" />
              <p className="mt-1 text-xs text-neopop-yellow">${spending.maxSingleTxUsdc} max per tx</p>
            </div>
            <div>
              <label className="neopop-section-title mb-1 block">Approval Threshold (USDC)</label>
              <input type="number" value={spending.approvalThresholdUsdc} onChange={(e) => setSpending({ ...spending, approvalThresholdUsdc: e.target.value })}
                className="neopop-input w-full" />
              <p className="mt-1 text-xs text-neopop-yellow">Approve above ${spending.approvalThresholdUsdc}</p>
            </div>
          </div>
          <button type="button" onClick={saveSpending} disabled={savingSpending}
            className="neopop-btn neopop-btn-primary mt-4 disabled:opacity-50">
            {savingSpending ? <Loader2 size={14} className="animate-spin" /> : spendingSaved ? <Check size={14} /> : null}
            {spendingSaved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="neopop-card-flat border-neopop-red/20 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-neopop-red" />
            <h2 className="text-lg font-bold uppercase tracking-wide text-neopop-red">Danger Zone</h2>
          </div>
          <p className="mb-3 text-sm text-text-muted">Permanently delete this organization and all its data. This action cannot be undone.</p>
          <button type="button" className="neopop-btn neopop-btn-danger">
            Delete Organization
          </button>
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
