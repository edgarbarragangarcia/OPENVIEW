import { motion, useScroll, useTransform } from 'motion/react';

export function GalaxyBackground() {
  const { scrollYProgress } = useScroll();

  // Interpolate colors based on scroll - slightly more saturated for visibility but still pastel
  const color1 = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ['rgba(13, 89, 242, 0.15)', 'rgba(139, 92, 246, 0.15)', 'rgba(16, 185, 129, 0.15)', 'rgba(236, 72, 153, 0.15)']
  );

  const color2 = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ['rgba(139, 92, 246, 0.15)', 'rgba(16, 185, 129, 0.15)', 'rgba(236, 72, 153, 0.15)', 'rgba(13, 89, 242, 0.15)']
  );

  const color3 = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ['rgba(16, 185, 129, 0.15)', 'rgba(236, 72, 153, 0.15)', 'rgba(13, 89, 242, 0.15)', 'rgba(139, 92, 246, 0.15)']
  );

  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-white overflow-hidden pointer-events-none">
      {/* Main white background */}
      <div className="absolute inset-0 bg-white" />

      {/* Animated Pastel Blobs - Pushed to the edges */}
      <motion.div
        style={{ backgroundColor: color1 }}
        animate={{
          x: [-50, 50, -50],
          y: [-30, 30, -30],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[20%] -left-[25%] h-[70%] w-[70%] rounded-full blur-[160px] opacity-80"
      />

      <motion.div
        style={{ backgroundColor: color2 }}
        animate={{
          x: [50, -50, 50],
          y: [30, -30, 30],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[20%] -right-[30%] h-[80%] w-[80%] rounded-full blur-[180px] opacity-80"
      />

      <motion.div
        style={{ backgroundColor: color3 }}
        animate={{
          x: [-30, 30, -30],
          y: [50, -50, 50],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[25%] -left-[10%] h-[60%] w-[60%] rounded-full blur-[140px] opacity-80"
      />

      {/* Subtle Grain Overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
