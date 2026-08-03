"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <div className="jc-page">
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px var(--gutter)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <Logo admin href="/" />
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--sub)",
          }}
        >
          VIEW SITE →
        </Link>
      </nav>

      <main
        style={{
          maxWidth: 420,
          width: "100%",
          margin: "0 auto",
          padding: "clamp(40px, 8vw, 72px) var(--gutter)",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: "-0.03em",
          }}
        >
          Sign in
        </h1>
        <p
          style={{
            margin: "0 0 28px",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--meta)",
          }}
        >
          OWNER ONLY
        </p>
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.14em",
                color: "var(--meta)",
              }}
            >
              EMAIL
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={fieldStyle}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.14em",
                color: "var(--meta)",
              }}
            >
              PASSWORD
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={fieldStyle}
            />
          </label>
          {error && (
            <p style={{ margin: 0, color: "var(--danger)", fontSize: 14 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: 13,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: "var(--accent)",
              color: "#0c0c0f",
              fontWeight: 800,
              fontSize: 15,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  padding: "11px 14px",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  color: "var(--ink)",
  outline: "none",
};
