import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-transparent border-t border-white/5 pt-32 pb-12 relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-4 lg:gap-8">
          <div className="col-span-1 lg:col-span-2">
            <a href="/" className="text-3xl font-black tracking-tighter text-white group">
              OPEN<span className="text-primary group-hover:text-blue-400 transition-colors">VIEW</span>
            </a>
            <p className="mt-8 max-w-xs text-lg font-light leading-relaxed text-slate-400">
              Agencia de desarrollo de software e inteligencia artificial. Construyendo el futuro digital desde Colombia para el mundo.
            </p>
            <div className="mt-10 flex gap-6">
              {[
                { icon: Twitter, color: 'hover:text-blue-400' },
                { icon: Linkedin, color: 'hover:text-blue-600' },
                { icon: Github, color: 'hover:text-white' },
                { icon: Mail, color: 'hover:text-emerald-400' }
              ].map((social, i) => (
                <a key={i} href="#" className={`text-slate-500 ${social.color} transition-all hover:scale-110`}>
                  <social.icon size={22} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Servicios</h3>
            <ul className="mt-8 space-y-5">
              {[
                'Plataformas Web',
                'Inteligencia Artificial',
                'Automatización',
                'Consultoría IT'
              ].map(item => (
                <li key={item}>
                  <a href="#servicios" className="text-sm font-medium text-slate-400 hover:text-primary transition-colors flex items-center group">
                    <span className="h-px w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Empresa</h3>
            <ul className="mt-8 space-y-5">
              {[
                { label: 'Sobre Nosotros', href: '#nosotros' },
                { label: 'Portafolio', href: '#portafolio' },
                { label: 'Proceso', href: '#proceso' },
                { label: 'Conversemos', href: '#contacto' }
              ].map(item => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm font-medium text-slate-400 hover:text-primary transition-colors flex items-center group">
                    <span className="h-px w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            © 2024 Open View. Todos los derechos reservados.
          </p>
          <div className="flex gap-10">
            {['Privacidad', 'Términos', 'Cookies'].map(item => (
              <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
