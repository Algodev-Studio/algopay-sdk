import Link from "next/link";
import Image from "next/image";
import { CONSOLE_URL } from "@/lib/urls";

const resourceLinks = [
  { label: "App", href: CONSOLE_URL },
  { label: "Endpoints", href: "/docs/wrapped-apis" },
  { label: "Docs", href: "/docs" },
  { label: "GitHub", href: "https://github.com/Algodev-Studio/algopay-sdk" },
];

const docLinks = [
  { label: "Getting Started", href: "/docs/getting-started" },
  { label: "Wallets", href: "/docs/wallets" },
  { label: "Payments", href: "/docs/payments" },
  { label: "Wrapped APIs", href: "/docs/wrapped-apis" },
  { label: "Checkout", href: "/docs/checkout" },
  { label: "TypeScript SDK", href: "/docs/typescript-sdk" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logos/logo-icon.png"
              alt="AlgoPay"
              width={20}
              height={20}
            />
            <span className="font-impact text-lg uppercase tracking-wider text-text-primary">
              ALGOPAY
            </span>
          </Link>
          <p className="mt-3 text-xs text-text-muted">
            Payment infrastructure for AI agents on Algorand.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">
            Resources
          </p>
          <ul className="mt-4 space-y-2">
            {resourceLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-text-secondary transition hover:text-neopop-yellow"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">
            Documentation
          </p>
          <ul className="mt-4 space-y-2">
            {docLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-text-secondary transition hover:text-neopop-yellow"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">
            Legal
          </p>
          <ul className="mt-4 space-y-2">
            <li>
              <span className="text-sm text-text-secondary">MIT License</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-border pt-6">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} AlgoPay contributors. Built on
          Algorand.
        </p>
      </div>
    </footer>
  );
}
