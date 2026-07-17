import { useState, FormEvent } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function ForceChangePassword() {
  const { user, clearMustChangePassword, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La nueva clave debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las claves no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      if (user) {
        await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id);
      }
      clearMustChangePassword();
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la clave.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
          <KeyRound size={22} className="text-cyan-600" />
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-1">Actualiza tu clave</h1>
        <p className="text-sm text-slate-500 mb-6">
          Por seguridad, debes reemplazar la clave temporal por una nueva de al menos 6 caracteres.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nueva clave</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirmar clave</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              minLength={6}
              required
              placeholder="Repite la clave"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-cyan-500/20"
          >
            {loading ? 'Guardando...' : 'Guardar y continuar'}
          </button>

          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <LogOut size={13} /> Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
