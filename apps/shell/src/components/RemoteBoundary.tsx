import { Component, type PropsWithChildren, type ReactNode } from "react";
import { Card } from "@workspace/design-system";

type Props = PropsWithChildren<{ moduleLabel: string }>;
type State = { error: Error | null };

/**
 * Hard product invariant from the architecture doc: a single remote can never
 * take down the shell or its siblings. Every remote mounts inside one of these.
 */
export class RemoteBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error) {
    console.error("[RemoteBoundary] caught error in remote", error);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <Card style={{ maxWidth: 560 }}>
          <h2 style={{ margin: "0 0 8px" }}>Couldn’t load {this.props.moduleLabel}</h2>
          <p style={{ margin: "0 0 4px", color: "#64748b" }}>
            Other modules are unaffected. Please try again, or contact support if the
            problem persists.
          </p>
          <p style={{ margin: 0, color: "#94a3b8", font: "12px/1.4 monospace" }}>
            {this.state.error.message}
          </p>
        </Card>
      );
    }
    return this.props.children;
  }
}
