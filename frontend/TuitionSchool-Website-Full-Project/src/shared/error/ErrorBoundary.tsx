import * as React from "react";

import { Button } from "@/shared/design-system/components";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches rendering errors that escape page/section-level handling and
 * shows a clear, on-brand fallback — never a blank screen or an
 * unhandled crash (§18 "Error Handling Strategy").
 *
 * This is the outermost safety net, mounted once at the app-shell layer
 * (§5). Section- and page-level data errors should be handled closer to
 * their source via TanStack Query's error states; this boundary exists
 * for genuine render-time exceptions.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("Unhandled application error:", error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
    window.location.assign("/");
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="max-w-md text-muted-foreground">
            We ran into an unexpected problem. Please try returning to the
            homepage.
          </p>
          <Button onClick={this.handleReset}>Back to homepage</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
