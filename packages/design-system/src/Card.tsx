import type { PropsWithChildren, CSSProperties } from "react";

type Props = PropsWithChildren<{ style?: CSSProperties }>;

export function Card({ children, style }: Props) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e3e6ef",
        borderRadius: 8,
        padding: 16,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
