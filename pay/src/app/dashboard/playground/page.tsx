"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Bot,
  Store,
  Fuel,
  CreditCard,
  Bell,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";

interface Command {
  id: string;
  label: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  fields?: { name: string; label: string; type: string; required?: boolean; placeholder?: string }[];
}

interface LogEntry {
  id: string;
  command: string;
  method: string;
  path: string;
  status: "success" | "error";
  duration: number;
  response: string;
  timestamp: string;
}

const CATEGORIES: { label: string; icon: React.ReactNode; commands: Command[] }[] = [
  {
    label: "Agents",
    icon: <Bot size={16} />,
    commands: [
      { id: "list-agents", label: "List Agents", method: "GET", path: "/api/agents" },
      { id: "create-agent", label: "Create Agent", method: "POST", path: "/api/agents", fields: [
        { name: "name", label: "Name", type: "text", required: true, placeholder: "My Agent" },
        { name: "algoAddress", label: "Algo Address", type: "text", required: true, placeholder: "ALGO..." },
        { name: "dailyLimitCents", label: "Daily Limit (cents)", type: "number", required: true, placeholder: "50000" },
        { name: "poolId", label: "Pool ID", type: "text", required: true, placeholder: "pool-id" },
      ]},
    ],
  },
  {
    label: "Merchants",
    icon: <Store size={16} />,
    commands: [
      { id: "list-merchants", label: "List Merchants", method: "GET", path: "/api/merchants" },
      { id: "create-merchant", label: "Create Merchant", method: "POST", path: "/api/merchants", fields: [
        { name: "name", label: "Name", type: "text", required: true, placeholder: "Coffee Shop" },
        { name: "algoAddress", label: "Algo Address", type: "text", required: true, placeholder: "ALGO..." },
      ]},
    ],
  },
  {
    label: "Gas Pools",
    icon: <Fuel size={16} />,
    commands: [
      { id: "list-pools", label: "List Gas Pools", method: "GET", path: "/api/gas-pools" },
      { id: "create-pool", label: "Create Gas Pool", method: "POST", path: "/api/gas-pools", fields: [
        { name: "balanceUsdc", label: "Balance (micro USDC)", type: "text", required: true, placeholder: "100000000" },
        { name: "dailyCapCents", label: "Daily Cap (cents)", type: "number", required: true, placeholder: "100000" },
        { name: "alertThresholdUsdc", label: "Alert Threshold (micro)", type: "text", required: true, placeholder: "10000000" },
      ]},
    ],
  },
  {
    label: "Payments",
    icon: <CreditCard size={16} />,
    commands: [
      { id: "list-payments", label: "List Payments", method: "GET", path: "/api/payments" },
      { id: "create-payment", label: "Create Payment", method: "POST", path: "/api/payments", fields: [
        { name: "invoiceId", label: "Invoice ID", type: "text", required: true, placeholder: "INV-001" },
        { name: "agentId", label: "Agent ID", type: "text", required: true, placeholder: "agent-id" },
        { name: "poolId", label: "Pool ID", type: "text", required: true, placeholder: "pool-id" },
        { name: "amountUsdCents", label: "Amount (cents)", type: "number", required: true, placeholder: "1500" },
        { name: "network", label: "Network", type: "text", required: true, placeholder: "testnet" },
      ]},
    ],
  },
  {
    label: "Webhooks",
    icon: <Bell size={16} />,
    commands: [
      { id: "list-webhooks", label: "List Webhooks", method: "GET", path: "/api/webhooks" },
      { id: "create-webhook", label: "Create Webhook", method: "POST", path: "/api/webhooks", fields: [
        { name: "url", label: "URL", type: "text", required: true, placeholder: "https://example.com/hook" },
        { name: "events", label: "Events (comma-separated)", type: "text", required: true, placeholder: "payment_settled,payment_failed" },
      ]},
    ],
  },
  {
    label: "Settings",
    icon: <Settings size={16} />,
    commands: [
      { id: "list-keys", label: "List API Keys", method: "GET", path: "/api/api-keys" },
      { id: "list-audit", label: "Audit Log", method: "GET", path: "/api/audit" },
      { id: "list-checkout", label: "Checkout Sessions", method: "GET", path: "/api/checkout" },
    ],
  },
];

