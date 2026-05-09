import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", err, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-background">
        <div className="max-w-md text-center space-y-4">
          <div className="size-16 rounded-full bg-destructive/15 grid place-items-center mx-auto">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">Kutilmagan xato</h1>
          <p className="text-sm text-muted-foreground">{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
          >
            <RefreshCw className="size-4" /> Qayta yuklash
          </button>
        </div>
      </div>
    );
  }
}
