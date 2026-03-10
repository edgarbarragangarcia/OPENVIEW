import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Globe, BrainCircuit, Zap, Lightbulb } from 'lucide-react';

const services = [
  {
    title: 'Plataformas Web',
    description: 'Desarrollo de aplicaciones web robustas, escalables y con interfaces elegantes.',
    icon: Globe,
    gradient: 'from-blue-500/5 via-blue-600/10 to-blue-500/5',
    border: 'border-blue-500/20',
    glow: 'shadow-blue-500/20',
    accent: 'text-blue-600',
  },
  {
    title: 'Inteligencia Artificial',
    description: 'Integración de modelos de IA para potenciar tus productos y automatizar procesos.',
    icon: BrainCircuit,
    gradient: 'from-emerald-500/5 via-emerald-600/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/20',
    accent: 'text-emerald-600',
  },
  {
    title: 'Automatización',
    description: 'Optimización de flujos de trabajo mediante herramientas de automatización avanzadas.',
    icon: Zap,
    gradient: 'from-orange-500/5 via-orange-600/10 to-orange-500/5',
    border: 'border-orange-500/20',
    glow: 'shadow-orange-500/20',
    accent: 'text-orange-600',
  },
  {
    title: 'Consultoría IT',
    description: 'Asesoramiento experto para definir la arquitectura y estrategia tecnológica de tu negocio.',
    icon: Lightbulb,
    gradient: 'from-red-500/5 via-red-600/10 to-red-500/5',
    border: 'border-red-500/20',
    glow: 'shadow-red-500/20',
    accent: 'text-red-600',
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
                className={`absolute w-[280px] sm:w-[320px] p-10 rounded-[2rem] bg-white/40 backdrop-blur-xl border ${service.border} shadow-xl flex flex-col items-center text-center cursor-grab active:cursor-grabbing transition-all duration-500 ${isActive ? `shadow-[0_0_50px_rgba(0,0,0,0.05)] ${service.glow} scale-105` : 'opacity-40'}`}
                style={{
                  zIndex: isActive ? 20 : 10,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/50 ${service.accent} transition-all duration-300 ${isActive ? 'scale-110 shadow-md' : ''}`}>
                  <service.icon size={32} />
                </div>
                <h3 className={`text-xl font-bold mb-4 ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{service.title}</h3>
                <p className={`font-light leading-relaxed ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                  {service.description}
                </p>
                
                {isActive && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 ${service.accent} text-sm font-medium`}
                   >
                     Desliza para explorar →
                   </motion.div>
                )}
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