export default function PlaygroundPage() {
  const [selectedCmd, setSelectedCmd] = useState<Command>(CATEGORIES[0].commands[0]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  function selectCommand(cmd: Command) {
    setSelectedCmd(cmd);
    setFieldValues({});
  }

  async function runCommand() {
    setRunning(true);
    const start = performance.now();
    try {
      let result: unknown;
      if (selectedCmd.method === "GET") {
        result = await api.get(selectedCmd.path);
      } else if (selectedCmd.method === "POST") {
        const body: Record<string, unknown> = {};
        for (const f of selectedCmd.fields ?? []) {
          const val = fieldValues[f.name] ?? "";
          if (f.name === "events") {
            body[f.name] = val.split(",").map((s) => s.trim());
          } else if (f.type === "number") {
            body[f.name] = Number(val);
          } else {
            body[f.name] = val;
          }
        }
        result = await api.post(selectedCmd.path, body);
      } else if (selectedCmd.method === "DELETE") {
        result = await api.delete(selectedCmd.path);
      } else {
        const body: Record<string, unknown> = {};
        for (const f of selectedCmd.fields ?? []) {
          const val = fieldValues[f.name] ?? "";
          if (f.type === "number") body[f.name] = Number(val);
          else body[f.name] = val;
        }
        result = await api.patch(selectedCmd.path, body);
      }
      const duration = Math.round(performance.now() - start);
      setLogs((prev) => [...prev, {
        id: crypto.randomUUID(),
        command: selectedCmd.label,
        method: selectedCmd.method,
        path: selectedCmd.path,
        status: "success",
        duration,
        response: JSON.stringify(result, null, 2),
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setLogs((prev) => [...prev, {
        id: crypto.randomUUID(),
        command: selectedCmd.label,
        method: selectedCmd.method,
        path: selectedCmd.path,
        status: "error",
        duration,
        response: err instanceof ApiError ? err.message : String(err),
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setRunning(false);
      setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-100">API Playground</h1>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <AnimatedSection>
          <div className="rounded-lg bg-[#212121] p-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Commands</p>
            {CATEGORIES.map((cat) => (
              <div key={cat.label} className="mb-2">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {cat.icon} {cat.label}
                </div>
                {cat.commands.map((cmd) => (
                  <button key={cmd.id} type="button" onClick={() => selectCommand(cmd)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition ${selectedCmd.id === cmd.id ? "bg-teal-500/20 text-teal-300" : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"}`}>
                    <ChevronRight size={12} className={selectedCmd.id === cmd.id ? "text-teal-400" : "text-slate-600"} />
                    <span className="mr-auto">{cmd.label}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${cmd.method === "GET" ? "bg-blue-500/20 text-blue-300" : cmd.method === "POST" ? "bg-emerald-500/20 text-emerald-300" : cmd.method === "DELETE" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"}`}>
                      {cmd.method}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </AnimatedSection>

        <div className="space-y-4">
          <AnimatedSection>
            <div className="rounded-lg bg-[#212121] p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${selectedCmd.method === "GET" ? "bg-blue-500/20 text-blue-300" : selectedCmd.method === "POST" ? "bg-emerald-500/20 text-emerald-300" : selectedCmd.method === "DELETE" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"}`}>
                  {selectedCmd.method}
                </span>
                <span className="font-mono text-sm text-slate-300">{selectedCmd.path}</span>
              </div>
              {selectedCmd.fields && selectedCmd.fields.length > 0 && (
                <div className="mb-4 space-y-3">
                  {selectedCmd.fields.map((f) => (
                    <div key={f.name}>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">{f.label}{f.required && " *"}</label>
                      <input type={f.type} value={fieldValues[f.name] ?? ""} onChange={(e) => setFieldValues({ ...fieldValues, [f.name]: e.target.value })} placeholder={f.placeholder} required={f.required}
                        className="w-full rounded-md border border-slate-700 bg-[#1d1f22] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" />
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={runCommand} disabled={running}
                className="flex items-center gap-2 rounded-lg bg-btn-gradient px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50">
                {running ? <><Loader2 size={16} className="animate-spin" /> Running...</> : <><Play size={16} /> Run</>}
              </button>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="rounded-lg bg-[#212121] p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Output Log</p>
              {logs.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">Run a command to see results here.</p>
              ) : (
                <div className="max-h-[420px] space-y-2 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className={`rounded-md border p-3 ${log.status === "success" ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
                      <div className="mb-1 flex items-center gap-2 text-xs">
                        {log.status === "success" ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-rose-400" />}
                        <span className="font-semibold text-slate-200">{log.command}</span>
                        <span className="text-slate-500">{log.method} {log.path}</span>
                        <span className="ml-auto text-slate-500">{log.duration}ms</span>
                      </div>
                      <pre className="max-h-48 overflow-auto rounded bg-black/40 p-2 text-xs text-slate-300">{log.response}</pre>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </motion.section>
  );
}
