import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-mark">✦</div>
        <div className="auth-logo-word">ALGOPAY</div>
      </div>
      <div className="auth-card">
        <h1>Welcome to AlgoPay</h1>
        <p className="auth-sub">Let&apos;s get you set up.</p>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          This console uses a <strong>server vault</strong> (encrypted mnemonics) instead of showing
          a one-time private key on screen. Create wallets after you sign in.
        </p>
        <Link href="/register" className="btn-primary" style={{ display: "block", textAlign: "center" }}>
          Create account
        </Link>
        <p className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: "0.5rem" }}>
          <Link href="/dashboard/wallets">Skip to wallets</Link> (requires login)
        </p>
      </div>
    </div>
  );
}
