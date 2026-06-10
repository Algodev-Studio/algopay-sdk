import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div>
      <div style={{ marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: 8,
            color: "#fafafa",
          }}
        >
          The Algo Blog
        </h1>
        <p style={{ fontSize: 16, color: "#737373", lineHeight: 1.6 }}>
          Thoughts on AI agents, Algorand, and the future of programmable
          payments. Some posts are free. Premium posts cost 0.10 USDC — paid
          instantly on Algorand.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {posts.map((post) => (
          <article
            key={post.slug}
            style={{
              border: "1px solid #1a1a1a",
              borderRadius: 12,
              padding: 24,
              backgroundColor: "#111111",
              transition: "border-color 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              {post.premium ? (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "3px 8px",
                    borderRadius: 4,
                    backgroundColor: "rgba(251, 191, 36, 0.12)",
                    color: "#fbbf24",
                  }}
                >
                  Premium
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "3px 8px",
                    borderRadius: 4,
                    backgroundColor: "rgba(34, 197, 94, 0.12)",
                    color: "#22c55e",
                  }}
                >
                  Free
                </span>
              )}
            </div>

            <a
              href={`/blog/${post.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#fafafa",
                  letterSpacing: "-0.01em",
                }}
              >
                {post.title}
              </h2>
            </a>

            <p
              style={{
                fontSize: 14,
                color: "#a3a3a3",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              {post.excerpt}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {post.premium ? (
                <a
                  href={`/blog/${post.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#0a0a0a",
                    backgroundColor: "#fbbf24",
                    padding: "8px 16px",
                    borderRadius: 8,
                    textDecoration: "none",
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
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Pay {post.price} USDC to read
                </a>
              ) : (
                <a
                  href={`/blog/${post.slug}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#fbbf24",
                    textDecoration: "none",
                  }}
                >
                  Read article &rarr;
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
