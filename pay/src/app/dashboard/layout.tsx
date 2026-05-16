import { DashboardShell } from "./dashboard-shell";
import NetworkProvider from "@/components/providers/NetworkProvider";
import AlgoWalletProvider from "@/components/providers/WalletProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <AlgoWalletProvider>
        <DashboardShell>{children}</DashboardShell>
      </AlgoWalletProvider>
    </NetworkProvider>
  );
}
