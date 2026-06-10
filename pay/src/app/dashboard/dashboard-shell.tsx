"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@txnlab/use-wallet-react";
import { useNetwork } from "@/components/providers/NetworkProvider";
import {
  Home,
  ArrowLeftRight,
  HandCoins,
  Bot,
  Store,
  Fuel,
  Wallet,
  Globe,
  ShoppingCart,
  FlaskConical,
  Settings,
  ShieldCheck,
  ExternalLink,
  LogOut,
  Menu,
  Radio,
  type LucideIcon,
} from "lucide-react";
import type { Network } from "@/lib/types";
import { DOCS_URL, SITE_URL } from "@/lib/urls";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { key: "overview", label: "Overview", href: "/dashboard", icon: Home },
    ],
  },
  {
    title: "Activity",
    items: [
      { key: "transactions", label: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
      { key: "payments", label: "Payments", href: "/dashboard/payments", icon: HandCoins },
      { key: "approvals", label: "Approvals", href: "/dashboard/approvals", icon: ShieldCheck },
      { key: "sdk-events", label: "SDK Events", href: "/dashboard/sdk-events", icon: Radio },
    ],
  },
  {
    title: "Manage",
    items: [
      { key: "agents", label: "Agents", href: "/dashboard/agents", icon: Bot },
      { key: "merchants", label: "Merchants", href: "/dashboard/merchants", icon: Store },
      { key: "gas", label: "Gas Pools", href: "/dashboard/gas", icon: Fuel },
      { key: "wallets", label: "Wallets", href: "/dashboard/wallets", icon: Wallet },
    ],
  },
  {
    title: "Config",
    items: [
      { key: "apis", label: "APIs", href: "/dashboard/apis", icon: Globe },
      { key: "checkout", label: "Checkout", href: "/dashboard/checkout", icon: ShoppingCart },
      { key: "playground", label: "Playground", href: "/dashboard/playground", icon: FlaskConical },
      { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
      { key: "docs", label: "Docs", href: DOCS_URL, icon: ExternalLink, external: true },
    ],
  },
];

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";

  let itemIndex = 0;

  return (
    <aside className="flex h-full w-full flex-col bg-surface rounded-xl">
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="neopop-section-title mb-1 px-3 text-[10px] uppercase tracking-widest text-text-muted">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const idx = itemIndex++;
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/dashboard/"
                    : pathname.startsWith(item.href);
                const ItemIcon = item.icon;

                if (item.external) {
                  return (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                    >
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={onNavigate}
                        className="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm tracking-wide transition text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                      >
                        <ItemIcon className="h-4 w-4 shrink-0 text-text-secondary group-hover:text-text-primary" strokeWidth={1.9} />
                        <span>{item.label}</span>
                        <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                      </a>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm tracking-wide transition ${
                        active
                          ? "border-l-2 border-l-neopop-yellow bg-neopop-yellow text-neopop-black font-bold"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                      }`}
                    >
                      <ItemIcon
                        className={`h-4 w-4 shrink-0 ${
                          active ? "text-neopop-black" : "text-text-secondary group-hover:text-text-primary"
                        }`}
                        strokeWidth={1.9}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-border p-3">
        <Link
          href="/login"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-red-500 transition hover:text-red-400 hover:bg-surface-raised"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.9} />
          Log Out
        </Link>
      </div>
    </aside>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { wallets, activeAddress, isReady } = useWallet();
  const { network, setNetwork } = useNetwork();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWallets, setShowWallets] = useState(false);
  const [algoBalance, setAlgoBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!activeAddress) {
      setAlgoBalance(null);
      setUsdcBalance(null);
      return;
    }
    import("algosdk").then(({ default: algosdk }) => {
      const algod = new algosdk.Algodv2(
        "",
        network === "mainnet"
          ? "https://mainnet-api.algonode.cloud"
          : "https://testnet-api.algonode.cloud",
        443
      );
      algod
        .accountInformation(activeAddress)
        .do()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((info: any) => {
          setAlgoBalance((Number(info.amount) / 1e6).toFixed(3));
          const assets = info.assets as Array<{ assetId: bigint | number; amount: bigint | number }> | undefined;
          const usdcId = network === "mainnet" ? 31566704 : 10458941;
          const holding = assets?.find((a) => Number(a.assetId) === usdcId);
          setUsdcBalance(holding ? (Number(holding.amount) / 1e6).toFixed(2) : "0.00");
        })
        .catch(() => {});
    });
  }, [activeAddress, network]);

  const activeWallet = wallets?.find((w) => w.isActive);

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="border-b border-border bg-surface"
      >
        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              type="button"
              className="grid h-10 w-10 place-items-center rounded-md border border-border text-text-secondary lg:hidden"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logos/logo-icon.png" alt="AlgoPay" width={20} height={20} className="invert brightness-200" />
              <span className="font-impact text-xl uppercase tracking-wider text-text-primary">ALGOPAY</span>
            </div>

            <div className="hidden items-center rounded-lg bg-surface-raised p-1 sm:flex">
              {(["testnet", "mainnet"] as Network[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNetwork(n)}
                  className={`rounded-md px-4 py-1 text-sm capitalize transition ${
                    network === n
                      ? "bg-neopop-yellow text-neopop-black font-bold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-4 text-sm text-text-secondary">
            <a href={DOCS_URL} target="_blank" rel="noreferrer" className="hidden transition hover:text-text-primary md:block">Docs</a>
            <a href={SITE_URL} target="_blank" rel="noreferrer" className="hidden transition hover:text-text-primary md:block">Site</a>

            {activeAddress ? (
              <div className="flex items-center gap-3">
                <div className="hidden flex-col items-end text-xs md:flex">
                  <span className="text-text-secondary">{algoBalance ?? "..."} ALGO</span>
                  <span className="text-neopop-yellow">{usdcBalance ?? "..."} USDC</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWallets((v) => !v)}
                  className="rounded-md border border-border bg-surface-raised px-3 py-1.5 text-xs uppercase tracking-wide text-text-primary transition hover:border-text-muted"
                >
                  {truncateAddress(activeAddress)}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!isReady}
                onClick={() => setShowWallets((v) => !v)}
                className="neopop-btn neopop-btn-primary px-4 py-2 text-sm uppercase disabled:opacity-50"
              >
                Connect Wallet
              </button>
            )}

            {showWallets && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowWallets(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-md border border-border bg-surface-raised p-3 shadow-xl">
                  {activeAddress ? (
                    <button
                      type="button"
                      onClick={() => { activeWallet?.disconnect(); setShowWallets(false); }}
                      className="w-full rounded-md border border-red-700 px-3 py-2 text-xs uppercase text-red-400 hover:bg-red-950/30"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="pb-1 text-xs uppercase tracking-wide text-text-muted">Select Wallet</p>
                      {wallets?.map((wallet) => (
                        <button
                          key={wallet.id}
                          type="button"
                          onClick={() => wallet.connect().then(() => setShowWallets(false)).catch(() => {})}
                          className="flex w-full items-center gap-3 rounded-md border border-border px-3 py-2 text-sm text-text-primary transition hover:border-text-muted hover:bg-surface-raised"
                        >
                          {wallet.metadata.icon && (
                            <img src={wallet.metadata.icon} alt={wallet.metadata.name} className="h-5 w-5 rounded" />
                          )}
                          {wallet.metadata.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Body */}
      <div className="mx-auto flex h-[calc(100vh-73px)] max-w-[1700px] min-h-0 gap-6 px-4 py-4 md:px-6">
        <div className="hidden h-full w-[225px] flex-none lg:block">
          <SidebarContent />
        </div>
        <main className="scrollbar-hide h-full min-h-0 w-full overflow-y-auto pb-10 pr-1">
          {children}
        </main>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
            <motion.div initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -280, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="fixed left-3 top-3 z-50 h-[calc(100vh-1.5rem)] w-[84vw] max-w-[300px] lg:hidden">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
