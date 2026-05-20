import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoPay Console",
  description: "Hosted control plane for AlgoPay — Algorand agent payments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logos/logo-icon.png" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
