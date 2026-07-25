import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useEffect } from 'react';
import { useIsMobile } from '../lib/useIsMobile';

interface LMSHeroProps {
  onCtaClick?: () => void;
}

export function LMSHero({}: LMSHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  // Algunos navegadores móviles bloquean el autoplay programático aunque el
  // video esté muted+playsInline (política de ahorro de datos/batería), o lo
  // pausan si el elemento no ha entrado aún al viewport. Forzamos `muted` por
  // JS (algunos WebKit lo ignoran si solo viene como atributo cuando React
  // monta el nodo) y reintentamos play() en varios disparadores: al poder
  // reproducir, al volver a la pestaña, al entrar en viewport y con un
  // reintento corto por si el primer intento llega antes de que el video
  // esté listo.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const tryPlay = () => {
      if (video.paused) video.play().catch(() => {});
    };

    tryPlay();
    const retries = [200, 500, 1000, 2000, 4000].map((ms) => setTimeout(tryPlay, ms));

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && tryPlay()),
      { threshold: 0.1 }
    );
    observer.observe(video);

    video.addEventListener('canplay', tryPlay);
    video.addEventListener('loadeddata', tryPlay);
    document.addEventListener('visibilitychange', tryPlay);

    // iOS: con "Auto-Play Video Previews" desactivado en Ajustes >
    // Accesibilidad > Movimiento, Safari bloquea el autoplay programático
    // sin importar los reintentos anteriores. Pero sí permite reproducir
    // dentro del handler de un gesto real del usuario, así que enganchamos
    // el primer touch/click/scroll de la página para "desbloquear" el video.
    const gestureEvents: (keyof DocumentEventMap)[] = ['touchstart', 'click', 'scroll'];
    const unlock = () => {
      tryPlay();
      gestureEvents.forEach((ev) => document.removeEventListener(ev, unlock));
    };
    gestureEvents.forEach((ev) => document.addEventListener(ev, unlock, { passive: true }));

    return () => {
      retries.forEach(clearTimeout);
      observer.disconnect();
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
      document.removeEventListener('visibilitychange', tryPlay);
      gestureEvents.forEach((ev) => document.removeEventListener(ev, unlock));
    };
  }, []);
  // Efecto "apertura de producto" de Apple: el titular se encoge y se
  // desvanece levemente a medida que uno hace scroll hacia la siguiente
  // sección, en vez de quedarse estático. Desactivado en móvil (scroll-jank).
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, isMobile ? 1 : 0]);

  return (
    <section ref={sectionRef} className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 sm:pt-24 bg-black text-white overflow-hidden">
      {/* Video de fondo. En desktop cubre toda la sección; en móvil se
          muestra completo (sin recortar) y más pequeño, centrado, para que
          no quede un acercamiento exagerado al oso. */}
      <video
        ref={videoRef}
        src="/hero-bear.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 m-auto w-full h-full max-h-[55vh] sm:max-h-none object-contain sm:object-cover opacity-40"
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
        className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 w-full text-center lg:text-left"
      >
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-tight mb-6 max-w-3xl mx-auto lg:mx-0"
        >
          Aprende las habilidades<br className="hidden sm:block" /> que transforman carreras.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg sm:text-2xl text-[#86868b] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed"
        >
          Domina IA, tecnología, liderazgo y negocios con instructores que viven la industria.
        </motion.p>
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
