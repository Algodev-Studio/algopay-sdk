"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CONSOLE_URL } from "@/lib/urls";

const navLinks = [
  { label: "Endpoints", href: "/docs/wrapped-apis" },
  { label: "Pricing", href: "/docs/wrapped-apis#pricing" },
  { label: "Docs", href: "/docs" },
  { label: "App", href: CONSOLE_URL, external: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logos/logo-icon.png" alt="AlgoPay" width={24} height={24} />
          <span className="font-impact text-xl uppercase tracking-wider text-text-primary">
            ALGOPAY
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-text-secondary transition hover:text-neopop-yellow"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-text-secondary transition hover:text-neopop-yellow"
              >
                {link.label}
              </Link>
            )
          )}
          <Link href="/docs/getting-started" className="neopop-btn neopop-btn-primary px-5 py-2 text-xs">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-text-primary md:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-6 pb-6 pt-4 md:hidden">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="block py-3 text-sm text-text-secondary transition hover:text-neopop-yellow"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 text-sm text-text-secondary transition hover:text-neopop-yellow"
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            href="/docs/getting-started"
            onClick={() => setOpen(false)}
            className="mt-2 block neopop-btn neopop-btn-primary py-2 text-center text-xs"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
