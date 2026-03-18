import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private isFirestoreError(error: Error | null): boolean {
    if (!error) return false;
    try {
      const parsed = JSON.parse(error.message);
      return parsed && typeof parsed === 'object' && 'operationType' in parsed;
    } catch (e) {
      return false;
    }
  }

  public render() {
    if (this.state.hasError) {
      const isFirestore = this.isFirestoreError(this.state.error);
      let errorMessage = "Something went wrong. Please try again later.";
      let details = "";

      if (isFirestore && this.state.error) {
        try {
          const parsed = JSON.parse(this.state.error.message);
          errorMessage = `Database Error: ${parsed.operationType} failed on ${parsed.path || 'unknown path'}`;
          details = parsed.error;
        } catch (e) {
          // Fallback
        }
      }

      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Application Error</h2>
            <p className="text-gray-400 mb-6">{errorMessage}</p>
            {details && (
              <div className="bg-black/50 rounded-lg p-4 mb-6 text-left overflow-x-auto">
                <code className="text-xs text-red-400 font-mono">{details}</code>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
