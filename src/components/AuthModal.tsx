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
            className="absolute inset-0 bg-black/50 md:backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-[0_32px_80px_-20px_rgba(15,23,42,0.35)] border border-[#e5e7eb]"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 rounded-full border border-[#e5e7eb] bg-white p-1.5 text-[#6b7280] transition-colors hover:bg-[#f8f9fb] hover:text-[#0a0a23]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Selector Ingresar / Registrarse */}
            <div className="relative mb-7 grid grid-cols-2 gap-1 rounded-xl border border-[#e5e7eb] bg-[#f8f9fb] p-1 text-sm font-medium">
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
                    isLogin === login ? 'text-[#0a0a23]' : 'text-[#9ca3af] hover:text-[#6b7280]'
                  }`}
                >
                  {isLogin === login && (
                    <motion.span
                      layoutId="auth-tab"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 rounded-lg bg-white border border-[#e5e7eb] shadow-sm"
                    />
                  )}
                  <span className="relative">{login ? 'Ingresar' : 'Crear cuenta'}</span>
                </button>
              ))}
            </div>

            <div className="relative mb-7 text-center">
              <h2 className="text-[28px] md:text-[32px] font-extrabold text-[#0a0a23] tracking-[-1px] mb-2">
                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </h2>
              <p className="text-[15px] text-[#6b7280]">
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
                className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-red-600 border border-red-200 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3 text-emerald-700 border border-emerald-200 text-sm"
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
                  className="group flex w-full h-[52px] items-center justify-center gap-2.5 rounded-xl border border-[#e5e7eb] bg-white text-[15px] font-semibold text-[#0a0a23] transition-all hover:bg-[#f8f9fb] hover:border-[#d1d5db] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPasskeyLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Fingerprint className="h-5 w-5 text-blue-500" />
                      Entrar con huella o Face ID
                    </>
                  )}
                </button>

                <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-[#9ca3af]">
                  <span className="h-px flex-1 bg-[#e5e7eb]" />
                  o con tu correo
                  <span className="h-px flex-1 bg-[#e5e7eb]" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div className="group">
                <label htmlFor="auth-email" className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9ca3af] transition-colors group-focus-within:text-blue-500" />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-[#e5e7eb] bg-white py-3 pl-11 pr-4 text-[#0a0a23] placeholder:text-[#9ca3af] transition-all hover:border-[#d1d5db] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9ca3af] transition-colors group-focus-within:text-blue-500" />
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className="w-full rounded-xl border border-[#e5e7eb] bg-white py-3 pl-11 pr-11 text-[#0a0a23] placeholder:text-[#9ca3af] transition-all hover:border-[#d1d5db] focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9ca3af] transition-colors hover:text-[#6b7280]"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="mt-2 text-xs text-[#9ca3af]">Mínimo 6 caracteres.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative mt-2 w-full h-[52px] overflow-hidden rounded-xl px-4 text-[15px] font-semibold text-white shadow-lg shadow-blue-900/15 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100"
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

            <div className="mt-6 text-center text-sm text-[#6b7280]">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-medium text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
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
