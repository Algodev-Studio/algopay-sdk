"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setErr(j.error ?? "Login failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main>
      <h1>Sign in</h1>
      <form className="card" onSubmit={onSubmit} style={{ maxWidth: 400 }}>
        {err && <p style={{ color: "#f85149" }}>{err}</p>}
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        <button type="submit">Sign in</button>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/register">Create account</Link>
        </p>
      </form>
    </main>
  );
}
