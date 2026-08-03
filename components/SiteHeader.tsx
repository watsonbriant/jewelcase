"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Reviews", match: (p: string) => p === "/" || p.startsWith("/reviews") },
  { href: "/browse", label: "Browse", match: (p: string) => p.startsWith("/browse") },
  { href: "/artists", label: "Artists", match: (p: string) => p.startsWith("/artists") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="#8a8a92" strokeWidth="2" />
      <line
        x1="15.5"
        y1="15.5"
        x2="21"
        y2="21"
        stroke="#8a8a92"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const browseMode = pathname.startsWith("/browse");

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const q = e.currentTarget.value.trim();
      if (q) router.push(`/browse?q=${encodeURIComponent(q)}`);
    }
  };

  const onSearchClick = () => {
    if (browseMode) {
      const el = document.querySelector<HTMLInputElement>(
        'input[placeholder^="Search"]',
      );
      el?.focus();
      return;
    }
    setSearchOpen((v) => !v);
  };

  return (
    <>
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px 24px",
          padding: "16px var(--gutter)",
          borderBottom: "1px solid var(--line)",
          position: "sticky",
          top: 0,
          background: "var(--bg)",
          zIndex: 10,
        }}
      >
        <Logo />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "clamp(14px, 2.5vw, 30px)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--sub)",
          }}
        >
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ color: active ? "var(--ink)" : "var(--sub)" }}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={onSearchClick}
            title="Search"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <SearchIcon />
          </button>
        </div>
      </nav>
      {searchOpen && !browseMode && (
        <div
          style={{
            padding: "16px var(--gutter)",
            borderBottom: "1px solid var(--line)",
            background: "var(--panel)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <span
              style={{
                position: "absolute",
                left: 18,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <SearchIcon />
            </span>
            <input
              ref={inputRef}
              autoFocus
              onKeyDown={onSearchKey}
              placeholder="Search artist, album, year…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "var(--bg)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "12px 16px 12px 50px",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                color: "var(--ink)",
                outline: "none",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--meta)",
              whiteSpace: "nowrap",
            }}
          >
            ENTER ↵
          </span>
        </div>
      )}
    </>
  );
}
