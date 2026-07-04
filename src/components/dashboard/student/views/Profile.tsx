import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { User as UserIcon, Save } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    if (error) alert('Error actualizando perfil');
    else alert('Perfil actualizado');
    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Mi Perfil</h1>
        <p className="text-slate-500">Gestiona tu información personal</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-white shadow-md">
             {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <UserIcon size={48} className="text-slate-300" />
              )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{user?.user_metadata?.full_name || 'Sin nombre'}</h3>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
            <input 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico (No modificable)</label>
            <input 
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
