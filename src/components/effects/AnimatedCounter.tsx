import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  const numericMatch = value.match(/[\d,.]+/);
  const numeric = numericMatch ? parseFloat(numericMatch[0].replace(/,/g, '')) : 0;
  const prefix = numericMatch ? value.slice(0, numericMatch.index) : '';
  const suffix = numericMatch ? value.slice((numericMatch.index ?? 0) + numericMatch[0].length) : value;

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 20 });

  useEffect(() => {
    if (isInView) motionValue.set(numeric);
  }, [isInView, numeric, motionValue]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (ref.current) {
        const rounded = Math.round(latest).toLocaleString('es-CO');
        ref.current.textContent = `${prefix}${rounded}${suffix}`;
      }
    });
  }, [spring, prefix, suffix]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}0{suffix}
    </motion.span>
  );
}
