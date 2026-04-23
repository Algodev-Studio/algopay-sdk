"use client";

import { useEffect, useState } from "react";

type WalletSet = { id: string; name: string; walletCount: number };
type Wallet = {
  id: string;
  address: string;
  walletSetId: string;
  walletSetName: string;
  usdcBalance: string;
};

export default function WalletsPage() {
  const [sets, setSets] = useState<WalletSet[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [setName, setSetName] = useState("agents");
  const [selectedSet, setSelectedSet] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setErr(null);
    const [a, b] = await Promise.all([fetch("/api/wallet-sets"), fetch("/api/wallets")]);
    if (a.ok) {
      const j = (await a.json()) as { walletSets: WalletSet[] };
      setSets(j.walletSets);
      if (!selectedSet && j.walletSets[0]) setSelectedSet(j.walletSets[0].id);
    }
    if (b.ok) {
      const j = (await b.json()) as { wallets: Wallet[] };
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

  return (
    <>
      <h1>Wallets</h1>
      {err && <p style={{ color: "#f85149" }}>{err}</p>}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Wallet sets</h2>
        <form className="row" onSubmit={createSet}>
          <div>
            <label>New set name</label>
            <input value={setName} onChange={(e) => setSetName(e.target.value)} required />
          </div>
          <button type="submit">Create set</button>
        </form>
        <ul>
          {sets.map((s) => (
            <li key={s.id}>
              {s.name} — {s.walletCount} wallets ({s.id.slice(0, 8)}…)
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>New wallet</h2>
        <form className="row" onSubmit={createWallet}>
          <div>
            <label>Wallet set</label>
            <select value={selectedSet} onChange={(e) => setSelectedSet(e.target.value)}>
              <option value="">—</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Generate wallet (vault)</button>
        </form>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          Keys are encrypted at rest (AES-GCM + vault master key). Signing uses server-side decrypt
          for agent payments (server-assisted signing).
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Your wallets</h2>
        <button type="button" className="secondary" onClick={() => void refresh()}>
          Refresh balances
        </button>
        <table style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Set</th>
              <th>Address</th>
              <th>USDC</th>
              <th>Id</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((w) => (
              <tr key={w.id}>
                <td>{w.walletSetName}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{w.address}</td>
                <td>{w.usdcBalance}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{w.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
