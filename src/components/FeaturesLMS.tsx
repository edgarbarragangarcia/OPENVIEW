import { motion } from 'motion/react';
import { BookOpen, Trophy, Video, Users } from 'lucide-react';

const FEATURES = [
  {
    title: 'Aprende a tu propio ritmo',
    description: 'Accede a todo el contenido 24/7 y avanza según tus propios horarios sin presiones.',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Certificados Validados',
    description: 'Obtén certificados oficiales respaldados por la industria al terminar tus cursos.',
    icon: Trophy,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    title: 'Clases en Vivo y Grabadas',
    description: 'Participa en sesiones interactivas con profesores o míralas luego en HD.',
    icon: Video,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Comunidad Activa',
    description: 'Únete a miles de estudiantes y profesionales para hacer networking y resolver dudas.',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
  }
];

export function FeaturesLMS() {
  return (
    <section className="py-24 px-6 sm:px-10 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">
            ¿Por qué estudiar con nosotros?
          </h2>
          <p className="text-slate-500">
            Nuestra metodología está probada para llevar tu carrera al siguiente nivel combinando teoría experta y práctica intensiva.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
