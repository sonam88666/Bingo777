import React from 'react';
import { ShieldCheck, RefreshCw, Home } from 'lucide-react';

interface GlobalErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  GlobalErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): GlobalErrorBoundaryState {
    const msg = error instanceof Error ? error.message : 'Unexpected display error';
    return { hasError: true, errorMessage: msg };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('[GlobalErrorBoundary] Caught runtime error:', error, errorInfo);
  }

  private handleRecover = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-brand font-black text-lg text-slate-100">
                Crash-Guard Active
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                A temporary display glitch was intercepted. Your account session and wallet balance are 100% safe and untouched.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={this.handleRecover}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Resume Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface GameErrorBoundaryProps {
  gameName?: string;
  onResetToLobby?: () => void;
  children: React.ReactNode;
}

interface GameErrorBoundaryState {
  hasError: boolean;
}

export class GameErrorBoundary extends React.Component<
  GameErrorBoundaryProps,
  GameErrorBoundaryState
> {
  constructor(props: GameErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): GameErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error(`[GameErrorBoundary:${this.props.gameName || 'Module'}] Intercepted error:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  private handleBackToLobby = () => {
    this.setState({ hasError: false });
    if (this.props.onResetToLobby) {
      this.props.onResetToLobby();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto my-10 px-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-brand font-black text-base text-slate-100">
                {this.props.gameName ? `${this.props.gameName} Refreshed` : 'Module Refreshed'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This screen recovered from a temporary render issue. Your wallet balance and active bets are completely safe.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload View</span>
              </button>
              {this.props.onResetToLobby && (
                <button
                  type="button"
                  onClick={this.handleBackToLobby}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Lobby</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
