import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>AlgoPay</h1>
      <p style={{ color: "var(--muted)", maxWidth: "52ch" }}>
        Locus-style control plane for Algorand: wallets, policies, API keys, and server-assisted
        signing (vault).{" "}
        <a href="https://github.com/Algodev-Studio/algopay-sdk">Python SDK</a> +{" "}
        <code>@algodev-studio/algopay</code> for agents.
      </p>
      <p>
        <Link href="/login">Sign in</Link> · <Link href="/register">Register</Link>
      </p>
    </main>
  );
}
