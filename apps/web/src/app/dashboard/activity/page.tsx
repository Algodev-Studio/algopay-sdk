"use client";

import { useEffect, useState } from "react";

type Entry = {
  id: string;
  walletId: string;
  recipient: string;
  amount: string;
  purpose: string | null;
  status: string;
  txHash: string | null;
  createdAt: string;
};

export default function ActivityPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/ledger");
      if (res.ok) {
        const j = (await res.json()) as { entries: Entry[] };
        setEntries(j.entries);
      }
    })();
  }, []);

  return (
    <main>
      <h1>Activity</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Status</th>
              <th>Amount</th>
              <th>To</th>
              <th>Purpose</th>
              <th>Tx</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
                <td>{e.status}</td>
                <td>{e.amount}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{e.recipient}</td>
                <td>{e.purpose ?? "—"}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.7rem" }}>{e.txHash ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
