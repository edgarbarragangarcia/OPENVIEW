import { useMemo, useState } from 'react';
import { Reorder, motion } from 'motion/react';
import { CheckCircle, X, GripVertical } from 'lucide-react';
import type { OrderQuestion } from './types';
import { shuffle } from './types';

/**
 * Pregunta de ordenar: se arrastran los pasos hasta dejarlos en secuencia.
 *
 * Usa Reorder de motion, que ya resuelve el arrastre con dedo y las
 * animaciones de reacomodo.
 */
export function OrderQuestionView({
  question,
  locked,
  onResolve,
}: {
  question: OrderQuestion;
  locked: boolean;
  onResolve: (correct: boolean) => void;
}) {
  // Se baraja hasta que quede distinto del orden correcto: empezar ya resuelto
  // haría que la pregunta se pudiera aprobar sin tocar nada.
  const initial = useMemo(() => {
    let attempt = shuffle(question.items);
    for (let i = 0; i < 5 && attempt.every((v, idx) => v === question.items[idx]); i++) {
      attempt = shuffle(question.items);
    }
    return attempt;
  }, [question]);

  const [items, setItems] = useState<string[]>(initial);

  const check = () => {
    const correct = items.every((value, i) => value === question.items[i]);
    onResolve(correct);
  };

  return (
    <div className="space-y-3">
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((item, i) => {
          const inPlace = locked && item === question.items[i];
          const outOfPlace = locked && item !== question.items[i];

          return (
            <Reorder.Item
              key={item}
              value={item}
              drag={!locked}
              whileDrag={{ scale: 1.03, zIndex: 40 }}
              animate={outOfPlace ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
              className={`flex cursor-grab items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold shadow-sm ${
                inPlace
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : outOfPlace
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">
                {i + 1}
              </span>
              <span className="flex-1">{item}</span>
              {inPlace && <CheckCircle size={16} className="shrink-0 text-emerald-500" />}
              {outOfPlace && <X size={16} className="shrink-0 text-rose-500" />}
              {!locked && <GripVertical size={14} className="shrink-0 text-slate-300" />}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {!locked && (
        <motion.button
          onClick={check}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-violet-500"
        >
          Confirmar orden
        </motion.button>
      )}

      {locked && (
        <p className="text-xs text-slate-400">
          Orden correcto: {question.items.join(' → ')}
        </p>
      )}
    </div>
  );
}
