import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled error in admin application", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          className="flex min-h-screen items-center justify-center bg-background p-6"
          dir="rtl"
          role="alert"
        >
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-xl font-bold text-foreground">
              خطایی در پنل مدیریت رخ داد
            </h1>
            <p className="text-sm text-muted-foreground">
              برای تلاش دوباره، صفحه را بارگذاری کنید.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              بارگذاری دوباره
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
