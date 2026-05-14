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
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-mark">✦</div>
        <div className="auth-logo-word">ALGOPAY</div>
      </div>
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>
        <form onSubmit={onSubmit}>
          {err && <p style={{ color: "#b42318", fontSize: "0.9rem" }}>{err}</p>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="password">Password</label>
            <span className="muted" style={{ fontSize: "0.75rem" }}>
              {/* forgot TBD */}
            </span>
          </div>
          <input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          <button type="submit" className="btn-primary">
            Sign in
          </button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account? <Link href="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
