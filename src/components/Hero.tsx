import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { useRef, useMemo, useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

function SandPiece({ 
  scrollYProgress, 
  row, 
  col, 
  rows, 
  cols, 
  imageUrl 
}: { 
  scrollYProgress: MotionValue<number>;
  row: number;
  col: number;
  rows: number;
  cols: number;
  imageUrl: string;
}) {
  const { driftX, driftY, randomRotate, startOffset, speedFactor } = useMemo(() => {
    return {
      driftX: (Math.random() - 0.5) * 400,
      driftY: 200 + Math.random() * 400,
      randomRotate: (Math.random() - 0.5) * 360,
      startOffset: (row / rows) * 0.3,
      speedFactor: 0.8 + Math.random() * 0.4
    };
  }, [row, rows]);

  const grainProgress = useTransform(
    scrollYProgress,
    [startOffset, Math.min(startOffset + 0.6 * speedFactor, 1)],
    [0, 1]
  );

  const x = useTransform(grainProgress, [0, 1], [0, driftX]);
  const y = useTransform(grainProgress, [0, 1], [0, driftY]);
  const rotate = useTransform(grainProgress, [0, 1], [0, randomRotate]);
  const opacity = useTransform(grainProgress, [0, 0.8, 1], [1, 0.5, 0]);
  const scale = useTransform(grainProgress, [0, 1], [1, 0.2]);

  const widthPct = 100 / cols;
  const heightPct = 100 / rows;
  const clipPath = `polygon(${col * widthPct}% ${row * heightPct}%, ${(col + 1) * widthPct}% ${row * heightPct}%, ${(col + 1) * widthPct}% ${(row + 1) * heightPct}%, ${col * widthPct}% ${(row + 1) * heightPct}%)`;

  return (
    <motion.div
      className="absolute inset-0 bg-[length:130%_130%] bg-center"
      style={{
        backgroundImage: `url('${imageUrl}')`,
        clipPath,
        x,
        y,
        rotate,
        opacity,
        scale
      }}
    />
  );
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  useEffect(() => {
    async function generateHeroImage() {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: 'A high-tech, futuristic sphere representing artificial intelligence. Inside the sphere is a glowing, intricate digital brain made of neural network connections and fiber optics. The sphere has a glass-like surface with neon blue and purple energy pulses. Cinematic lighting, clean white background, hyper-realistic, 8k resolution, centered composition.',
              },
            ],
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            setGeneratedImageUrl(`data:image/png;base64,${base64EncodeString}`);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Error generating image:", error);
        // Fallback image if generation fails
        setGeneratedImageUrl("https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop");
        setIsLoading(false);
      }
    }

    generateHeroImage();
  }, []);

  const rows = 12;
  const cols = 12;
  const pieces = useMemo(() => {
    const p = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        p.push({ r, c });
      }
    }
    return p;
  }, [rows, cols]);

  return (
    <section ref={containerRef} className="relative isolate overflow-hidden pt-24 lg:pt-32 min-h-screen flex items-center justify-center">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/50 px-3 py-1 text-xs font-medium text-gray-600 mb-6 backdrop-blur-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary"></span>
            Agencia de Software & IA
          </div>
          <h1 className="font-display text-5xl font-light tracking-tight text-gray-900 sm:text-8xl mb-6 leading-[1.1] max-w-4xl">
            Ingeniería Digital <br/><span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">con Propósito</span>
          </h1>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-gray-800 max-w-2xl">
            Construimos productos digitales a la medida que transforman la manera en que las empresas operan, venden y se conectan con sus usuarios. Rápido, elegante, escalable.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
            <button className="group flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              Ver Proyectos
              <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
            </button>
            <a className="text-sm font-medium leading-6 text-gray-900 hover:text-primary transition-colors" href="#contacto">
              Contáctanos <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sphere Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="relative w-[120%] aspect-square max-w-[1000px] opacity-35 lg:opacity-50 filter blur-[1px]">
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-[120px] animate-pulse"></div>
          
          <div 
            className="relative h-full w-full rounded-full overflow-hidden"
            style={{
              maskImage: 'radial-gradient(circle, black 40%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 80%)',
            }}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : generatedImageUrl && (
              pieces.map((p) => (
                <SandPiece 
                  key={`${p.r}-${p.c}`}
                  scrollYProgress={scrollYProgress}
                  row={p.r}
                  col={p.c}
                  rows={rows}
                  cols={cols}
                  imageUrl={generatedImageUrl}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
