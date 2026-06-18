import { motion } from 'motion/react';
import { Search, PlayCircle } from 'lucide-react';

export function LMSHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 sm:px-10 z-10">
      <div className="max-w-5xl mx-auto text-center space-y-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-semibold"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Nueva Ruta: IA para Negocios ya disponible
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-display font-bold tracking-tight text-slate-900 leading-[1.1]"
        >
          Domina el futuro de <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">
            la tecnología hoy.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-light"
        >
          Aprende con expertos del sector, construye proyectos reales y acelera tu carrera profesional con nuestra metodología basada en práctica.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="¿Qué quieres aprender hoy?"
              className="w-full sm:w-80 pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors">
              Buscar
            </button>
          </div>

          <button className="flex items-center gap-2 text-slate-600 font-semibold hover:text-slate-900 transition-colors px-6 py-4">
            <PlayCircle className="h-5 w-5 text-primary" />
            <span>Ver cómo funciona</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="pt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 border-t border-slate-200/60"
        >
          {[
            { label: 'Cursos Activos', value: '+150' },
            { label: 'Estudiantes', value: '10k+' },
            { label: 'Instructores', value: '50+' },
            { label: 'Tasa de Éxito', value: '98%' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl font-display font-bold text-slate-900">{stat.value}</span>
              <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
