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
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}
