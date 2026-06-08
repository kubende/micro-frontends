import type { PropsWithChildren } from "react";

type Tone = "neutral" | "info" | "warn" | "ok";

const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: "#eef1f6", fg: "#475569" },
  info: { bg: "#e0e9ff", fg: "#1f4eea" },
  warn: { bg: "#fef3c7", fg: "#a16207" },
  ok: { bg: "#dcfce7", fg: "#166534" },
};

export function Badge({ children, tone = "neutral" }: PropsWithChildren<{ tone?: Tone }>) {
  const { bg, fg } = tones[tone];
  return (
    <span
      style={{
        background: bg,
        color: fg,
        padding: "2px 8px",
        borderRadius: 999,
        font: "500 12px/1.6 system-ui",
      }}
    >
      {children}
    </span>
  );
}
