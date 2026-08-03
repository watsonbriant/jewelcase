"use client";

import { useEffect, useId, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type DropdownProps = {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  /** Override chip/field trigger text (defaults to selected option label) */
  triggerText?: string;
  /** Chip-style trigger (browse) vs input-style (admin) */
  variant?: "chip" | "field";
};

export function Dropdown({
  label,
  value,
  options,
  onChange,
  triggerText,
  variant = "chip",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && !t.closest(`[data-dd="${id}"]`)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open, id]);

  const selected = options.find((o) => o.value === value);
  const selectedLabel = triggerText ?? selected?.label ?? value;
  const triggerLabel =
    variant === "chip" && label
      ? `${label}: ${selectedLabel} ▾`
      : selectedLabel;

  return (
    <span data-dd={id} style={{ position: "relative", display: "inline-block", width: variant === "field" ? "100%" : undefined }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={
          variant === "chip"
            ? {
                padding: "7px 16px",
                borderRadius: 99,
                cursor: "pointer",
                border: "1px solid var(--line)",
                background: "transparent",
                color: "var(--sub)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
              }
            : {
                width: "100%",
                textAlign: "left",
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "11px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--ink)",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }
        }
      >
        {variant === "field" ? (
          <>
            <span>{triggerLabel}</span>
            <span style={{ color: "var(--meta)" }}>▾</span>
          </>
        ) : (
          triggerLabel
        )}
      </button>
      {open && (
        <span
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: variant === "field" ? 0 : undefined,
            minWidth: variant === "chip" ? 190 : undefined,
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            zIndex: 30,
            boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
          }}
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                className="jc-dd-option"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={{
                  textAlign: "left",
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: active ? "var(--chip)" : "transparent",
                  color: active ? "var(--ink)" : "var(--sub)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              >
                {o.label}
              </button>
            );
          })}
        </span>
      )}
    </span>
  );
}
