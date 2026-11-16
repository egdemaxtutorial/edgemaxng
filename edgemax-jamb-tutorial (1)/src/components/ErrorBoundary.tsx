import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('EdgeMax UI ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100">
          <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm text-center space-y-4">
            <h1 className="font-display text-xl font-bold text-slate-950 dark:text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              EdgeMax ran into a display error. Reload the page to continue.
            </p>
            {this.state.errorMessage && (
              <p className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs text-rose-800 dark:text-rose-200 break-words">
                {this.state.errorMessage}
              </p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
            >
              Reload EdgeMax Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
