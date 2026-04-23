import Link from "next/link";
import { LogoutButton } from "./logout-button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <strong>AlgoPay</strong>
        <Link href="/dashboard">Overview</Link>
        <Link href="/dashboard/wallets">Wallets</Link>
        <Link href="/dashboard/policies">Policies</Link>
        <Link href="/dashboard/api-keys">API keys</Link>
        <Link href="/dashboard/activity">Activity</Link>
        <span style={{ flex: 1 }} />
        <LogoutButton />
      </nav>
      {children}
    </>
  );
}
