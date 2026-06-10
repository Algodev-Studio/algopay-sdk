import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algo Blog — Pay-per-article on Algorand",
  description:
    "A community-built blog using AlgoPay to gate premium content behind USDC micropayments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "'Inter', system-ui, sans-serif",
          backgroundColor: "#0a0a0a",
          color: "#e5e5e5",
          minHeight: "100vh",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid #1a1a1a",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 960,
            margin: "0 auto",
          }}
        >
          <a
            href="/"
            style={{
              textDecoration: "none",
              color: "#fbbf24",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            algo/blog
          </a>
          <span style={{ fontSize: 13, color: "#525252" }}>
            Powered by AlgoPay &middot; USDC on Algorand
          </span>
        </header>

        <main
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "40px 24px 80px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
