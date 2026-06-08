import type { PropsWithChildren } from "react";
type Props = PropsWithChildren<{
    direction?: "row" | "column";
    gap?: number;
    align?: React.CSSProperties["alignItems"];
}>;
export declare function Stack({ children, direction, gap, align }: Props): import("react").JSX.Element;
export {};
