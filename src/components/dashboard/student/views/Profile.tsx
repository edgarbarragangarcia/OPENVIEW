import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Save, Mail, User as UserIcon, Calendar, Shield, BookOpen, Award, Sparkles } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { getMyEnrollments } from '../../../../lib/enrollments';
import toast from 'react-hot-toast';

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    getMyEnrollments().then((data: any[]) => setEnrollmentCount(data.length)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (error) toast.error('Error actualizando perfil');
    else toast.success('Perfil actualizado ✓');
    setLoading(false);
  };

  const initials = (fullName || user?.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const stats = [
    { icon: BookOpen, label: 'Cursos inscritos', value: enrollmentCount, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { icon: Award, label: 'Nivel', value: 'Estudiante', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { icon: Shield, label: 'Estado', value: 'Activo', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="min-h-full p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-600 via-cyan-500 to-indigo-600 p-8 sm:p-10 shadow-xl shadow-cyan-500/20"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 50%), radial-gradient(circle at 10% 80%, white 0%, transparent 50%)' }} />
          <div className="absolute top-4 right-4 opacity-20">
            <Sparkles size={80} className="text-white" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-2xl overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-white">{initials}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white shadow-md" title="Activo" />
            </div>

            {/* Info */}
            <div className="text-center sm:text-left">
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">Mi Perfil</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {fullName || 'Sin nombre'}
              </h1>
              <p className="text-white/80 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={13} />
                {user?.email}
              </p>
              <p className="text-white/60 text-xs mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar size={11} />
                Miembro desde {memberSince}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 350, damping: 25 }}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border ${stat.bg} ${stat.border} shadow-sm text-center card-glow card-glow-cyan`}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-lg font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.2 }}
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <UserIcon size={16} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Información Personal</h2>
              <p className="text-xs text-slate-400">Actualiza tus datos de perfil</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre Completo</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
              />
            </div>

            {/* Email (disabled) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Correo Electrónico
                <span className="ml-2 text-[10px] normal-case font-normal bg-white/10 text-slate-400 px-2 py-0.5 rounded-md">No modificable</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <motion.button
                onClick={handleSave}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 text-white px-7 py-3 rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
