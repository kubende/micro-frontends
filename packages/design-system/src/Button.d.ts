import type { ButtonHTMLAttributes } from "react";
type Variant = "primary" | "secondary" | "ghost";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
};
export declare function Button({ variant, style, ...rest }: Props): import("react").JSX.Element;
export {};
