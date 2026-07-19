import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { passkeysSupported, registerPasskey, listPasskeys } from '../lib/passkeys';

// "Ahora no" se recuerda para siempre en este navegador; preguntarlo en cada
// login entrena a la gente a descartar el diálogo sin leerlo.
const DECLINED_KEY = 'openview:passkey-declined';
// Además solo se ofrece una vez por sesión del navegador, para no reaparecer
// en cada recarga de página mientras el usuario lo piensa.
const ASKED_KEY = 'openview:passkey-asked';

/**
 * Ofrece registrar el dispositivo justo después de entrar con contraseña.
 *
 * Vive por encima del router y no dentro del modal de login: al iniciar sesión
 * el router cambia de LandingPage al dashboard y desmonta el modal, así que
 * cualquier cosa que se muestre allí desaparece antes de verse.
 */
export function PasskeyPrompt() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !passkeysSupported()) return;
    if (localStorage.getItem(DECLINED_KEY) === '1') return;
    if (sessionStorage.getItem(ASKED_KEY) === '1') return;

    let cancelled = false;
    listPasskeys()
      .then((keys) => {
        // Si ya tiene una llave, no hay nada que ofrecer.
        if (!cancelled && keys.length === 0) {
          sessionStorage.setItem(ASKED_KEY, '1');
          setIsOpen(true);
        }
      })
      // Si las tablas o la función no están disponibles, mejor no molestar.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleActivate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await registerPasskey(navigator.platform || 'Este dispositivo');
      setIsOpen(false);
    } catch (err: any) {
      // Cancelar el diálogo del sistema no es un error que valga la pena mostrar.
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') setIsOpen(false);
      else setError(err.message || 'No se pudo registrar este dispositivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 md:backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B1121]/95 p-8 text-center shadow-[0_32px_80px_-20px_rgba(2,6,23,0.9)] md:backdrop-blur-xl"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[22rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
              style={{ backgroundImage: 'var(--gradient-brand)' }}
            />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/10">
                <Fingerprint className="h-7 w-7 text-blue-400" />
              </div>
              <h2 className="mb-2 font-serif text-2xl text-white">
                ¿Quieres entrar con huella o Face ID?
              </h2>
              <p className="mb-7 text-sm leading-relaxed text-slate-400">
                La próxima vez podrás acceder sin escribir tu contraseña. Tu huella nunca
                sale de este dispositivo: solo se guarda una llave que lo identifica.
              </p>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-left text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleActivate}
                disabled={isLoading}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-all hover:brightness-110 disabled:opacity-70"
                style={{ backgroundImage: 'var(--gradient-brand)' }}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Activar'}
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(DECLINED_KEY, '1');
                  setIsOpen(false);
                }}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-400 transition-colors hover:text-white"
              >
                Ahora no
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
