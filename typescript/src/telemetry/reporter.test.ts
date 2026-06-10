import { afterEach, describe, expect, it, vi } from "vitest";
import { TelemetryReporter } from "./reporter.js";

describe("TelemetryReporter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is inert without console URL and API key", () => {
    const reporter = new TelemetryReporter("", "");
    expect(reporter.enabled).toBe(false);
    reporter.emit("payment_started", { walletId: "w1" });
    expect(reporter.eventsSent).toBe(0);
  });

  it("posts event when enabled", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const reporter = new TelemetryReporter("http://console.test", "key-abc");
    expect(reporter.enabled).toBe(true);
    reporter.emit("payment_completed", { amount: "1.0" });

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://console.test/api/sdk/events");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer key-abc");
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.eventType).toBe("payment_completed");
    expect(body.sdkLanguage).toBe("typescript");
    await vi.waitFor(() => expect(reporter.eventsSent).toBe(1));
  });

  it("swallows fetch failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const reporter = new TelemetryReporter("http://console.test", "key-abc");
    reporter.emit("payment_failed", {});
    await new Promise((r) => setTimeout(r, 50));
    expect(reporter.eventsSent).toBe(0);
  });
});
