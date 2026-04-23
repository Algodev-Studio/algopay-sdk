import Link from "next/link";

export default function HomePage() {
  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-mark">✦</div>
        <div className="auth-logo-word">ALGOPAY</div>
      </div>
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <h1>Agent payments on Algorand</h1>
        <p className="auth-sub">
          AlgoPay console: wallets, policies, transactions, APIs — USDC &amp; x402.
        </p>
        <Link href="/onboarding" className="btn-primary" style={{ display: "block", textAlign: "center" }}>
          Get started
        </Link>
        <p className="auth-footer">
          <Link href="/login">Sign in</Link> · <Link href="/register">Register</Link>
        </p>
        <p className="auth-footer muted" style={{ fontSize: "0.8rem" }}>
          Open source:{" "}
          <a href="https://github.com/Algodev-Studio/algopay-sdk" target="_blank" rel="noreferrer">
            algopay-sdk
          </a>
        </p>
      </div>
    </div>
  );
}
