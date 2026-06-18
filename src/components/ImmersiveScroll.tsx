import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { useRef, useEffect } from 'react';

// ----- Word Reveal -----
// Each word gets its own component so hooks are properly at component top-level
function RevealWord({
  word,
  progress,
  start,
  end,
}: {
  word: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const color = useTransform(progress, [start, end], ['#2a2a3a', '#ffffff']);
  const textShadow = useTransform(
    progress,
    [start, end],
    ['0px 0px 0px rgba(255,255,255,0)', '0px 0px 28px rgba(180,220,255,0.5)']
  );

  return (
    <motion.span style={{ color, textShadow }} className="mr-[0.32em]">
      {word}
    </motion.span>
  );
}

function TextReveal({
  text,
  progress,
  start,
  end,
}: {
  text: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const words = text.split(' ');
  return (
    <p className="flex flex-wrap justify-center text-4xl font-bold md:text-6xl lg:text-7xl text-center leading-[1.15]">
      {words.map((word, i) => {
        const step = (end - start) / words.length;
        const wStart = start + step * i;
        const wEnd = wStart + step;
        return (
          <RevealWord key={i} word={word} progress={progress} start={wStart} end={wEnd} />
        );
      })}
    </p>
  );
}

// ----- Canvas Particles (mini star field) -----
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    type Particle = { x: number; y: number; r: number; vx: number; vy: number; o: number };
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 140 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        o: Math.random() * 0.55 + 0.15,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 220, 255, ${p.o})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
    />
  );
}

// ----- Oscilloscope glowing scanline -----
function OscilloscopeLine({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.35, 0.45, 0.65, 0.72], [0, 1, 1, 0]);
  const scaleX = useTransform(progress, [0.38, 0.55], [0, 1]);

  return (
    <motion.div
      className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none"
      style={{ opacity }}
    >
      <div className="relative w-[80vw] h-[2px] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 right-0"
          style={{ scaleX, originX: 0 }}
        >
          {/* Line base */}
          <div className="w-full h-full bg-emerald-400 opacity-80" />
          {/* Glow */}
          <div className="absolute inset-0 blur-sm bg-emerald-300" />
        </motion.div>
        {/* Animated wave overlay using SVG */}
        <motion.svg
          className="absolute inset-0 w-full h-10 -top-4"
          viewBox="0 0 800 20"
          preserveAspectRatio="none"
          animate={{ x: [0, -800] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <path
            d="M0,10 C50,0 100,20 150,10 C200,0 250,20 300,10 C350,0 400,20 450,10 C500,0 550,20 600,10 C650,0 700,20 750,10 C800,0 850,20 900,10 C950,0 1000,20 1050,10 C1100,0 1150,20 1200,10"
            fill="none"
            stroke="rgba(52,211,153,0.8)"
            strokeWidth="2"
          />
        </motion.svg>
      </div>
    </motion.div>
  );
}

// ----- Main Component -----
export function ImmersiveScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Central glow orb transforms
  const orbScale = useTransform(scrollYProgress, [0, 0.4, 0.75, 1], [0.7, 1.8, 2.6, 0.6]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.15, 0.5, 0.8, 1], [0.25, 0.55, 0.65, 0.45, 0.1]);
  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const orbHue = useTransform(scrollYProgress, [0, 0.5, 1], [200, 150, 280]);

  // Scene 1 — Hero
  const opacity1 = useTransform(scrollYProgress, [0, 0.05, 0.2, 0.28], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.15, 0.28], [60, 0, -40]);

  // Scene 2 — Text Reveal
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.38, 0.65, 0.72], [0, 1, 1, 0]);

  // Scene 3 — Impact
  const opacity3 = useTransform(scrollYProgress, [0.78, 0.86, 0.97, 1], [0, 1, 1, 0]);
  const scale3 = useTransform(scrollYProgress, [0.78, 0.92], [0.82, 1]);
  const y3 = useTransform(scrollYProgress, [0.78, 0.92], [50, 0]);

  return (
    <section ref={containerRef} className="relative w-full bg-[#000511]" style={{ height: '380vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Subtle ambient particles */}
        <ParticleCanvas />

        {/* Central morphing glow orb */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ scale: orbScale, opacity: orbOpacity, rotate: orbRotate }}
        >
          <motion.div
            className="w-[420px] h-[420px] md:w-[680px] md:h-[680px] rounded-full"
            style={{
              background: `radial-gradient(circle at 40% 40%, hsl(${orbHue.get()}, 80%, 55%), hsl(210, 90%, 30%) 50%, transparent 75%)`,
              filter: 'blur(72px)',
            }}
            animate={{
              borderRadius: [
                '60% 40% 55% 45% / 45% 55% 45% 55%',
                '45% 55% 40% 60% / 60% 40% 55% 45%',
                '55% 45% 60% 40% / 40% 60% 50% 50%',
                '60% 40% 55% 45% / 45% 55% 45% 55%',
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Inner bright core */}
          <div className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full bg-white/10 blur-2xl" />
        </motion.div>

        {/* ─── Scene 1: Bold hero headline ─── */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10 px-6"
          style={{ opacity: opacity1, y: y1 }}
        >
          <div className="text-center select-none">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-6">
              Nueva Generación
            </p>
            <h2 className="text-[clamp(3rem,9vw,8rem)] font-black text-white tracking-tighter leading-[0.95] mb-6">
              Software que
              <br />
              <span
                className="text-transparent"
                style={{
                  WebkitTextStroke: '1.5px rgba(255,255,255,0.6)',
                }}
              >
                redefine límites
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 font-light max-w-lg mx-auto leading-relaxed">
              Precisión de alto nivel en cada detalle que construimos.
            </p>
          </div>
        </motion.div>

        {/* ─── Scene 2: Scroll word reveal ─── */}
        <motion.div
          className="absolute inset-x-4 md:inset-x-12 lg:inset-x-32 top-0 bottom-0 flex items-center justify-center z-20"
          style={{ opacity: opacity2 }}
        >
          <TextReveal
            text="Soluciones inauditas. En cada línea de código. La innovación que tu empresa merece."
            progress={scrollYProgress}
            start={0.35}
            end={0.62}
          />
        </motion.div>

        {/* ─── Scene 3: Final impact ─── */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30 px-6"
          style={{ opacity: opacity3, scale: scale3, y: y3 }}
        >
          <div className="text-center select-none">
            <h2
              className="text-[clamp(4rem,12vw,11rem)] font-black tracking-tighter leading-[0.9] mb-8"
              style={{
                background: 'linear-gradient(135deg, #ffffff 30%, #6ee7f7 60%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Absoluta
              <br />
              Precisión
            </h2>
            <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto">
              Diseñado meticulosamente para transformar la manera en que experimentas el mundo digital.
            </p>
          </div>
        </motion.div>

        {/* ─── Oscilloscope scanline (visible in scene 2) ─── */}
        <OscilloscopeLine progress={scrollYProgress} />

        {/* Scroll indicator — fades out early */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-40"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]),
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Scroll</p>
          <motion.div
            className="w-px h-10 bg-linear-to-b from-slate-500 to-transparent"
            animate={{ scaleY: [1, 0.4, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
