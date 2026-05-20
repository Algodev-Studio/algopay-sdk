"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavSection {
  title: string;
  items: { label: string; href: string }[];
}

const sections: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { label: "Welcome", href: "/docs" },
      { label: "Quick Start", href: "/docs/getting-started" },
    ],
  },
  {
    title: "Features",
    items: [
      { label: "Wallets", href: "/docs/wallets" },
      { label: "Payments", href: "/docs/payments" },
      { label: "Guards", href: "/docs/guards" },
    ],
  },
  {
    title: "Wrapped APIs",
    items: [
      { label: "Overview", href: "/docs/wrapped-apis" },
      { label: "Agent Integration", href: "/docs/agent-integration" },
    ],
  },
  {
    title: "Checkout",
    items: [
      { label: "Overview", href: "/docs/checkout" },
    ],
  },
  {
    title: "Protocols",
    items: [
      { label: "x402 HTTP Payments", href: "/docs/x402" },
    ],
  },
  {
    title: "SDKs",
    items: [
      { label: "TypeScript SDK", href: "/docs/typescript-sdk" },
      { label: "API Reference", href: "/docs/api-reference" },
    ],
  },
  {
    title: "Ecosystem",
    items: [
      { label: "Control Plane", href: "/docs/control-plane" },
      { label: "Platform Matrix", href: "/docs/platform-matrix" },
    ],
  },
];

export default function DocsSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="scrollbar-hide h-full overflow-y-auto pb-10">
      {sections.map((section) => (
        <div key={section.title} className="mb-5">
          <p className="px-3 text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-text-muted">
            {section.title}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block border-l-2 px-3 py-1.5 text-sm transition ${
                      active
                        ? "border-neopop-yellow bg-neopop-yellow/5 font-semibold text-neopop-yellow"
                        : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
