import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, Search, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VerifyResult {
  code: string;
  full_name: string;
  issued_at: string;
  lesson_title: string;
}

function readCodeFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('codigo') || '';
}

export default function VerifyCertificate() {
  const [code, setCode] = useState(readCodeFromUrl());
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const runVerification = async (value: string) => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase.rpc('verify_certificate', { p_code: trimmed });
      if (error) throw error;
      setResult((data && data[0]) || null);
    } catch (err) {
      console.error('Error verificando certificado:', err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) runVerification(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#060a16] text-white flex flex-col items-center justify-center px-4 py-16 overflow-hidden relative">
      {/* Fondo: video del oso muy sutil + resplandores dorado/azul ambientales */}
      <video
        autoPlay loop muted playsInline preload="auto"
        src="/hero-bear.mp4"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
      />
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <div className="hero-blob hero-blob-a" style={{ background: 'radial-gradient(circle, rgba(184,134,11,0.35) 0%, transparent 70%)' }} />
        <div className="hero-blob hero-blob-b" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.30) 0%, transparent 70%)' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#060a16]/40 via-[#060a16]/85 to-[#060a16]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="text-center mb-9">
          <img src="/logo.png" alt="OpenView" className="h-14 mx-auto mb-4 drop-shadow-[0_0_18px_rgba(184,134,11,0.25)]" />
          <p className="text-[10px] tracking-[0.3em] font-bold text-amber-400/80 uppercase mb-2">OpenView Academy</p>
          <h1 className="font-serif text-3xl sm:text-4xl italic text-white">Verificar certificado</h1>
          <div className="w-14 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto mt-4 mb-4" />
          <p className="text-sm text-white/50 max-w-sm mx-auto">
            Escribe el folio impreso en el certificado para confirmar que fue emitido por OpenView Academy.
          </p>
        </div>

        <form
          onSubmit={e => { e.preventDefault(); runVerification(code); }}
          className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        >
          <Search size={18} className="text-amber-400/60 ml-2.5 shrink-0" />
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Ej: OV-2026-0001"
            className="flex-1 bg-transparent px-2 py-3 text-sm tracking-wide outline-none placeholder-white/25 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 text-[#1a1204] text-sm font-black tracking-wide hover:from-amber-300 hover:to-amber-500 transition-all disabled:opacity-40 disabled:hover:from-amber-400 disabled:hover:to-amber-600 shadow-[0_4px_16px_rgba(184,134,11,0.35)]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verificar'}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {searched && !loading && (
            <motion.div
              key={result ? 'valid' : 'invalid'}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-6"
            >
              {result ? (
                <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-amber-500/25 p-7 shadow-[0_8px_40px_rgba(184,134,11,0.08)] overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl" />
                  <div className="relative flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <ShieldCheck size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-emerald-400 font-black text-base leading-tight">Certificado auténtico</p>
                      <p className="text-[11px] text-white/40">Emitido y verificado por OpenView Academy</p>
                    </div>
                  </div>
                  <dl className="relative space-y-3.5 text-sm">
                    {[
                      ['Folio', result.code, true],
                      ['Participante', result.full_name],
                      ['Programa', result.lesson_title],
                      ['Emitido', new Date(result.issued_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })],
                    ].map(([label, value, mono], i) => (
                      <div key={label as string}>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-white/40 text-xs font-bold uppercase tracking-widest">{label}</dt>
                          <dd className={`font-bold text-right ${mono ? 'font-mono text-amber-300 tracking-wider' : 'text-white'}`}>{value}</dd>
                        </div>
                        {i < 3 && <div className="mt-3.5 h-px bg-white/[0.06]" />}
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <div className="rounded-2xl bg-red-500/[0.06] backdrop-blur-xl border border-red-500/20 p-6 flex items-center gap-3.5 text-red-300">
                  <XCircle size={22} className="shrink-0 text-red-400" />
                  <div>
                    <p className="font-black text-sm">Folio no encontrado</p>
                    <p className="text-xs text-red-300/60 mt-0.5">Revisa que el folio esté escrito tal como aparece en el certificado.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
