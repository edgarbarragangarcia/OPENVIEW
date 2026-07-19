import { useState, useEffect } from 'react';
import { Fingerprint, Trash2, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { passkeysSupported, registerPasskey, listPasskeys, deletePasskey } from '../../../lib/passkeys';

type Passkey = {
  id: number;
  device_label: string | null;
  created_at: string;
  last_used_at: string | null;
};

/**
 * Gestión de passkeys: registrar este dispositivo y quitar los que ya no se usan.
 * El alta solo se puede hacer desde una sesión activa, por eso vive en el perfil
 * y no en el modal de login.
 */
export function PasskeysCard() {
  const [keys, setKeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const refresh = () =>
    listPasskeys()
      .then((data) => setKeys(data as Passkey[]))
      .catch(() => toast.error('No se pudieron cargar tus dispositivos'))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      // Una etiqueta legible ayuda a distinguir llaves cuando hay varias.
      const label = navigator.platform || 'Este dispositivo';
      await registerPasskey(label);
      toast.success('Dispositivo registrado ✓');
      refresh();
    } catch (err: any) {
      if (err?.name !== 'NotAllowedError' && err?.name !== 'AbortError') {
        toast.error(err.message || 'No se pudo registrar el dispositivo');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePasskey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success('Dispositivo eliminado');
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  if (!passkeysSupported()) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-1 flex items-center gap-2">
        <Fingerprint className="h-5 w-5 text-cyan-400" />
        <h3 className="font-bold text-white">Acceso con huella o Face ID</h3>
      </div>
      <p className="mb-5 text-sm text-slate-400">
        Registra este dispositivo para entrar sin escribir tu contraseña. Tu huella nunca
        sale del dispositivo.
      </p>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {key.device_label || 'Dispositivo'}
                </p>
                <p className="text-xs text-slate-400">
                  {key.last_used_at
                    ? `Usado el ${new Date(key.last_used_at).toLocaleDateString('es-ES')}`
                    : 'Sin usar todavía'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(key.id)}
                aria-label="Eliminar dispositivo"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {keys.length === 0 && (
            <p className="text-sm text-slate-400">Aún no tienes dispositivos registrados.</p>
          )}
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={isRegistering}
        className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-shadow hover:shadow-cyan-500/40 disabled:opacity-60"
      >
        {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Registrar este dispositivo
      </button>
    </div>
  );
}
