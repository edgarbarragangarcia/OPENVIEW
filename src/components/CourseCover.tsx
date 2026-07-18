import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface Props {
  src?: string | null;
  alt: string;
  /** Clases para la etiqueta <img> */
  imgClassName?: string;
  /** Clases (fondo/color) para el placeholder cuando no hay imagen o falla */
  placeholderClassName?: string;
  /** Clases para el icono del placeholder */
  iconClassName?: string;
  iconSize?: number;
  /** Carga anticipada (para portadas "above the fold" como el hero de un curso) */
  eager?: boolean;
}

/**
 * Portada de curso con carga diferida y respaldo ante error.
 *
 * - `loading="lazy"` + `decoding="async"`: no bloquea el render inicial ni la
 *   descarga de las demás cards; clave para móviles con red lenta.
 * - `onError`: si la URL externa falla o expira (p. ej. miniaturas de terceros),
 *   muestra un placeholder en vez de dejar un recuadro blanco roto.
 */
export function CourseCover({
  src,
  alt,
  imgClassName = '',
  placeholderClassName = '',
  iconClassName = 'text-white/20',
  iconSize = 36,
  eager = false,
}: Props) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => { setFailed(!src); }, [src]);

  if (failed) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${placeholderClassName}`}>
        <BookOpen size={iconSize} className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src!}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={imgClassName}
    />
  );
}
