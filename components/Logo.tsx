import Link from "next/link";
import { useId } from "react";

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  href?: string | null;
  admin?: boolean;
};

function Symbol({ size }: { size: number }) {
  const uid = useId().replace(/:/g, "");
  const id = `iri-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7ad9" />
          <stop offset="30%" stopColor="#7dd8ff" />
          <stop offset="60%" stopColor="#9dffb0" />
          <stop offset="100%" stopColor="#ffd97a" />
        </linearGradient>
      </defs>
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="12"
      />
      <circle
        cx="60"
        cy="60"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle
        cx="60"
        cy="60"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

export function Logo({
  size = 36,
  showWordmark = true,
  href = "/",
  admin = false,
}: LogoProps) {
  const content = (
    <>
      <Symbol size={size} />
      {showWordmark && (
        <span
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
          }}
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: size >= 36 ? 21 : 16,
              letterSpacing: "-0.02em",
            }}
          >
            JEWEL CASE
          </span>
          {admin && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.14em",
                color: "var(--accent)",
              }}
            >
              ADMIN
            </span>
          )}
        </span>
      )}
    </>
  );

  const style: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "inherit",
    textDecoration: "none",
  };

  if (href === null) {
    return <div style={style}>{content}</div>;
  }

  return (
    <Link href={href} style={style}>
      {content}
    </Link>
  );
}

export function LogoMark({ size = 24 }: { size?: number }) {
  return <Symbol size={size} />;
}
