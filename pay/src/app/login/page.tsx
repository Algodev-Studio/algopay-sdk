"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center">
          <img src="/logos/logo-icon.png" alt="AlgoPay" width={36} height={36} className="invert brightness-200" />
          <p className="mt-2 font-impact text-2xl uppercase tracking-wider text-text-primary">ALGOPAY</p>
        </div>

        <div className="neopop-card p-6">
          <h1 className="text-xl font-bold uppercase tracking-wide text-text-primary">Welcome back</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in to your account</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {err && (
              <p className="border border-neopop-red/30 bg-neopop-red/10 px-3 py-2 text-sm text-neopop-red">
                {err}
              </p>
            )}
            <div>
              <label htmlFor="email" className="neopop-section-title mb-1 block">Email</label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="neopop-input h-10 w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="neopop-section-title mb-1 block">Password</label>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="neopop-input h-10 w-full"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="neopop-btn neopop-btn-primary h-11 w-full disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-neopop-yellow hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
