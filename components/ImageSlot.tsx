type ImageSlotProps = {
  shape?: "rounded" | "circle";
  radius?: number;
  label?: string;
  src?: string | null;
  style?: React.CSSProperties;
};

export function ImageSlot({
  shape = "rounded",
  radius = 8,
  label,
  src,
  style,
}: ImageSlotProps) {
  const radiusValue = shape === "circle" ? "50%" : radius;
  const base: React.CSSProperties = {
    width: "100%",
    height: "100%",
    aspectRatio: style?.width || style?.height ? undefined : "1",
    borderRadius: radiusValue,
    border: "1px solid var(--line)",
    ...style,
  };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label ?? ""}
        style={{
          ...base,
          display: "block",
          objectFit: "cover",
          background: "var(--panel)",
        }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      style={{
        ...base,
        background:
          "repeating-linear-gradient(45deg, #1a1a20 0 10px, #1f1f27 10px 20px)",
      }}
    />
  );
}
