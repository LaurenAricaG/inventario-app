"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorFallback, type ErrorWithDigest } from "./ErrorFallback";

type Props = {
  children: ReactNode;
  title?: string;
  variant?: "full" | "embedded" | "compact";
};

type State = {
  error: ErrorWithDigest | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Capturado por Boundary");
      console.error(error);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      return (
        <ErrorFallback
          error={error}
          reset={this.reset}
          variant={this.props.variant ?? "full"}
          title={this.props.title}
        />
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
