import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoPay Console",
  description: "Hosted control plane for AlgoPay — Algorand agent payments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
