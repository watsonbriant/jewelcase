import { LogoMark } from "./Logo";

export function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: "auto",
        borderTop: "1px solid var(--line)",
        padding: "32px var(--gutter)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: 1440,
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LogoMark size={24} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--meta)",
          }}
        >
          JEWEL CASE{" "}
          <span
            style={{
              fontFamily: "var(--font-sans)",
              verticalAlign: "baseline",
            }}
          >
            ©
          </span>{" "}
          2026 · REVIEWS SINCE THE CD ERA
        </span>
      </div>
    </footer>
  );
}
