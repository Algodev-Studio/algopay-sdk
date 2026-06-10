"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";

type WalletSet = { id: string; name: string; walletCount: number };
type WalletEntry = {
  id: string;
  address: string;
  walletSetId: string;
  walletSetName: string;
  usdcBalance: string;
  algoBalance: string;
};

export default function WalletsPage() {
  const [sets, setSets] = useState<WalletSet[]>([]);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [setName, setSetName] = useState("agents");
  const [selectedSet, setSelectedSet] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [optInLoading, setOptInLoading] = useState<string | null>(null);
  const [optInMsg, setOptInMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  async function refresh() {
    setErr(null);
    const [a, b] = await Promise.all([fetch("/api/wallet-sets"), fetch("/api/wallets")]);
    if (a.ok) {
      const j = (await a.json()) as { walletSets: WalletSet[] };
      setSets(j.walletSets);
      if (!selectedSet && j.walletSets[0]) setSelectedSet(j.walletSets[0].id);
    }
    if (b.ok) {
      const j = (await b.json()) as { wallets: WalletEntry[] };
      setWallets(j.wallets);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createSet(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/wallet-sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: setName }),
    });
    if (!res.ok) {
      setErr("Failed to create set");
      return;
    }
    setSetName("agents");
    await refresh();
  }

  async function createWallet(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSet) {
      setErr("Create a wallet set first");
      return;
    }
    setErr(null);
    const res = await fetch("/api/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletSetId: selectedSet }),
    });
    if (!res.ok) {
      setErr("Failed to create wallet");
      return;
    }
    await refresh();
  }

  async function handleOptIn(walletId: string) {
    setOptInLoading(walletId);
    setOptInMsg(null);
    try {
      const res = await fetch(`/api/wallets/${walletId}/opt-in`, { method: "POST" });
      const j = (await res.json()) as { txId?: string; error?: string };
      if (res.ok && j.txId) {
        setOptInMsg({ id: walletId, msg: `Opted in — tx: ${j.txId.slice(0, 12)}…`, ok: true });
      } else {
        setOptInMsg({ id: walletId, msg: j.error ?? "Opt-in failed", ok: false });
      }
    } catch {
      setOptInMsg({ id: walletId, msg: "Network error", ok: false });
    } finally {
      setOptInLoading(null);
      await refresh();
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="space-y-4">
      <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">Wallets</h1>
      {err && <p className="rounded-md bg-neopop-red/10 px-3 py-2 text-sm text-neopop-red">{err}</p>}

      <AnimatedSection>
        <div className="neopop-card p-5">
          <h2 className="neopop-section-title mb-3">Wallet Sets</h2>
          <form className="flex flex-wrap items-end gap-3" onSubmit={createSet}>
            <div className="flex-1">
              <label className="neopop-section-title mb-1 block">New set name</label>
              <input value={setName} onChange={(e) => setSetName(e.target.value)} required className="neopop-input w-full" />
            </div>
            <button type="submit" className="neopop-btn neopop-btn-primary px-4 py-2 text-sm font-semibold">Create set</button>
          </form>
          {sets.length > 0 && (
            <ul className="mt-4 space-y-1">
              {sets.map((s) => (
                <li key={s.id} className="flex items-center gap-2 rounded-md bg-surface-raised px-3 py-2 text-sm text-text-secondary">
                  <Wallet size={14} className="text-neopop-yellow" />
                  <span className="font-medium text-text-primary">{s.name}</span>
                  <span className="text-text-muted">— {s.walletCount} wallets</span>
                  <span className="ml-auto font-mono text-xs text-text-muted">{s.id.slice(0, 8)}…</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="neopop-card p-5">
          <h2 className="neopop-section-title mb-3">New Wallet</h2>
          <form className="flex flex-wrap items-end gap-3" onSubmit={createWallet}>
            <div className="flex-1">
              <label className="neopop-section-title mb-1 block">Wallet set</label>
              <select value={selectedSet} onChange={(e) => setSelectedSet(e.target.value)} className="neopop-input w-full">
                <option value="">—</option>
                {sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="neopop-btn neopop-btn-primary px-4 py-2 text-sm font-semibold">Generate wallet (vault)</button>
          </form>
          <p className="mt-3 text-xs text-text-muted">
            Keys are encrypted at rest (AES-GCM + vault master key). Signing uses server-side decrypt
            for agent payments (server-assisted signing).
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="neopop-card overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <h2 className="neopop-section-title">Your Wallets</h2>
            <button type="button" onClick={() => void refresh()} className="neopop-btn neopop-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs">
              <RefreshCw size={12} /> Refresh balances
            </button>
          </div>
          {optInMsg && (
            <div className={`mx-4 mb-3 rounded px-3 py-2 text-xs ${optInMsg.ok ? "bg-neopop-green/10 text-neopop-green" : "bg-neopop-red/10 text-neopop-red"}`}>
              {optInMsg.msg}
              {optInMsg.ok && (
                <a
                  href={`https://testnet.explorer.perawallet.app/tx/${optInMsg.msg.split("tx: ")[1]?.replace("…", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 inline-flex items-center gap-1 underline"
                >
                  View <ExternalLink size={10} />
                </a>
              )}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="neopop-table text-left text-sm">
              <thead className="bg-neopop-yellow text-neopop-black">
                <tr>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Set</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Address</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">ALGO</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">USDC</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-10 text-center text-text-muted">No wallets created yet.</td></tr>
                ) : wallets.map((w) => (
                  <tr key={w.id} className="border-t border-border text-text-primary hover:bg-surface-raised">
                    <td className="px-3 py-3">{w.walletSetName}</td>
                    <td className="px-3 py-3 font-mono text-xs">
                      <span title={w.address}>{w.address.slice(0, 8)}…{w.address.slice(-4)}</span>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{w.algoBalance} <span className="text-xs text-text-muted">ALGO</span></td>
                    <td className="px-3 py-3 tabular-nums">{w.usdcBalance} <span className="text-xs text-text-muted">USDC</span></td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => void handleOptIn(w.id)}
                        disabled={optInLoading === w.id}
                        className="neopop-btn neopop-btn-secondary flex items-center gap-1 px-2.5 py-1 text-xs disabled:opacity-50"
                        title="Opt in to USDC ASA (required before receiving USDC)"
                      >
                        {optInLoading === w.id ? (
                          <><Loader2 size={10} className="animate-spin" /> Opting in…</>
                        ) : (
                          "Opt in USDC"
                        )}
                      </button>
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
