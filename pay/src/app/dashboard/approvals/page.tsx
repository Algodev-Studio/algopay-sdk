import Link from "next/link";

export default function ApprovalsPage() {
  return (
    <>
      <h1>Pending approvals</h1>
      <div className="empty-state card">
        <div className="icon" aria-hidden>
          ✓
        </div>
        <p>No pending approvals</p>
        <p className="muted" style={{ maxWidth: "42ch", margin: "0 auto" }}>
          Wire this to payment intents / <code>ConfirmGuard</code> for human-in-the-loop approvals.
        </p>
        <Link href="/dashboard">Back to dashboard</Link>
      </div>
    </>
  );
}
