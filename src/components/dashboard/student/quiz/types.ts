/**
 * Tipos de pregunta de las evaluaciones.
 *
 * Las preguntas viven como JSON dentro de lessons.content, así que el formato
 * antiguo -- sin campo `type` -- tiene que seguir siendo válido: se interpreta
 * como 'multiple'. Por eso `type` es opcional en MultipleQuestion.
 */

export type MultipleQuestion = {
  type?: 'multiple';
  question: string;
  options: string[];
  correct: number;
};

/** Relacionar: se arrastra cada término a su definición. */
export type MatchQuestion = {
  type: 'match';
  question: string;
  pairs: { left: string; right: string }[];
};

/** Ordenar: se arrastran los pasos hasta dejarlos en secuencia. */
export type OrderQuestion = {
  type: 'order';
  question: string;
  /** En el orden correcto; se barajan al mostrarse. */
  items: string[];
};

export type QuizQuestion = MultipleQuestion | MatchQuestion | OrderQuestion;

export const isMatch = (q: QuizQuestion): q is MatchQuestion => q.type === 'match';
export const isOrder = (q: QuizQuestion): q is OrderQuestion => q.type === 'order';
export const isMultiple = (q: QuizQuestion): q is MultipleQuestion =>
  q.type === undefined || q.type === 'multiple';

/** Baraja sin mutar. Se usa para que el orden inicial no delate la respuesta. */
export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
