"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug") ?? "";
  const amount = searchParams.get("amount") ?? "0.10";

  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txId, setTxId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePay = useCallback(async () => {
    setStatus("pending");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, amount }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setTxId(data.txId ?? null);

        document.cookie = `paid_${slug}=true; path=/; max-age=${60 * 60 * 24 * 30}`;

        setTimeout(() => {
          router.push(`/blog/${slug}`);
        }, 2000);
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? "Payment failed");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [slug, amount, router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <div
        style={{
          border: "1px solid #262626",
          borderRadius: 16,
          padding: 40,
          backgroundColor: "#111111",
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#fafafa",
            marginBottom: 4,
            letterSpacing: "-0.01em",
          }}
        >
          Checkout
        </h1>
        <p style={{ fontSize: 13, color: "#737373", marginBottom: 24 }}>
          Unlock{" "}
          <span style={{ color: "#a3a3a3" }}>
            {slug.replace(/-/g, " ")}
          </span>
        </p>

        <div
          style={{
            backgroundColor: "#0a0a0a",
            borderRadius: 10,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#737373" }}>Article</span>
            <span style={{ fontSize: 13, color: "#d4d4d4" }}>
              {slug.replace(/-/g, " ")}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#737373" }}>Network</span>
            <span style={{ fontSize: 13, color: "#d4d4d4" }}>Algorand</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#737373" }}>Currency</span>
            <span style={{ fontSize: 13, color: "#d4d4d4" }}>USDC</span>
          </div>
          <div
            style={{
              borderTop: "1px solid #1a1a1a",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "#a3a3a3" }}>
              Total
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fbbf24" }}>
              {amount} USDC
            </span>
          </div>
        </div>

        {status === "idle" && (
          <button
            onClick={handlePay}
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: 14,
              fontWeight: 600,
              color: "#0a0a0a",
              backgroundColor: "#fbbf24",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              letterSpacing: "-0.01em",
            }}
          >
            Pay with AlgoPay
          </button>
        )}

        {status === "pending" && (
          <div style={{ padding: "14px 24px" }}>
            <div
              style={{
                width: 20,
                height: 20,
                border: "2px solid #262626",
                borderTopColor: "#fbbf24",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <p style={{ fontSize: 13, color: "#737373" }}>
              Processing payment on Algorand...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {status === "success" && (
          <div
            style={{
              padding: "14px 24px",
              backgroundColor: "rgba(34, 197, 94, 0.08)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: "0 auto" }}
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#22c55e", marginBottom: 4 }}>
              Payment successful!
            </p>
            {txId && (
              <p style={{ fontSize: 11, color: "#525252", wordBreak: "break-all" }}>
                tx: {txId}
              </p>
            )}
            <p style={{ fontSize: 12, color: "#737373", marginTop: 8 }}>
              Redirecting to article...
            </p>
          </div>
        )}

        {status === "error" && (
          <div>
            <div
              style={{
                padding: "14px 24px",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 13, color: "#ef4444" }}>
                {errorMsg ?? "Payment failed"}
              </p>
            </div>
            <button
              onClick={handlePay}
              style={{
                width: "100%",
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 600,
                color: "#0a0a0a",
                backgroundColor: "#fbbf24",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}

        <p style={{ fontSize: 11, color: "#404040", marginTop: 20 }}>
          Secured by AlgoPay on Algorand &middot; USDC payments
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: 40, color: "#737373" }}>
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
