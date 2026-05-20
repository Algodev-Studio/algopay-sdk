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
      <h1 className="font-impact text-2xl uppercase tracking-wider text-text-primary">API Playground</h1>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <AnimatedSection>
          <div className="neopop-card p-3">
            <p className="neopop-section-title mb-2">Commands</p>
            {CATEGORIES.map((cat) => (
              <div key={cat.label} className="mb-2">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {cat.icon} {cat.label}
                </div>
                {cat.commands.map((cmd) => (
                  <button key={cmd.id} type="button" onClick={() => selectCommand(cmd)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition ${selectedCmd.id === cmd.id ? "bg-neopop-yellow/20 text-neopop-yellow" : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"}`}>
                    <ChevronRight size={12} className={selectedCmd.id === cmd.id ? "text-neopop-yellow" : "text-text-muted"} />
                    <span className="mr-auto">{cmd.label}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${cmd.method === "GET" ? "bg-neopop-blue/20 text-neopop-blue" : cmd.method === "POST" ? "bg-neopop-green/20 text-neopop-green" : cmd.method === "DELETE" ? "bg-neopop-red/20 text-neopop-red" : "bg-neopop-yellow/20 text-neopop-yellow"}`}>
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
            <div className="neopop-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${selectedCmd.method === "GET" ? "bg-neopop-blue/20 text-neopop-blue" : selectedCmd.method === "POST" ? "bg-neopop-green/20 text-neopop-green" : selectedCmd.method === "DELETE" ? "bg-neopop-red/20 text-neopop-red" : "bg-neopop-yellow/20 text-neopop-yellow"}`}>
                  {selectedCmd.method}
                </span>
                <span className="font-mono text-sm text-text-secondary">{selectedCmd.path}</span>
              </div>
              {selectedCmd.fields && selectedCmd.fields.length > 0 && (
                <div className="mb-4 space-y-3">
                  {selectedCmd.fields.map((f) => (
                    <div key={f.name}>
                      <label className="neopop-section-title mb-1 block">{f.label}{f.required && " *"}</label>
                      <input type={f.type} value={fieldValues[f.name] ?? ""} onChange={(e) => setFieldValues({ ...fieldValues, [f.name]: e.target.value })} placeholder={f.placeholder} required={f.required}
                        className="neopop-input w-full" />
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={runCommand} disabled={running}
                className="neopop-btn neopop-btn-primary flex items-center gap-2 px-5 py-2 text-sm font-semibold disabled:opacity-50">
                {running ? <><Loader2 size={16} className="animate-spin" /> Running...</> : <><Play size={16} /> Run</>}
              </button>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="neopop-card p-4">
              <p className="neopop-section-title mb-2">Output Log</p>
              {logs.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-muted">Run a command to see results here.</p>
              ) : (
                <div className="max-h-[420px] space-y-2 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className={`rounded-md border p-3 ${log.status === "success" ? "border-neopop-green/20 bg-neopop-green/5" : "border-neopop-red/20 bg-neopop-red/5"}`}>
                      <div className="mb-1 flex items-center gap-2 text-xs">
                        {log.status === "success" ? <CheckCircle2 size={14} className="text-neopop-green" /> : <XCircle size={14} className="text-neopop-red" />}
                        <span className="font-semibold text-text-primary">{log.command}</span>
                        <span className="text-text-muted">{log.method} {log.path}</span>
                        <span className="ml-auto text-text-muted">{log.duration}ms</span>
                      </div>
                      <pre className="max-h-48 overflow-auto rounded bg-background/60 p-2 text-xs text-text-secondary">{log.response}</pre>
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
