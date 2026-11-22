import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    let display = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && parsed.error && parsed.operationType) {
        display = `Database ${parsed.operationType} failed on ${parsed.path || 'collection'}: ${parsed.error}`;
      }
    } catch {
      // Plain error message
    }
    return { hasError: true, message: display };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E2E7DF] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-amber-800 mb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-semibold">Something went wrong</h2>
            </div>
            <p className="text-sm text-[#4A5B50] leading-relaxed mb-5 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#15613E] text-white text-sm font-medium hover:bg-[#0E4A2F] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reload JanYukti
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
