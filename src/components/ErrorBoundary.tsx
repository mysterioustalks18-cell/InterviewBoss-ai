import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Database Error: ${parsed.error}`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6 text-white font-sans">
          <div className="glass-card p-12 max-w-lg w-full text-center border-red-500/20">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-red-500/10 rounded-full">
                <AlertTriangle className="text-red-500 w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 tracking-tight">Something went wrong</h1>
            <p className="text-white/60 mb-8 leading-relaxed">
              {errorMessage}
            </p>

            {isFirestoreError && (
              <div className="mb-8 p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Security Notice</p>
                <p className="text-xs text-white/40 leading-relaxed">
                  This error might be due to missing permissions or an expired session. Please try logging in again if the issue persists.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-white/5 text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/10 transition-all active:scale-95 border border-white/10"
              >
                <RefreshCw size={18} />
                Retry
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Home size={18} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
