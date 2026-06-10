export type Network = "mainnet" | "testnet";

export type PaymentStatus = "pending" | "processing" | "settled" | "failed";

export type PoolStatus = "healthy" | "low" | "critical" | "empty";

export type AgentStatus = "active" | "limit_reached" | "suspended";

export interface TimelineEvent {
  step: string;
  status: "done" | "pending" | "failed";
  timestamp: number;
  detail?: string;
}

export interface Agent {
  id: string;
  name: string;
  algoAddress: string;
  dailyLimitCents: number;
  dailySpentCents: number;
  status: AgentStatus;
  poolId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GasPool {
  id: string;
  workspaceId: string;
  apiKeyId: string;
  balanceUsdc: string;
  dailyCapCents: number;
  alertThresholdUsdc: string;
  status: PoolStatus;
  createdAt: string;
  updatedAt: string;
  apiKey?: { id: string; name: string; network: Network; prefix: string };
  agents?: { id: string }[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  workspaceId: string;
  agentId: string;
  poolId: string;
  merchantId: string | null;
  status: PaymentStatus;
  amountUsdCents: number;
  amountUsdc: string | null;
  algoTxnId: string | null;
  blockRound: number | null;
  confirmedAt: string | null;
  gasSponsored: boolean;
  gasFeeAlgo: string | null;
  network: Network;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  agent?: Agent;
  pool?: GasPool;
}

export interface ApiKey {
  id: string;
  name: string;
  workspaceId: string;
  prefix: string;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string;
}

export interface Merchant {
  id: string;
  workspaceId: string;
  name: string;
  algoAddress: string;
  merchantRef: string;
  createdAt: string;
  updatedAt: string;
}

export type WebhookEvent = "payment_settled" | "payment_failed" | "pool_low";

export interface Webhook {
  id: string;
  workspaceId: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSession {
  id: string;
  workspaceId: string;
  merchantId: string | null;
  amount: string;
  currency: string;
  description: string | null;
  status: "pending" | "paid" | "expired" | "cancelled";
  expiresAt: string;
  paymentTxHash: string | null;
  payerAddress: string | null;
  webhookUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SdkEvent {
  id: string;
  workspaceId: string;
  eventType: string;
  walletId: string | null;
  recipient: string | null;
  amount: string | null;
  purpose: string | null;
  guardsPassed: string[];
  guardBlockReason: string | null;
  txHash: string | null;
  sdkVersion: string | null;
  sdkLanguage: string | null;
  idempotencyKey: string | null;
  timestamp: string;
  createdAt: string;
}
