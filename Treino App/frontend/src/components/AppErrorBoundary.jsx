import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Erro de renderização:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-ink text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-surface border border-red-500/30 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-red-400">Ocorreu um erro</h1>
          <p className="text-muted mt-3">
            Esta página encontrou um erro inesperado. Recarregue e tente novamente.
          </p>
          {this.state.error?.message && (
            <pre className="mt-4 p-3 bg-black/30 rounded-lg text-xs whitespace-pre-wrap overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-5 bg-accent text-ink font-semibold px-5 py-3 rounded-lg"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
