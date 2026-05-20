"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Plus,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";
import { api, ApiError } from "@/lib/api-client";

interface WrappedApi {
  slug: string;
  name: string;
  description?: string;
  endpoints: number;
  enabled: boolean;
}

interface CustomEndpoint {
  id: string;
  name: string;
  slug: string;
  endpointUrl: string;
  httpMethod: string;
  description?: string;
  enabled: boolean;
}

export default function ApisPage() {
  const [wrappedApis, setWrappedApis] = useState<WrappedApi[]>([]);
  const [endpoints, setEndpoints] = useState<CustomEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingEndpoint, setTogglingEndpoint] = useState<string | null>(null);

  const [form, setForm] = useState({
    url: "",
    slug: "",
    name: "",
    description: "",
    method: "POST" as "GET" | "POST",
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [w, e] = await Promise.allSettled([
        api.get<{ providers: WrappedApi[] }>("/api/wrapped-apis"),
        api.get<{ endpoints: CustomEndpoint[] }>("/api/custom-endpoints"),
      ]);
      if (w.status === "fulfilled") setWrappedApis(w.value.providers);
      if (e.status === "fulfilled") setEndpoints(e.value.endpoints);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function toggleWrappedApi(slug: string) {
    setTogglingSlug(slug);
    try {
      await api.post("/api/wrapped-apis", { slug });
      setWrappedApis((prev) =>
        prev.map((a) => (a.slug === slug ? { ...a, enabled: !a.enabled } : a))
      );
    } finally {
      setTogglingSlug(null);
    }
  }

  async function toggleEndpoint(id: string) {
    setTogglingEndpoint(id);
    try {
      await api.patch(`/api/custom-endpoints/${id}`, {
        enabled: !endpoints.find((ep) => ep.id === id)?.enabled,
      });
      setEndpoints((prev) =>
        prev.map((ep) =>
          ep.id === id ? { ...ep, enabled: !ep.enabled } : ep
        )
      );
    } finally {
      setTogglingEndpoint(null);
    }
  }

  async function deleteEndpoint(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/api/custom-endpoints/${id}`);
      setEndpoints((prev) => prev.filter((ep) => ep.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/custom-endpoints", {
        endpointUrl: form.url,
        slug: form.slug,
        name: form.name,
        description: form.description || null,
        httpMethod: form.method,
      });
      setShowModal(false);
      setForm({ url: "", slug: "", name: "", description: "", method: "POST" });
      fetchAll();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Failed to add endpoint"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-md border border-border-strong bg-surface-raised shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-lg text-text-primary">
                  Add Custom x402 Endpoint
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Endpoint URL
                  </label>
                  <input
                    required
                    value={form.url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, url: e.target.value }))
                    }
                    placeholder="https://api.example.com/endpoint"
                    className="neopop-input h-10 w-full rounded-md px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Slug
                  </label>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    placeholder="e.g. weather-lookup"
                    className="neopop-input h-10 w-full rounded-md px-3 text-sm"
                  />
                  <p className="mt-1 text-xs text-text-muted">
                    Your agent calls POST /api/x402/:slug
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Weather Lookup"
                    className="neopop-input h-10 w-full rounded-md px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="What does this endpoint do?"
                    rows={3}
                    className="neopop-input w-full resize-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    HTTP Method
                  </label>
                  <div className="flex gap-1 rounded-md border border-border bg-background p-1">
                    {(["POST", "GET"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, method: m }))}
                        className={`flex-1 rounded px-3 py-1.5 text-sm font-semibold transition ${
                          form.method === m
                            ? "bg-neopop-yellow text-background"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {formError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="neopop-btn neopop-btn-secondary rounded-md px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="neopop-btn neopop-btn-primary rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : null}
                    Validate &amp; Add
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-8"
      >
        {/* ── Services ── */}
        <AnimatedSection>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-text-primary">Services</h2>
            <p className="neopop-section-title mt-1 text-text-secondary">
              Pre-configured API services available to all agents.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="neopop-card rounded-lg p-5">
                  <div className="h-4 w-28 animate-pulse rounded bg-surface-raised" />
                  <div className="mt-3 h-3 w-20 animate-pulse rounded bg-surface-raised" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wrappedApis.map((svc) => (
                <div
                  key={svc.slug}
                  className="neopop-card flex items-center justify-between rounded-lg p-5"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {svc.name}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      {svc.endpoints} endpoint
                      {svc.endpoints !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={togglingSlug === svc.slug}
                    onClick={() => toggleWrappedApi(svc.slug)}
                    className={`neopop-toggle shrink-0 ${svc.enabled ? "active" : ""} ${
                      togglingSlug === svc.slug ? "opacity-50" : ""
                    }`}
                    aria-label={`Toggle ${svc.name}`}
                  />
                </div>
              ))}
            </div>
          )}
        </AnimatedSection>

        {/* ── Custom Endpoints ── */}
        <AnimatedSection>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                Custom Endpoints
              </h2>
              <p className="neopop-section-title mt-1 text-text-secondary">
                Your own x402 endpoints for custom pay-per-call APIs.
              </p>
            </div>
            {endpoints.length > 0 && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="neopop-btn neopop-btn-primary flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
              >
                <Plus size={14} /> Add Endpoint
              </button>
            )}
          </div>

          {loading ? (
            <div className="neopop-card overflow-hidden rounded-lg">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 border-b border-border px-5 py-4 last:border-0"
                >
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-raised" />
                  <div className="h-4 w-24 animate-pulse rounded bg-surface-raised" />
                  <div className="h-4 w-48 animate-pulse rounded bg-surface-raised" />
                </div>
              ))}
            </div>
          ) : endpoints.length === 0 ? (
            <div className="neopop-card flex flex-col items-center rounded-lg px-6 py-16 text-center">
              <Link2 className="h-10 w-10 text-text-muted" />
              <h3 className="mt-4 text-xl font-semibold text-text-primary">
                No custom endpoints configured
              </h3>
              <p className="mt-2 max-w-md text-sm text-text-secondary">
                Add custom x402 endpoints to let your agent call additional
                pay-per-call APIs.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="neopop-btn neopop-btn-primary mt-6 rounded-md px-4 py-2 text-sm font-semibold"
              >
                + Add your first endpoint
              </button>
            </div>
          ) : (
            <div className="neopop-card overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface-raised text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">URL</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((ep) => (
                      <tr
                        key={ep.id}
                        className="border-t border-border text-text-primary hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 font-medium">{ep.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                          {ep.slug}
                        </td>
                        <td className="max-w-[260px] truncate px-4 py-3 text-text-secondary">
                          {ep.endpointUrl}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded border border-border-strong px-2 py-0.5 text-xs font-semibold text-text-secondary">
                            {ep.httpMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            disabled={togglingEndpoint === ep.id}
                            onClick={() => toggleEndpoint(ep.id)}
                            className={`neopop-toggle ${ep.enabled ? "active" : ""} ${
                              togglingEndpoint === ep.id ? "opacity-50" : ""
                            }`}
                            aria-label={`Toggle ${ep.name}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={deletingId === ep.id}
                            onClick={() => deleteEndpoint(ep.id)}
                            className="rounded-md p-1.5 text-text-muted transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-40"
                            title="Delete endpoint"
                          >
                            {deletingId === ep.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AnimatedSection>
      </motion.section>
    </>
  );
}
