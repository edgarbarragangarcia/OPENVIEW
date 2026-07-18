import { useState, useEffect } from 'react';

/**
 * Devuelve `true` en dispositivos móviles (pantalla pequeña o puntero táctil).
 *
 * Se usa para desactivar efectos pensados para PC (parallax por scroll,
 * animaciones en canvas, etc.) que en móvil solo consumen CPU/GPU y batería.
 */
export function useIsMobile(query = '(max-width: 767px), (pointer: coarse)') {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setIsMobile(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return isMobile;
}
