import { motion, useScroll, useSpring } from 'motion/react';

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX, background: 'var(--gradient-brand)' }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] pointer-events-none"
    />
  );
}
