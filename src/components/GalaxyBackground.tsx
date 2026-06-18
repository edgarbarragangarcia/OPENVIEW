import { useEffect, useRef } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';

// ─────────────────────────────────────────────────────────────────────────────
// Dense particle canvas — white dots on pure black
// ─────────────────────────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;

    type P = { x: number; y: number; r: number; vx: number; vy: number; o: number; phase: number; pulse: number };
    let particles: P[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // More particles for a denser starfield
      const count = Math.floor((canvas.width * canvas.height) / 6000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        o: Math.random() * 0.5 + 0.05,
        phase: Math.random() * Math.PI * 2,
        pulse: Math.random() * 0.008 + 0.003,
      }));
    };

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        const brightness = p.o + Math.sin(t * p.pulse * 60 + p.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 220, 255, ${Math.max(0, brightness)})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.y > canvas.height + 5) p.y = -5;
      }
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', init);
    init();
    draw();
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-reactive aurora — BIG and visible on every chapter
// ─────────────────────────────────────────────────────────────────────────────
function ScrollOrb() {
  const { scrollYProgress } = useScroll();

  // Move from left to right to center etc.
  const x = useTransform(
    scrollYProgress,
    [0, 0.14, 0.28, 0.42, 0.57, 0.71, 0.85, 1],
    ['50%', '20%', '75%', '50%', '30%', '65%', '40%', '55%']
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.15, 0.30, 0.45, 0.60, 0.75, 0.90, 1],
    ['45%', '55%', '40%', '60%', '45%', '55%', '40%', '50%']
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
    [1.2, 1.6, 1.0, 1.8, 1.2, 1.7, 1.0, 1.4]
  );

  // Color intensities per chapter
  const blueOp = useTransform(scrollYProgress, [0, 0.12, 0.25, 0.38, 0.50, 0.62, 0.75, 0.88, 1], [0.7, 0.5, 0.2, 0.6, 0.2, 0.6, 0.2, 0.4, 0.5]);
  const greenOp = useTransform(scrollYProgress, [0, 0.12, 0.25, 0.38, 0.50, 0.62, 0.75, 0.88, 1], [0.1, 0.3, 0.6, 0.1, 0.1, 0.5, 0.2, 0.3, 0.1]);
  const purpleOp = useTransform(scrollYProgress, [0, 0.12, 0.25, 0.38, 0.50, 0.62, 0.75, 0.88, 1], [0.1, 0.2, 0.2, 0.3, 0.7, 0.1, 0.6, 0.3, 0.4]);
  const amberOp = useTransform(scrollYProgress, [0, 0.12, 0.25, 0.38, 0.50, 0.62, 0.75, 0.88, 1], [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3, 0.0]);

  const orbBase = 'w-[900px] h-[900px] md:w-[1200px] md:h-[1200px] rounded-full';

  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{ x, y, scale, zIndex: 0, translateX: '-50%', translateY: '-50%' }}
    >
      {/* Blue */}
      <motion.div className={orbBase}
        style={{
          opacity: blueOp,
          background: 'radial-gradient(circle at center, rgba(13,89,242,0.85) 0%, rgba(13,89,242,0.2) 45%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{ scale: [1, 1.08, 0.95, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Emerald */}
      <motion.div className={`absolute inset-0 ${orbBase}`}
        style={{
          opacity: greenOp,
          background: 'radial-gradient(circle at center, rgba(16,185,129,0.85) 0%, rgba(16,185,129,0.2) 45%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{ scale: [1.05, 0.93, 1.1, 0.98, 1.05] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Purple/Indigo */}
      <motion.div className={`absolute inset-0 ${orbBase}`}
        style={{
          opacity: purpleOp,
          background: 'radial-gradient(circle at center, rgba(99,102,241,0.85) 0%, rgba(99,102,241,0.2) 45%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{ scale: [0.92, 1.1, 0.98, 1.08, 0.92] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Amber */}
      <motion.div className={`absolute inset-0 ${orbBase}`}
        style={{
          opacity: amberOp,
          background: 'radial-gradient(circle at center, rgba(245,158,11,0.85) 0%, rgba(245,158,11,0.2) 45%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{ scale: [1, 1.06, 0.97, 1.04, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Film grain overlay — subtle cinematic texture
// ─────────────────────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '160px 160px',
        opacity: 0.028,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function GalaxyBackground() {
  return (
    <>
      {/* Pure black base */}
      <div className="fixed inset-0 bg-[#000000]" style={{ zIndex: -1 }} />
      <ParticleField />
      <ScrollOrb />
      <GrainOverlay />
    </>
  );
}
