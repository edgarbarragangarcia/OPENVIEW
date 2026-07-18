import { motion } from 'motion/react';
import { type ReactNode } from 'react';

interface RevealHeadingProps {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'div';
}

export function RevealHeading({ children, className, as = 'h2' }: RevealHeadingProps) {
  const Comp = motion[as];
  return (
    <Comp
      initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
      // El título arranca oculto y solo se revela al entrar en pantalla, así que
      // el umbral debe ser fácil de cumplir: con `amount: 0.6` (60% visible) y
      // `once: true`, un título que nunca alcanzaba ese porcentaje —p. ej. en una
      // columna estrecha en escritorio— se quedaba invisible de forma permanente.
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}
