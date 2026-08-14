import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Search, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#05070f] text-white flex flex-col items-center justify-center px-4 py-16 overflow-hidden relative">
      <video
        autoPlay loop muted playsInline preload="auto"
        src="/hero-bear.mp4"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070f]/60 via-[#05070f]/80 to-[#05070f]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="OpenView" className="h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-black">Verificar certificado</h1>
          <p className="text-sm text-white/60 mt-1">Escribe el folio impreso en el certificado para confirmar que es válido.</p>
        </div>

        <form
          onSubmit={e => { e.preventDefault(); runVerification(code); }}
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2"
        >
          <Search size={18} className="text-white/40 ml-2 shrink-0" />
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Ej: OV-2026-0001"
            className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none placeholder-white/30"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-900 text-sm font-black hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verificar'}
          </button>
        </form>

        {searched && !loading && (
          <div className="mt-6">
            {result ? (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5">
                <div className="flex items-center gap-2 text-emerald-400 font-black mb-3">
                  <CheckCircle2 size={20} />
                  Certificado válido
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Folio</dt>
                    <dd className="font-bold">{result.code}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Participante</dt>
                    <dd className="font-bold text-right">{result.full_name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Programa</dt>
                    <dd className="font-bold text-right">{result.lesson_title}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Emitido</dt>
                    <dd className="font-bold">
                      {new Date(result.issued_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-5 flex items-center gap-3 text-red-400 font-bold">
                <XCircle size={20} className="shrink-0" />
                No encontramos un certificado con ese folio.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
