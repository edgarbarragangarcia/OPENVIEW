import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { MouseEvent, useRef } from 'react';

interface Project {
  name: string;
  description: string;
  tags: string[];
  gradient: string;
  border: string;
  glow: string;
  accent: string;
}

interface BentoGridProps {
  items: Project[];
}

export function BentoGrid({ items }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 h-full min-h-[800px]">
      {items.map((project, index) => (
        <BentoCard
          key={project.name}
          project={project}
          index={index}
        />
      ))}
    </div>
  );
}

function BentoCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Define grid spans based on index for a more dynamic bento look
  const spans = [
    'md:col-span-4 md:row-span-1', // APEG Golf (Large)
    'md:col-span-2 md:row-span-1', // Monitor Regina (Small)
    'md:col-span-3 md:row-span-1', // KREO Dashboard (Medium)
    'md:col-span-3 md:row-span-1', // Gymboree Pagos (Medium)
    'md:col-span-6 md:row-span-1', // OpenView AI (Wide)
  ];

  return (
    <motion.div
      ref={cardRef}
      style={{
        scale,
        opacity,
      }}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-[3rem] bg-slate-900/50 backdrop-blur-2xl border border-white/5 p-10 flex flex-col justify-between transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(13,89,242,0.15)] hover:-translate-y-2 hover:border-primary/30 ${spans[index] || 'md:col-span-2'}`}
    >
      {/* Dynamic Spotlight Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[3rem] opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(13, 89, 242, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* Animated Gradient Background Overlay */}
      <div className={`absolute inset-0 bg-linear-to-br ${project.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700`} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-3 flex-wrap">
            {project.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400 backdrop-blur-sm group-hover:bg-primary/20 group-hover:text-white group-hover:border-primary/30 transition-all duration-500">
                {tag}
              </span>
            ))}
          </div>
          <motion.div
            whileHover={{ rotate: 45, scale: 1.2 }}
            className={`h-12 w-12 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center shadow-sm ${project.accent} transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20`}
          >
            <ArrowUpRight size={24} />
          </motion.div>
        </div>

        <h3 className="text-3xl font-bold tracking-tight text-white mb-4 group-hover:translate-x-1 transition-transform duration-500">
          {project.name}
        </h3>
        <p className="text-base font-light leading-relaxed text-slate-400 max-w-md group-hover:text-slate-200 transition-colors duration-500">
          {project.description}
        </p>
      </div>

      <div className="relative z-10 mt-12 flex items-center gap-4">
        <div className="h-px grow rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className={`h-full bg-linear-to-r from-primary via-blue-400 to-transparent`}
          />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          Explorar
        </span>
      </div>

      {/* Floating Abstract Glows */}
      <div className={`absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-linear-to-br ${project.gradient} opacity-10 blur-[100px] group-hover:opacity-20 group-hover:scale-110 transition-all duration-1000`} />
      <div className={`absolute -left-20 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-[80px] opacity-0 group-hover:opacity-30 transition-all duration-1000`} />
    </motion.div>
  );
}
