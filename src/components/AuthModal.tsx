import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowRight, Fingerprint } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { passkeysSupported, signInWithPasskey } from '../lib/passkeys';


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  const handlePasskey = async () => {
    setIsPasskeyLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await signInWithPasskey();
      onClose();
    } catch (err: any) {
      // Si el usuario cancela el diálogo del sistema no es un error que valga
      // la pena mostrar: simplemente cambió de opinión.
      if (err?.name !== 'NotAllowedError' && err?.name !== 'AbortError') {
        setError(err.message || 'No se pudo entrar con este dispositivo');
      }
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta.');
        // Don't close immediately so user sees the message
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
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
            onClick={onClose}
            className="absolute inset-0 bg-black/70 md:backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0B1121]/95 p-8 shadow-[0_32px_80px_-20px_rgba(2,6,23,0.9)] md:backdrop-blur-xl border border-white/10"
          >
            {/* Halo de marca detrás del encabezado */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[22rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
              style={{ backgroundImage: 'var(--gradient-brand)' }}
            />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

                        {/* Selector Ingresar / Registrarse */}
            <div className="relative mb-7 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-sm font-medium">
              {[true, false].map((login) => (
                <button
                  key={String(login)}
                  type="button"
                  onClick={() => {
                    setIsLogin(login);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`relative rounded-lg py-2 transition-colors ${
                    isLogin === login ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isLogin === login && (
                    <motion.span
                      layoutId="auth-tab"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 rounded-lg bg-white/10 border border-white/10"
                    />
                  )}
                  <span className="relative">{login ? 'Ingresar' : 'Crear cuenta'}</span>
                </button>
              ))}
            </div>

            <div className="relative mb-7 text-center">
              <h2 className="font-serif text-3xl text-white mb-2">
                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isLogin
                  ? 'Ingresa tus credenciales para acceder'
                  : 'Únete a Openview y comienza a aprender'
                }
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-500/10 p-3 text-red-300 border border-red-500/25 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-start gap-2.5 rounded-xl bg-emerald-500/10 p-3 text-emerald-300 border border-emerald-500/25 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{successMsg}</p>
              </motion.div>
            )}

            {isLogin && passkeysSupported() && (
              <>
                <button
                  type="button"
                  onClick={handlePasskey}
                  disabled={isPasskeyLoading}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/25 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPasskeyLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Fingerprint className="h-5 w-5 text-blue-400" />
                      Entrar con huella o Face ID
                    </>
                  )}
                </button>

                <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500">
                  <span className="h-px flex-1 bg-white/10" />
                  o con tu correo
                  <span className="h-px flex-1 bg-white/10" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div className="group">
                <label htmlFor="auth-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 transition-colors group-focus-within:text-blue-400" />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-white placeholder:text-slate-600 transition-all hover:border-white/20 focus:border-blue-500/60 focus:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 transition-colors group-focus-within:text-blue-400" />
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-11 text-white placeholder:text-slate-600 transition-all hover:border-white/20 focus:border-blue-500/60 focus:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="mt-2 text-xs text-slate-500">Mínimo 6 caracteres.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative mt-2 w-full overflow-hidden rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100"
                style={{ backgroundImage: 'var(--gradient-brand)' }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Ingresar' : 'Registrarse'}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-medium text-blue-400 underline-offset-4 transition-colors hover:text-blue-300 hover:underline"
              >
                {isLogin ? 'Regístrate' : 'Inicia Sesión'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
