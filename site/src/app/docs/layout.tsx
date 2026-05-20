import Link from "next/link";
import Image from "next/image";
import DocsSidebar from "@/components/docs/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logos/logo-icon.png"
                alt="AlgoPay"
                width={20}
                height={20}
              />
              <span className="font-impact text-lg uppercase tracking-wider text-text-primary">
                AlgoPay Docs
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-text-secondary transition hover:text-neopop-yellow"
            >
              Home
            </Link>
            <Link
              href="https://github.com/Algodev-Studio/algopay-sdk"
              target="_blank"
              className="text-sm text-text-secondary transition hover:text-neopop-yellow"
            >
              GitHub
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] pt-14">
        <aside className="hidden w-64 shrink-0 border-r border-border px-2 pt-8 lg:block">
          <DocsSidebar />
        </aside>
        <main className="min-w-0 flex-1 px-8 py-8 lg:px-12">{children}</main>
      </div>
    </div>
  );
}
