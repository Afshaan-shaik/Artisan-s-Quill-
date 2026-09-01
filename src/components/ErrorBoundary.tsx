import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Atelier Sanctuary Error Boundary Caught]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleSoftRecover = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#050608] text-neutral-200 flex items-center justify-center p-6 font-sans select-none">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#0a0d14] border border-[#c9a875]/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#c9a875] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8 text-[#c9a875]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif-display text-white tracking-wide">
                Sanctuary Canvas Preserved
              </h2>
              <p className="text-xs text-neutral-400 font-mono-code leading-relaxed">
                An unexpected interface anomaly was gracefully isolated. Your creations, collections, and gallery state remain safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-black/60 border border-white/10 text-[11px] font-mono-code text-neutral-400 text-left overflow-x-auto max-h-28">
                {this.state.error.message || 'Unknown runtime interruption'}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleSoftRecover}
                className="px-4 py-2 rounded-xl text-xs font-mono-code uppercase tracking-wider text-[#c9a875] hover:text-white bg-[#c9a875]/10 hover:bg-[#c9a875]/20 border border-[#c9a875]/30 transition-all cursor-pointer"
              >
                Restore Session
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold font-mono-code uppercase tracking-wider bg-[#c9a875] hover:bg-[#dfbd87] text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(201,168,117,0.4)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Atelier</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
