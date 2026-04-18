"use client";

import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-100 p-8 text-center">
            <p className="text-3xl mb-4">⚠️</p>
            <h1 className="font-display text-xl font-black text-[#0B1D35] mb-2">Algo salió mal</h1>
            <p className="text-sm text-zinc-500 mb-6">
              Ocurrió un error inesperado. Por favor recarga la página o contacta a soporte.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white bg-[#0B1D35] hover:bg-[#162d52] transition-colors"
            >
              Recargar página
            </button>
            <p className="text-xs text-zinc-300 mt-4">reservas@organnical.com</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
