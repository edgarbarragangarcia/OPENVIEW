import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setImageUrl("/hero-bg.png");
  }, []);

  return (
    <section ref={containerRef} className="relative isolate overflow-hidden bg-ntt-dark min-h-screen flex items-center pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 xl:col-span-8">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-[85px] mb-8 leading-[1.05]"
            >
              Open View <br />
              Technology <br />
              Foresight 2026
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl lg:text-2xl font-medium leading-relaxed text-white/80 mb-12 max-w-2xl"
            >
              Cómo lograr un crecimiento sostenible en la era de la inteligencia masiva
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-5"
            >
              <button className="group relative flex h-14 items-center justify-center rounded-full bg-ntt-yellow px-10 text-[17px] font-bold text-black transition-all hover:bg-ntt-yellow/90">
                Descubre más
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
              </button>
              <button className="group relative flex h-14 items-center justify-center rounded-full bg-ntt-yellow px-10 text-[17px] font-bold text-black transition-all hover:bg-ntt-yellow/90">
                Lee la noticia
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
              </button>
            </motion.div>
          </div>

          {/* Right Content - Abstract Sphere */}
          <div className="lg:col-span-5 xl:col-span-4 relative flex justify-center lg:justify-end">
            <div className="relative w-full aspect-square max-w-[500px] lg:max-w-full pointer-events-none">
              <div className="absolute inset-0 bg-primary/30 blur-[100px] rounded-full animate-pulse" />
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1.1, rotate: 0 }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  className="relative w-full h-full rounded-full overflow-hidden"
                  style={{
                    backgroundImage: `url('${imageUrl}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    maskImage: 'radial-gradient(circle, black 50%, transparent 90%)',
                    WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 90%)',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-ntt-dark via-ntt-dark/40 to-transparent" />
    </section>
  );
}
