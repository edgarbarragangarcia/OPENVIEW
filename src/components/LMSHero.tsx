import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../lib/useIsMobile';

interface LMSHeroProps {
  onCtaClick?: () => void;
}

export function LMSHero({}: LMSHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  // Efecto "apertura de producto" de Apple: el titular se encoge y se
  // desvanece levemente a medida que uno hace scroll hacia la siguiente
  // sección, en vez de quedarse estático. Desactivado en móvil (scroll-jank).
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, isMobile ? 1 : 0]);

  // El texto aparece, se queda un momento, se desvanece dejando solo al oso
  // caminando de fondo, y tras una pausa vuelve a aparecer — en bucle, ambas
  // transiciones suaves (mismo `transition` de 1.8s para entrar y salir).
  const [showText, setShowText] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowText(v => !v), showText ? 4500 : 3000);
    return () => clearTimeout(timer);
  }, [showText]);

  return (
    <section ref={sectionRef} className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 sm:pt-24 bg-black text-white overflow-hidden">
      {/* Video de fondo, a pantalla completa y con opacidad reducida para
          que el texto siga siendo legible por encima. */}
      <video
        src="/hero-bear.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* Ambient glow animado: varios "blobs" de color que se desplazan lento
          y sin rumbo fijo (nada de starfield ni parallax de scroll). */}
      <div className="absolute inset-0 pointer-events-none opacity-80">
        <div className="hero-blob hero-blob-a" style={{ background: 'radial-gradient(circle, rgba(0,113,227,0.55) 0%, transparent 70%)' }} />
        <div className="hero-blob hero-blob-b" style={{ background: 'radial-gradient(circle, rgba(41,151,255,0.4) 0%, transparent 70%)' }} />
        <div className="hero-blob hero-blob-c" style={{ background: 'radial-gradient(circle, rgba(94,92,230,0.35) 0%, transparent 70%)' }} />
      </div>

      <motion.div
        style={{ scale, opacity }}
        className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 w-full text-center"
      >
        <motion.div
          animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : -16 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-tight mb-6"
          >
            Aprende las habilidades<br className="hidden sm:block" /> que transforman carreras.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg sm:text-2xl text-[#86868b] max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Domina IA, tecnología, liderazgo y negocios con instructores que viven la industria.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Fundido hacia la siguiente sección blanca — curva "smoothstep" con
          muchas paradas para que no se note el codo que deja un gradiente
          de 2-3 paradas lineales. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-56 z-0"
        style={{
          background: `linear-gradient(to bottom,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.02) 15%,
            rgba(255,255,255,0.08) 30%,
            rgba(255,255,255,0.2) 45%,
            rgba(255,255,255,0.4) 60%,
            rgba(255,255,255,0.65) 75%,
            rgba(255,255,255,0.88) 90%,
            #fff 100%)`,
        }}
      />
    </section>
  );
}
