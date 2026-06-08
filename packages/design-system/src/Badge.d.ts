import type { PropsWithChildren } from "react";
type Tone = "neutral" | "info" | "warn" | "ok";
export declare function Badge({ children, tone }: PropsWithChildren<{
    tone?: Tone;
}>): import("react").JSX.Element;
export {};
