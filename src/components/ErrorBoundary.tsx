import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error({ level: "error", message: "React error boundary caught", error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-4 text-red-500">
          An unexpected error occurred. Please refresh the page or contact support if the problem persists.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
