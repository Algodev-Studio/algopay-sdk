"use client";

import { useEffect, useState } from "react";

export default function PoliciesPage() {
  const [network, setNetwork] = useState("testnet");
  const [maxSingle, setMaxSingle] = useState("");
  const [requireJ, setRequireJ] = useState(false);
  const [allowlist, setAllowlist] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/workspace");
      if (!res.ok) return;
      const w = (await res.json()) as {
        network: string;
        maxSingleTxUsdc: string | null;
        requireJustification: boolean;
        recipientAllowlist: string[] | null;
      };
      setNetwork(w.network);
      setMaxSingle(w.maxSingleTxUsdc ?? "");
      setRequireJ(w.requireJustification);
      setAllowlist(w.recipientAllowlist?.join("\n") ?? "");
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const lines = allowlist
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        network,
        maxSingleTxUsdc: maxSingle || null,
        requireJustification: requireJ,
        recipientAllowlist: lines.length ? lines : null,
      }),
    });
    setMsg(res.ok ? "Saved." : "Save failed");
  }

  return (
    <>
      <h1>Policies</h1>
      <form className="card" onSubmit={save} style={{ maxWidth: 520 }}>
        {msg && <p>{msg}</p>}
        <div style={{ marginBottom: "1rem" }}>
          <label>Network</label>
          <select value={network} onChange={(e) => setNetwork(e.target.value)}>
            <option value="testnet">testnet</option>
            <option value="mainnet">mainnet</option>
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Max single tx (USDC, empty = no limit)</label>
          <input value={maxSingle} onChange={(e) => setMaxSingle(e.target.value)} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={requireJ}
              onChange={(e) => setRequireJ(e.target.checked)}
            />{" "}
            Require justification (purpose) on agent payments
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Recipient allowlist (one Algorand address per line; empty = any)</label>
          <textarea rows={6} value={allowlist} onChange={(e) => setAllowlist(e.target.value)} />
        </div>
        <button type="submit">Save workspace policy</button>
      </form>
    </>
  );
}
