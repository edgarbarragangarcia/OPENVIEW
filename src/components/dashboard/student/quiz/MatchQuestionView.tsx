import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, X, GripVertical } from 'lucide-react';
import type { MatchQuestion } from './types';
import { shuffle } from './types';

/**
 * Pregunta de relacionar: cada término se arrastra hasta su definición.
 *
 * El arrastre usa el `drag` de motion en vez de la API nativa de HTML5 porque
 * esa no funciona con el dedo, y buena parte de los estudiantes entran desde
 * el celular. Al soltar se hace hit-test contra los rectángulos de las zonas.
 */
export function MatchQuestionView({
  question,
  locked,
  onResolve,
}: {
  question: MatchQuestion;
  locked: boolean;
  /** Se llama al completar todas las parejas, con el resultado. */
  onResolve: (correct: boolean) => void;
}) {
  // Las definiciones quedan fijas; los términos se barajan.
  const shuffledTerms = useMemo(() => shuffle(question.pairs.map((p) => p.left)), [question]);

  // slot -> término colocado (por índice de pair)
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const zoneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const remaining = shuffledTerms.filter((t) => !Object.values(placed).includes(t));

  const handleDragEnd = (term: string, point: { x: number; y: number }) => {
    if (locked) return;

    const hitIndex = zoneRefs.current.findIndex((el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom;
    });
    if (hitIndex === -1) return;

    const next = { ...placed };
    // Un término solo puede estar en un sitio: si ya estaba puesto, se mueve.
    for (const [slot, value] of Object.entries(next)) {
      if (value === term) delete next[Number(slot)];
    }
    next[hitIndex] = term;
    setPlaced(next);

    if (Object.keys(next).length === question.pairs.length) {
      const allCorrect = question.pairs.every((pair, i) => next[i] === pair.left);
      onResolve(allCorrect);
    }
  };

  return (
    <div className="space-y-4">
      {/* Términos por colocar */}
      <div className="flex flex-wrap gap-2 min-h-[3rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-2.5">
        {remaining.length === 0 ? (
          <span className="px-2 py-1 text-xs text-slate-400">Todo colocado</span>
        ) : (
          remaining.map((term) => (
            <motion.div
              key={term}
              drag={!locked}
              dragSnapToOrigin
              dragElastic={0.15}
              whileDrag={{ scale: 1.06, zIndex: 50, cursor: 'grabbing' }}
              onDragEnd={(_, info) => handleDragEnd(term, info.point)}
              className="flex cursor-grab items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <GripVertical size={14} className="text-slate-300" />
              {term}
            </motion.div>
          ))
        )}
      </div>

      {/* Definiciones con su zona de destino */}
      <div className="space-y-2.5">
        {question.pairs.map((pair, i) => {
          const value = placed[i];
          const isRight = locked && value === pair.left;
          const isWrong = locked && value !== undefined && value !== pair.left;

          return (
            <div key={i} className="flex items-stretch gap-2.5">
              <div
                ref={(el) => {
                  zoneRefs.current[i] = el;
                }}
                className={`flex w-2/5 shrink-0 items-center justify-center rounded-xl border-2 border-dashed px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isRight
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : isWrong
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : value
                        ? 'border-violet-300 bg-violet-50 text-slate-700'
                        : 'border-slate-200 bg-white text-slate-300'
                }`}
              >
                <motion.span
                  key={value ?? 'empty'}
                  initial={value ? { scale: 0.85, opacity: 0 } : false}
                  // El error se sacude para que el fallo se sienta, no solo se lea.
                  animate={
                    isWrong
                      ? { scale: 1, opacity: 1, x: [0, -5, 5, -3, 3, 0] }
                      : { scale: 1, opacity: 1 }
                  }
                  className="flex items-center gap-1.5 text-center"
                >
                  {value ?? 'Arrastra aquí'}
                  {isRight && <CheckCircle size={14} className="shrink-0 text-emerald-500" />}
                  {isWrong && <X size={14} className="shrink-0 text-rose-500" />}
                </motion.span>
              </div>

              <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                {pair.right}
              </div>
            </div>
          );
        })}
      </div>

      {locked && (
        <p className="text-xs text-slate-400">
          La respuesta correcta era: {question.pairs.map((p) => `${p.left} → ${p.right}`).join(' · ')}
        </p>
      )}
    </div>
  );
}
