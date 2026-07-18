import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

/**
 * Como useState, pero sincroniza el valor con localStorage para que sobreviva a
 * recargas de página. La app no usa router (navegación por estado), así que esto
 * permite que al actualizar la página el usuario permanezca en la misma vista.
 *
 * Solo debe usarse para estado serializable (vistas, IDs). El `key` debería ir
 * scopeado por usuario para no filtrar la navegación entre cuentas del mismo
 * navegador.
 */
export function usePersistentState<T>(
  key: string,
  initial: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* almacenamiento lleno o no disponible: ignoramos */
    }
  }, [key, state]);

  return [state, setState];
}
