import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPost, getAllPosts } from "@/lib/posts";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  if (!post.premium) {
    return <ArticleView title={post.title} content={post.content} />;
  }

  const cookieStore = await cookies();
  const paid = cookieStore.get(`paid_${slug}`)?.value === "true";

  if (paid) {
    return (
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            padding: "4px 10px",
            borderRadius: 6,
            marginBottom: 24,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Payment verified
        </div>
        <ArticleView title={post.title} content={post.content} />
      </div>
    );
  }

  return <PaywallView slug={post.slug} title={post.title} excerpt={post.excerpt} price={post.price} />;
}

function ArticleView({ title, content }: { title: string; content: string }) {
  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <article>
      <a href="/" style={{ fontSize: 13, color: "#737373", textDecoration: "none" }}>
        &larr; Back to blog
      </a>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          marginTop: 16,
          marginBottom: 24,
          color: "#fafafa",
        }}
      >
        {title}
      </h1>
      <div style={{ fontSize: 15, lineHeight: 1.8, color: "#d4d4d4" }}>
        {paragraphs.map((p, i) => {
          const trimmed = p.trim();
          if (trimmed.startsWith("## ")) {
            return (
              <h2
                key={i}
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginTop: 32,
                  marginBottom: 12,
                  color: "#fafafa",
                }}
              >
                {trimmed.replace("## ", "")}
              </h2>
            );
          }
          if (trimmed.startsWith("### ")) {
            return (
              <h3
                key={i}
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  marginTop: 24,
                  marginBottom: 8,
                  color: "#fafafa",
                }}
              >
                {trimmed.replace("### ", "")}
              </h3>
            );
          }
          if (trimmed.startsWith("```")) {
            const lines = trimmed.split("\n");
            const code = lines.slice(1, -1).join("\n");
            return (
              <pre
                key={i}
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: 8,
                  padding: 16,
                  overflow: "auto",
                  fontSize: 13,
                  lineHeight: 1.6,
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                <code>{code}</code>
              </pre>
            );
          }
          if (trimmed.startsWith("**") && trimmed.includes("**:")) {
            const [label, ...rest] = trimmed.split("**:");
            return (
              <p key={i} style={{ marginBottom: 12 }}>
                <strong style={{ color: "#fafafa" }}>{label.replace(/\*\*/g, "")}</strong>
                :{rest.join("**:")}
              </p>
            );
          }
          if (trimmed.startsWith("- ")) {
            const items = trimmed.split("\n").filter((l) => l.startsWith("- "));
            return (
              <ul key={i} style={{ paddingLeft: 20, marginBottom: 12 }}>
                {items.map((item, j) => (
                  <li key={j} style={{ marginBottom: 4 }}>
                    {item.replace("- ", "")}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} style={{ marginBottom: 16 }}>
              {trimmed}
            </p>
          );
        })}
      </div>
    </article>
  );
}

function PaywallView({
  slug,
  title,
  excerpt,
  price,
}: {
  slug: string;
  title: string;
  excerpt: string;
  price: string;
}) {
  return (
    <div>
      <a href="/" style={{ fontSize: 13, color: "#737373", textDecoration: "none" }}>
        &larr; Back to blog
      </a>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          marginTop: 16,
          marginBottom: 12,
          color: "#fafafa",
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 15, color: "#a3a3a3", lineHeight: 1.6, marginBottom: 32 }}>
        {excerpt}
      </p>

      <div
        style={{
          border: "1px solid #262626",
          borderRadius: 12,
          padding: 32,
          backgroundColor: "#111111",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#fafafa",
            marginBottom: 8,
          }}
        >
          This is a premium article
        </h2>
        <p style={{ fontSize: 14, color: "#737373", marginBottom: 24 }}>
          Pay once with USDC on Algorand. No account needed.
        </p>

        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#fbbf24",
            marginBottom: 4,
          }}
        >
          {price} USDC
        </div>
        <p style={{ fontSize: 12, color: "#525252", marginBottom: 24 }}>
          One-time payment &middot; Instant access &middot; Algorand
        </p>

        <a
          href={`/checkout?slug=${slug}&amount=${price}`}
          style={{
            display: "inline-block",
            fontSize: 14,
            fontWeight: 600,
            color: "#0a0a0a",
            backgroundColor: "#fbbf24",
            padding: "12px 32px",
            borderRadius: 8,
            textDecoration: "none",
            letterSpacing: "-0.01em",
          }}
        >
          Pay to Read
        </a>

        <p style={{ fontSize: 11, color: "#404040", marginTop: 16 }}>
          Secured by AlgoPay &middot; HTTP 402 Payment Required
        </p>
      </div>
    </div>
  );
}
