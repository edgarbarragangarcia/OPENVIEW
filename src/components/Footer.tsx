import { motion } from 'motion/react';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-32 pb-12 relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-4 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-1 lg:col-span-2"
          >
            <a href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Open View Academy Logo" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              <div className="flex flex-col justify-center">
                <span className="text-3xl font-black tracking-tighter text-slate-900 leading-none">
                  OPEN<span className="text-primary group-hover:text-blue-600 transition-colors">VIEW</span>
                </span>
              </div>
            </a>
            <p className="mt-8 max-w-xs text-lg font-light leading-relaxed text-slate-500">
              Transformando la educación digital con cursos prácticos, instructores expertos y tecnología de vanguardia.
            </p>
            <div className="mt-10 flex gap-6">
              {[
                { icon: Twitter, color: 'hover:text-blue-400' },
                { icon: Linkedin, color: 'hover:text-blue-600' },
                { icon: Github, color: 'hover:text-slate-900' },
                { icon: Mail, color: 'hover:text-emerald-500' }
              ].map((social, i) => (
                <a key={i} href="#" className={`text-slate-400 ${social.color} transition-all hover:scale-110`}>
                  <social.icon size={22} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Aprender</h3>
            <ul className="mt-8 space-y-5">
              {[
                'Ingeniería de Software',
                'Inteligencia Artificial',
                'Diseño de Interfaces',
                'Negocios Digitales'
              ].map(item => (
                <li key={item}>
                  <a href="#cursos" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center group">
                    <span className="h-px w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Plataforma</h3>
            <ul className="mt-8 space-y-5">
              {[
                { label: 'Sobre la Academia', href: '#nosotros' },
                { label: 'Planes y Precios', href: '#planes' },
                { label: 'Para Empresas', href: '#empresas' },
                { label: 'Centro de Ayuda', href: '#ayuda' }
              ].map(item => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center group">
                    <span className="h-px w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="mt-32 border-t border-slate-200 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            © 2026 Open View Academy. Todos los derechos reservados.
          </p>
          <div className="flex gap-10">
            {['Privacidad', 'Términos', 'Cookies'].map(item => (
              <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
