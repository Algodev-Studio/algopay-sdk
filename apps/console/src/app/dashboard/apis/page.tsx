"use client";

import { useEffect, useState } from "react";

type KeyRow = { id: string; name: string; prefix: string; createdAt: string };

export default function ApisPage() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [name, setName] = useState("default-agent");
  const [shown, setShown] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/api-keys");
    if (res.ok) {
      const j = (await res.json()) as { keys: KeyRow[] };
      setKeys(j.keys);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setShown(null);
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      setErr("Failed to create key");
      return;
    }
    const j = (await res.json()) as { apiKey: string };
    setShown(j.apiKey);
    await refresh();
  }

  return (
    <>
      <h1>APIs</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        Agent keys for <code>POST /api/agent/pay</code>. Custom x402 endpoints are planned — register
        pay-per-call URLs your agents can invoke.
      </p>

      <div className="card">
        <h2>Pre-configured services</h2>
        <p className="muted">
          No bundled provider marketplace yet. Use the TypeScript/Python SDKs with any x402 resource
          server on Algorand.
        </p>
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 8,
            padding: "1rem",
            marginTop: "0.75rem",
          }}
        >
          <strong>AlgoPay agent pay</strong>
          <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.875rem" }}>
            Hosted signing for USDC transfers. Toggle: always on for this workspace.
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Custom x402 endpoints</h2>
        <div className="empty-state" style={{ padding: "2rem 1rem" }}>
          <div className="icon" aria-hidden>
            🔗
          </div>
          <p>No custom endpoints configured</p>
          <p className="muted" style={{ maxWidth: "44ch", margin: "0 auto" }}>
            Add your resource URLs here in a future release (stored per workspace, enabled for
            agents).
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: "1.1rem", marginTop: "1.5rem" }}>API keys</h2>
      {err && <p style={{ color: "#b42318" }}>{err}</p>}
      {shown && (
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <strong>Copy now — shown once:</strong>
          <pre style={{ wordBreak: "break-all", fontSize: "0.8rem" }}>{shown}</pre>
        </div>
      )}
      <form className="card" onSubmit={create} style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: "1rem" }}>
          <label className="muted" style={{ display: "block", marginBottom: 4 }}>
            Key name
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" style={{ width: "auto" }}>
          + Create API key
        </button>
      </form>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Existing keys</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Prefix</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id}>
                <td>{k.name}</td>
                <td>{k.prefix}…</td>
                <td>{new Date(k.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
