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
              <span className="text-primary">Consultants</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl lg:text-2xl font-medium leading-relaxed text-white/80 mb-12 max-w-2xl"
            >
              Soluciones de software a la medida para impulsar tu negocio al siguiente nivel.
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
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 relative justify-center lg:justify-end">
            <div className="relative w-full aspect-square max-w-[500px] lg:max-w-full pointer-events-none">

              {/* Lightning/Electric Flashes */}
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={`lightning-${i}`}
                  animate={{
                    opacity: [0, 0.8, 0, 0.6, 0],
                    scale: [0.9, 1.2, 0.95, 1.4, 1],
                  }}
                  transition={{
                    duration: 0.1 + (i * 0.05),
                    repeat: Infinity,
                    repeatDelay: 2 + Math.random() * 4,
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-primary/40 blur-3xl rounded-full"
                />
              ))}

              {/* High-frequency Aura Rays */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={`ray-${i}`}
                  animate={{
                    opacity: [0, 1, 0],
                    rotate: [i * 120, i * 120 + 30],
                    scaleY: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 0.1,
                    repeat: Infinity,
                    repeatDelay: 1.5 + Math.random() * 3,
                  }}
                  className="absolute left-1/2 top-1/2 w-px h-[400px] bg-linear-to-t from-transparent via-primary to-white blur-px"
                  style={{ originY: 1, x: "-50%", y: "-100%" }}
                />
              ))}

              {/* Central Core Lightning Glow */}
              <motion.div
                animate={{
                  opacity: [0.4, 1, 0.4, 0.9, 0.4],
                  scale: [1, 1.05, 0.98, 1.08, 1],
                }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 bg-primary/50 blur-[130px] rounded-full"
              />

              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                  animate={{
                    opacity: 1,
                    scale: [1.1, 1.14, 1.1],
                    rotate: [0, 3, -3, 0],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    opacity: { duration: 1.5, delay: 0.3 },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="relative w-full h-full rounded-full overflow-hidden shadow-[0_0_120px_rgba(13,89,242,0.7)]"
                >
                  {/* BASE LAYER: Sharp image, fades out at edges */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url('${imageUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      maskImage: 'radial-gradient(circle, black 55%, transparent 80%)',
                      WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 80%)',
                      filter: 'contrast(1.1) brightness(1.1)',
                    }}
                  />
                  {/* BLUR LAYER: Blurred image, only visible at edges via ring mask */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url('${imageUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      maskImage: 'radial-gradient(circle, transparent 50%, black 70%, transparent 100%)',
                      WebkitMaskImage: 'radial-gradient(circle, transparent 50%, black 70%, transparent 100%)',
                      filter: 'blur(8px) contrast(1.1) brightness(1.1)',
                    }}
                  />
                </motion.div>
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
