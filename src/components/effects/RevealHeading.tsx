import { motion } from 'motion/react';
import { type ReactNode } from 'react';

interface RevealHeadingProps {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'div';
}

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 } as const,
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as const,
};

/**
 * Título con entrada suave al aparecer en pantalla.
 *
 * Antes animaba `clipPath: inset(...)` sobre un `motion[as]` resuelto de forma
 * dinámica, y la animación no llegaba a ejecutarse nunca: TODOS los títulos de la
 * landing se quedaban en `opacity: 0` y recortados, dejando huecos en blanco donde
 * debía ir el texto. El resto de la página usa `whileInView` con opacidad +
 * desplazamiento y funciona sin problemas, así que aquí usamos exactamente ese
 * patrón, con el elemento de motion resuelto de forma estática.
 */
export function RevealHeading({ children, className, as = 'h2' }: RevealHeadingProps) {
  if (as === 'div') {
    return (
      <motion.div className={className} {...reveal}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.h2 className={className} {...reveal}>
      {children}
    </motion.h2>
  );
}
