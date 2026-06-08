import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const styles: Record<Variant, React.CSSProperties> = {
  primary: { background: "#1f4eea", color: "white", border: "none" },
  secondary: { background: "white", color: "#1f4eea", border: "1px solid #1f4eea" },
  ghost: { background: "transparent", color: "#1f4eea", border: "none" },
};

export function Button({ variant = "primary", style, ...rest }: Props) {
  return (
    <button
      {...rest}
      style={{
        padding: "8px 14px",
        borderRadius: 6,
        font: "500 14px/1 system-ui",
        cursor: "pointer",
        ...styles[variant],
        ...style,
      }}
    />
  );
}
