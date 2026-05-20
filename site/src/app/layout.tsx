import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoPay — AI Agent Payment Infrastructure on Algorand",
  description:
    "Payment infrastructure for AI agents on Algorand. Set the rules. Bind them to an agent. Every payment justified, enforced, and audited.",
  openGraph: {
    title: "AlgoPay — AI Agent Payment Infrastructure on Algorand",
    description:
      "Payment infrastructure for AI agents on Algorand. 30+ APIs pay-per-use. No subscriptions.",
    images: ["/logos/logo-hero.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/logo-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
