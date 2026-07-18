import { Component, type ReactNode } from 'react';

const RELOAD_FLAG = 'ov:chunk-reloaded';

/**
 * Detecta fallos al cargar un chunk (import dinámico). Ocurre típicamente tras un
 * despliegue nuevo: el navegador tiene el HTML viejo en caché y pide un archivo JS
 * con hash que ya no existe, dejando la pantalla en blanco.
 */
function isChunkLoadError(error: unknown): boolean {
  const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return /loading chunk|failed to fetch dynamically imported module|importing a module script failed|dynamically imported module|module script failed/i.test(msg);
}

interface Props { children: ReactNode }
interface State { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidMount() {
    // Si la app arrancó bien, limpiamos la marca para que una futura caída de
    // chunk pueda volver a recargar (sin permitir bucles inmediatos).
    setTimeout(() => {
      try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* ignorar */ }
    }, 5000);
  }

  componentDidCatch(error: unknown) {
    if (isChunkLoadError(error)) {
      let alreadyReloaded = false;
      try { alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === '1'; } catch { /* ignorar */ }
      if (!alreadyReloaded) {
        try { sessionStorage.setItem(RELOAD_FLAG, '1'); } catch { /* ignorar */ }
        window.location.reload();
        return;
      }
    }
    console.error('Error no controlado en la aplicación:', error);
  }

  private handleReload = () => {
    try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* ignorar */ }
    window.location.reload();
  };

  render() {
    if (this.state.failed) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#05070f] text-white px-6 text-center">
          <p className="text-base font-bold">No se pudo cargar la aplicación.</p>
          <p className="text-sm text-slate-400 max-w-xs">
            Puede que haya una versión nueva disponible. Recarga para continuar.
          </p>
          <button
            onClick={this.handleReload}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors shadow-lg shadow-cyan-500/20"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
