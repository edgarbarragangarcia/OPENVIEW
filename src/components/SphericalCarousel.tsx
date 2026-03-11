import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Globe, BrainCircuit, Zap, Lightbulb } from 'lucide-react';

const services = [
  {
    title: 'Plataformas Web',
    description: 'Desarrollo de aplicaciones web robustas, escalables y con interfaces elegantes de alto impacto.',
    icon: Globe,
    gradient: 'from-blue-600 to-cyan-500',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/40',
    accent: 'text-blue-400',
  },
  {
    title: 'Inteligencia Artificial',
    description: 'Integración de modelos de IA de vanguardia para potenciar tus productos y automatizar flujos complejos.',
    icon: BrainCircuit,
    gradient: 'from-emerald-600 to-teal-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/40',
    accent: 'text-emerald-400',
  },
  {
    title: 'Automatización',
    description: 'Optimización inteligente de flujos de trabajo mediante herramientas de automatización de última generación.',
    icon: Zap,
    gradient: 'from-orange-600 to-amber-400',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/40',
    accent: 'text-orange-400',
  },
  {
    title: 'Consultoría IT',
    description: 'Asesoramiento experto para definir la arquitectura y estrategia tecnológica que escalará tu visión.',
    icon: Lightbulb,
    gradient: 'from-rose-600 to-pink-500',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/40',
    accent: 'text-rose-400',
  },
];

export function SphericalCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  }, []);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      next();
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    } else if (info.offset.x > threshold) {
      prev();
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  return (
    <div className="relative h-[450px] w-full flex items-center justify-center overflow-visible perspective-1000">
      <div className="relative w-full max-w-lg h-full flex items-center justify-center preserve-3d">
        <AnimatePresence initial={false}>
          {services.map((service, index) => {
            const total = services.length;
            const diff = (index - currentIndex + total) % total;

            // Normalize diff to be between -floor(total/2) and floor(total/2)
            let normalizedDiff = diff;
            if (normalizedDiff > total / 2) normalizedDiff -= total;

            const isActive = normalizedDiff === 0;
            const isVisible = Math.abs(normalizedDiff) <= 1;

            // Spherical math
            const radius = 350;
            const angle = normalizedDiff * (Math.PI / 3); // Spread cards
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius - radius;
            const rotateY = normalizedDiff * 45;

            if (!isVisible && !isActive) return null;

            return (
              <motion.div
                key={service.title}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={false}
                animate={{
                  x: x,
                  z: z,
                  rotateY: rotateY,
                  opacity: isVisible ? 1 : 0,
                  scale: isActive ? 1 : 0.8,
                  filter: isActive ? 'blur(0px)' : 'blur(2px)',
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                }}
                className={`absolute w-[280px] sm:w-[320px] p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border ${service.border} shadow-2xl flex flex-col items-center text-center cursor-grab active:cursor-grabbing transition-all duration-500 ${isActive ? `bg-white/10 ${service.glow} scale-105` : 'opacity-40'}`}
                style={{
                  zIndex: isActive ? 20 : 10,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Decorative background glow */}
                {isActive && (
                  <div className={`absolute inset-0 -z-10 bg-linear-to-br ${service.gradient} opacity-10 blur-3xl rounded-full`} />
                )}

                <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br ${service.gradient} p-0.5 shadow-lg transition-all duration-500 ${isActive ? 'scale-110 rotate-3 shadow-glow' : ''}`}>
                  <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-slate-900/90 backdrop-blur-sm">
                    <service.icon size={36} className={`${service.accent} transition-transform duration-500 ${isActive ? 'scale-110' : ''}`} />
                  </div>
                </div>

                <h3 className={`font-display text-2xl font-bold mb-4 tracking-tight transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40'}`}>
                  {service.title}
                </h3>
                
                <p className={`text-sm font-light leading-relaxed transition-colors duration-300 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {service.description}
                </p>

                <div className={`mt-8 flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 ${isActive ? `opacity-100 translate-y-0 border-white/10 bg-white/5` : 'opacity-0 translate-y-4 border-transparent'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${service.accent}`}>
                    Explorar Servicio
                  </span>
                  <div className={`h-1 w-1 rounded-full ${service.accent.replace('text-', 'bg-')}`} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="absolute -bottom-12 flex gap-3">
        {services.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? `w-10 ${services[currentIndex].accent.replace('text-', 'bg-')} shadow-md` : 'w-2 bg-black/10 hover:bg-black/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
