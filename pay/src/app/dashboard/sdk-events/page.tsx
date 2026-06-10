"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Radio, Filter, RefreshCw } from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api } from "@/lib/api-client";
import type { SdkEvent } from "@/lib/types";

const EVENT_COLORS: Record<string, string> = {
  "payment.initiated": "bg-neopop-blue/20 text-neopop-blue border-neopop-blue/30",
  "payment.guard_passed": "bg-neopop-green/20 text-neopop-green border-neopop-green/30",
  "payment.guard_blocked": "bg-neopop-red/20 text-neopop-red border-neopop-red/30",
  "payment.completed": "bg-neopop-green/20 text-neopop-green border-neopop-green/30",
  "payment.failed": "bg-neopop-red/20 text-neopop-red border-neopop-red/30",
};

const LANG_BADGES: Record<string, string> = {
  python: "bg-blue-600/20 text-blue-400 border-blue-500/30",
  typescript: "bg-cyan-600/20 text-cyan-400 border-cyan-500/30",
};

const EVENT_FILTERS = ["All", "payment.initiated", "payment.guard_passed", "payment.guard_blocked", "payment.completed", "payment.failed"];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SdkEventsPage() {
  const [events, setEvents] = useState<SdkEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [langFilter, setLangFilter] = useState("All");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filter !== "All") params.set("eventType", filter);
      if (langFilter !== "All") params.set("sdkLanguage", langFilter);
      const data = await api.get<{ events: SdkEvent[] }>(`/api/sdk-events?${params}`);
      setEvents(data.events ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [filter, langFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchEvents, 5000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchEvents]);

  const initiated = events.filter((e) => e.eventType === "payment.initiated").length;
  const completed = events.filter((e) => e.eventType === "payment.completed").length;
  const blocked = events.filter((e) => e.eventType === "payment.guard_blocked").length;
  const failed = events.filter((e) => e.eventType === "payment.failed").length;

  const kpiCards = [
    { title: "Total Events", value: String(events.length), accent: "border-l-neopop-yellow" },
    { title: "Completed", value: String(completed), accent: "border-l-neopop-green" },
    { title: "Blocked", value: String(blocked), accent: "border-l-neopop-red" },
    { title: "Initiated", value: String(initiated), accent: "border-l-neopop-blue" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5 text-neopop-yellow" />
          <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">
            SDK Events
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              autoRefresh
                ? "bg-neopop-green/20 text-neopop-green"
                : "bg-surface-raised text-text-muted"
            }`}
          >
            <RefreshCw className={`h-3 w-3 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Live" : "Paused"}
          </button>
          <button
            type="button"
            onClick={fetchEvents}
            className="neopop-btn neopop-btn-secondary px-3 py-1.5 text-xs"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <AnimatedSection key={card.title}>
            <div className={`neopop-card-flat border-l-4 ${card.accent} p-4`}>
              <p className="neopop-section-title">{card.title}</p>
              <p className="mt-2 font-impact text-3xl uppercase leading-none text-text-primary">
                {loading ? "..." : card.value}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* Filters */}
      <AnimatedSection>
        <div className="neopop-card-flat p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-text-muted" />
              {EVENT_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                    f === filter
                      ? "bg-neopop-yellow text-neopop-black"
                      : "text-text-muted hover:bg-surface-raised hover:text-text-primary"
                  }`}
                >
                  {f === "All" ? "All" : f.replace("payment.", "")}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {["All", "python", "typescript"].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLangFilter(lang)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                    lang === langFilter
                      ? "bg-neopop-yellow text-neopop-black"
                      : "text-text-muted hover:bg-surface-raised hover:text-text-primary"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Event stream */}
      <AnimatedSection>
        <div className="neopop-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="neopop-table w-full">
              <thead>
                <tr className="bg-neopop-yellow text-neopop-black">
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Event</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">SDK</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Wallet</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Recipient</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Guards</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">TX</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-t border-border">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-3 py-3">
                            <div className="h-3 w-16 animate-pulse rounded bg-surface-raised" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : events.length === 0
                    ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-10 text-center text-text-muted">
                            No SDK events yet. Connect an SDK with ALGOPAY_CONSOLE_URL and ALGOPAY_API_KEY to start streaming.
                          </td>
                        </tr>
                      )
                    : events.map((evt) => (
                        <tr
                          key={evt.id}
                          className="border-t border-border text-text-primary transition hover:bg-surface-raised"
                        >
                          <td className="px-3 py-3">
                            <span
                              className={`inline-block border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                EVENT_COLORS[evt.eventType] ?? "bg-surface-raised text-text-muted"
                              }`}
                            >
                              {evt.eventType.replace("payment.", "")}
                            </span>
                            {evt.guardBlockReason && (
                              <p className="mt-1 text-[10px] text-neopop-red">{evt.guardBlockReason}</p>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`border px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                LANG_BADGES[evt.sdkLanguage ?? ""] ?? "bg-surface-raised text-text-muted"
                              }`}
                            >
                              {evt.sdkLanguage ?? "—"}
                            </span>
                            {evt.sdkVersion && (
                              <span className="ml-1 text-[10px] text-text-muted">v{evt.sdkVersion}</span>
                            )}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-text-muted">
                            {evt.walletId ? `${evt.walletId.slice(0, 8)}...` : "—"}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-text-muted">
                            {evt.recipient ? `${evt.recipient.slice(0, 8)}...` : "—"}
                          </td>
                          <td className="px-3 py-3 font-semibold">
                            {evt.amount ? `${evt.amount} USDC` : "—"}
                          </td>
                          <td className="px-3 py-3">
                            {Array.isArray(evt.guardsPassed) && evt.guardsPassed.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {evt.guardsPassed.map((g) => (
                                  <span
                                    key={g}
                                    className="rounded bg-neopop-green/10 px-1.5 py-0.5 text-[10px] text-neopop-green"
                                  >
                                    {g}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-text-muted">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-text-muted">
                            {evt.txHash ? `${evt.txHash.slice(0, 8)}...` : "—"}
                          </td>
                          <td className="px-3 py-3 text-xs text-text-muted">
                            {timeAgo(evt.timestamp)}
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
          {!loading && events.length > 0 && (
            <div className="border-t border-border px-3 py-3 text-xs text-text-muted">
              Showing {events.length} events · {failed > 0 ? `${failed} failed · ` : ""}{blocked > 0 ? `${blocked} blocked` : ""}
            </div>
          )}
        </div>
      </AnimatedSection>
    </motion.section>
  );
}
