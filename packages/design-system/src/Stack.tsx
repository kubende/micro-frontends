import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  direction?: "row" | "column";
  gap?: number;
  align?: React.CSSProperties["alignItems"];
}>;

export function Stack({ children, direction = "column", gap = 12, align }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        alignItems: align,
      }}
    >
      {children}
    </div>
  );
}
