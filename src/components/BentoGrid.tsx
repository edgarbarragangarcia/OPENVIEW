import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { MouseEvent } from 'react';

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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1]
      }}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-[3rem] bg-white/40 backdrop-blur-xl border border-black/5 p-10 flex flex-col justify-between transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-2 ${spans[index] || 'md:col-span-2'}`}
    >
      {/* Dynamic Spotlight Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[3rem] opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              800px circle at ${mouseX}px ${mouseY}px,
              rgba(13, 89, 242, 0.1),
              transparent 80%
            )
          `,
        }}
      />

      {/* Animated Border Gradient */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/10 rounded-[3rem] transition-colors duration-700 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-3 flex-wrap">
            {project.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 rounded-full bg-white/50 border border-black/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 backdrop-blur-sm group-hover:bg-primary/5 group-hover:text-primary transition-colors duration-500">
                {tag}
              </span>
            ))}
          </div>
          <motion.div 
            whileHover={{ rotate: 45, scale: 1.2 }}
            className={`h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm ${project.accent} transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/10`}
          >
            <ArrowUpRight size={24} />
          </motion.div>
        </div>
        
        <h3 className="text-3xl font-black tracking-tighter text-gray-900 mb-4 group-hover:translate-x-1 transition-transform duration-500">
          {project.name}
        </h3>
        <p className="text-base font-light leading-relaxed text-gray-600 max-w-md group-hover:text-gray-900 transition-colors duration-500">
          {project.description}
        </p>
      </div>

      <div className="relative z-10 mt-12 flex items-center gap-4">
        <div className="h-0.5 flex-grow rounded-full bg-black/5 overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className={`h-full bg-gradient-to-r ${project.gradient.replace('from-', 'from-primary').replace('via-', 'via-purple-500').replace('to-', 'to-transparent')}`}
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          Explorar
        </span>
      </div>
      
      {/* Floating Abstract Shapes */}
      <div className={`absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-gradient-to-br ${project.gradient} opacity-5 blur-3xl group-hover:opacity-20 group-hover:scale-150 transition-all duration-1000`} />
      <div className={`absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-10 transition-all duration-1000`} />
    </motion.div>
  );
}
