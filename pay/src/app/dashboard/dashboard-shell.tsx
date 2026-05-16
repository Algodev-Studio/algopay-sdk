"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@txnlab/use-wallet-react";
import { useNetwork } from "@/components/providers/NetworkProvider";
import {
  Home,
  HandCoins,
  Bot,
  Store,
  Fuel,
  FlaskConical,
  Settings,
  ShieldCheck,
  ShoppingCart,
  LogOut,
  Menu,
  type LucideIcon,
} from "lucide-react";
import type { Network } from "@/lib/types";

const sidebarItems: { key: string; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/dashboard" },
  { key: "payments", label: "Payments", href: "/dashboard/payments" },
  { key: "agents", label: "Agents", href: "/dashboard/agents" },
  { key: "merchants", label: "Merchants", href: "/dashboard/merchants" },
  { key: "gas", label: "Gas Pools", href: "/dashboard/gas" },
  { key: "checkout", label: "Checkout", href: "/dashboard/checkout" },
  { key: "playground", label: "Playground", href: "/dashboard/playground" },
  { key: "approvals", label: "Approvals", href: "/dashboard/approvals" },
  { key: "settings", label: "Settings", href: "/dashboard/settings" },
];

const iconByKey: Record<string, LucideIcon> = {
  home: Home,
  payments: HandCoins,
  agents: Bot,
  merchants: Store,
  gas: Fuel,
  checkout: ShoppingCart,
  playground: FlaskConical,
  approvals: ShieldCheck,
  settings: Settings,
};

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="flex h-full w-full flex-col bg-[#151515] p-0 rounded-xl">
      <div className="space-y-1 p-2">
        {sidebarItems.map((item, index) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname.startsWith(item.href);
          const ItemIcon = iconByKey[item.key] ?? Home;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-sm uppercase tracking-wide transition ${
                  active
                    ? "border-amber-100/30 bg-btn-gradient text-slate-900"
                    : "border-transparent text-slate-300 hover:border-white/20 hover:text-white"
                }`}
              >
                <ItemIcon
                  className={`h-5 w-5 shrink-0 ${
                    active ? "text-slate-900" : "text-slate-400 group-hover:text-white"
                  }`}
                  strokeWidth={1.9}
                />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-slate-800 p-2">
        <Link
          href="/login"
          className="flex w-full items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-sm font-medium uppercase tracking-wide text-red-500 transition hover:border-red-900/30 hover:text-red-400"
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
    <div className="h-screen overflow-hidden bg-[#151515]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="border-b border-slate-800/80"
      >
        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              type="button"
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-700 text-slate-200 lg:hidden"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl text-[#bebf85]">✦</span>
              <span className="font-impact text-xl uppercase tracking-wider text-slate-100">ALGOPAY</span>
            </div>

            <div className="hidden items-center rounded-lg border border-slate-800 bg-[#212121] p-1 sm:flex">
              {(["testnet", "mainnet"] as Network[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNetwork(n)}
                  className={`rounded-md px-4 py-1 text-sm capitalize transition ${
                    network === n
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-4 text-sm text-slate-300">
            <a href="https://algodev-studio.github.io/algopay-sdk/" target="_blank" rel="noreferrer" className="hidden transition hover:text-white md:block">Docs</a>

            {activeAddress ? (
              <div className="flex items-center gap-3">
                <div className="hidden flex-col items-end text-xs md:flex">
                  <span className="text-slate-300">{algoBalance ?? "..."} ALGO</span>
                  <span className="text-[#f2ad2d]">{usdcBalance ?? "..."} USDC</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWallets((v) => !v)}
                  className="rounded-md border border-slate-600 bg-[#212121] px-3 py-1.5 text-xs uppercase tracking-wide text-slate-200 transition hover:border-slate-400"
                >
                  {truncateAddress(activeAddress)}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!isReady}
                onClick={() => setShowWallets((v) => !v)}
                className="rounded-md border border-amber-100/20 bg-btn-gradient px-4 py-2 text-sm uppercase text-slate-900 disabled:opacity-50"
              >
                Connect Wallet
              </button>
            )}

            {showWallets && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowWallets(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-md border border-slate-700 bg-[#1d1f22] p-3 shadow-xl">
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
                      <p className="pb-1 text-xs uppercase tracking-wide text-slate-400">Select Wallet</p>
                      {wallets?.map((wallet) => (
                        <button
                          key={wallet.id}
                          type="button"
                          onClick={() => wallet.connect().then(() => setShowWallets(false)).catch(() => {})}
                          className="flex w-full items-center gap-3 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
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
