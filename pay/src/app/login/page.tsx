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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#151515] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <span className="text-3xl text-[#bebf85]">✦</span>
          <p className="mt-1 font-impact text-2xl uppercase tracking-wider text-slate-100">ALGOPAY</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#1d1f22] p-6">
          <h1 className="text-xl font-semibold text-slate-100">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your account</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {err && (
              <p className="rounded-md border border-rose-800 bg-rose-950/30 px-3 py-2 text-sm text-rose-300">
                {err}
              </p>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Email</label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="h-10 w-full rounded-md border border-slate-700 bg-[#242629] px-3 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Password</label>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="h-10 w-full rounded-md border border-slate-700 bg-[#242629] px-3 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-md bg-btn-gradient text-sm font-semibold uppercase tracking-wide text-slate-900 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#bebf85] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
