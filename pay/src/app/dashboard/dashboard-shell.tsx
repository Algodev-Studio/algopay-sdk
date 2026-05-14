"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

function itemClass(pathname: string, prefix: string): string {
  const active = pathname === prefix || pathname.startsWith(prefix + "/");
  return "nav-item" + (active ? " active" : "");
}

function overviewClass(pathname: string): string {
  const active = pathname === "/dashboard" || pathname === "/dashboard/";
  return "nav-item" + (active ? " active" : "");
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="auth-logo-mark" aria-hidden>
            ✦
          </span>{" "}
          <span className="word">ALGOPAY</span>
        </div>
        <div className="nav-section-label">Main</div>
        <Link href="/dashboard" className={overviewClass(pathname)}>
          Overview
        </Link>
        <div className="nav-section-label">Activity</div>
        <Link href="/dashboard/transactions" className={itemClass(pathname, "/dashboard/transactions")}>
          Transactions
        </Link>
        <Link href="/dashboard/orders" className={itemClass(pathname, "/dashboard/orders")}>
          Orders
        </Link>
        <Link href="/dashboard/approvals" className={itemClass(pathname, "/dashboard/approvals")}>
          Approvals
        </Link>
        <div className="nav-section-label">Config</div>
        <Link href="/dashboard/apis" className={itemClass(pathname, "/dashboard/apis")}>
          APIs
        </Link>
        <div className="nav-section-label">Wallet</div>
        <Link href="/dashboard/wallets" className={itemClass(pathname, "/dashboard/wallets")}>
          Wallets
        </Link>
        <Link href="/dashboard/policies" className={itemClass(pathname, "/dashboard/policies")}>
          Policies
        </Link>
        <div className="sidebar-docs">
          <a href="https://algodev-studio.github.io/algopay-sdk/" target="_blank" rel="noreferrer">
            Docs
          </a>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span className="muted" style={{ marginRight: "auto" }}>
            Algorand agent payments
          </span>
          <LogoutButton />
        </header>
        <div className="main-inner">{children}</div>
      </div>
    </div>
  );
}
