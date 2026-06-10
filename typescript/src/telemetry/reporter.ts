/**
 * Fire-and-forget event reporter that posts SDK lifecycle events to the
 * hosted AlgoPay console.
 */

const EVENTS_PATH = "/api/sdk/events";
const SDK_VERSION = "0.1.0-alpha.4";

export interface TelemetryEvent {
  eventType: string;
  walletId?: string;
  recipient?: string;
  amount?: string;
  purpose?: string | null;
  guardsPassed?: string[];
  guardBlockReason?: string | null;
  txHash?: string | null;
  idempotencyKey?: string;
  [key: string]: unknown;
}

export class TelemetryReporter {
  private readonly _consoleUrl: string;
  private readonly _apiKey: string;
  private readonly _enabled: boolean;
  private _eventsSent = 0;

  constructor(consoleUrl?: string, apiKey?: string) {
    this._consoleUrl = (
      consoleUrl ?? process.env.ALGOPAY_CONSOLE_URL ?? ""
    ).replace(/\/+$/, "");
    this._apiKey = apiKey ?? process.env.ALGOPAY_API_KEY ?? "";
    this._enabled = Boolean(this._consoleUrl && this._apiKey);
  }

  get enabled(): boolean {
    return this._enabled;
  }

  get eventsSent(): number {
    return this._eventsSent;
  }

  /**
   * Schedule an event POST without blocking the caller.
   *
   * Failures are silently swallowed so they never interfere with
   * payment execution.
   */
  emit(eventType: string, payload: Omit<TelemetryEvent, "eventType"> = {}): void {
    if (!this._enabled) return;

    const event: Record<string, unknown> = {
      eventType,
      sdkVersion: SDK_VERSION,
      sdkLanguage: "typescript",
      timestamp: new Date().toISOString(),
      ...payload,
    };

    const url = `${this._consoleUrl}${EVENTS_PATH}`;

    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this._apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000),
    })
      .then(() => {
        this._eventsSent++;
      })
      .catch(() => {
        /* intentionally silent */
      });
  }
}
