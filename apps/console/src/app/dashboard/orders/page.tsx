import Link from "next/link";

export default function OrdersPage() {
  return (
    <>
      <h1>Orders</h1>
      <div className="empty-state card">
        <div className="icon" aria-hidden>
          📦
        </div>
        <p>No orders yet</p>
        <p className="muted" style={{ maxWidth: "40ch", margin: "0 auto" }}>
          Order tracking (commerce state machine) is not implemented yet.
        </p>
        <Link href="/dashboard">Back to dashboard</Link>
      </div>
    </>
  );
}
