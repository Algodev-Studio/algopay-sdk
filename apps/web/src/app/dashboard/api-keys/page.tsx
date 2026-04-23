"use client";

import { useEffect, useState } from "react";

type KeyRow = { id: string; name: string; prefix: string; createdAt: string };

export default function ApiKeysPage() {
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
      setErr("Failed");
      return;
    }
    const j = (await res.json()) as { apiKey: string };
    setShown(j.apiKey);
    await refresh();
  }

  return (
    <main>
      <h1>API keys</h1>
      <p style={{ color: "var(--muted)" }}>Use as <code>Authorization: Bearer &lt;key&gt;</code> on agent pay.</p>
      {err && <p style={{ color: "#f85149" }}>{err}</p>}
      {shown && (
        <div className="card" style={{ borderColor: "#4c8bf5" }}>
          <strong>Copy now — shown once:</strong>
          <pre style={{ wordBreak: "break-all" }}>{shown}</pre>
        </div>
      )}
      <form className="card" onSubmit={create} style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <button type="submit">Create key</button>
      </form>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Existing</h2>
        <table>
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
    </main>
  );
}
