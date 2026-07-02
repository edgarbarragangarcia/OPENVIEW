import { ChevronDown, Search, Globe, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl bg-white/80 shadow-lg rounded-full border border-slate-200 backdrop-blur-xl">
      <div className="relative flex h-20 items-center justify-between px-10">

        {/* Mobile Menu - Left (Only visible on Mobile) */}
        <div className="flex lg:hidden flex-1 justify-start">
          <button className="text-slate-500 hover:text-slate-800 transition-colors p-2">
            <Menu size={24} />
          </button>
        </div>

        {/* Logo - Center on Mobile, Left on Desktop */}
        <div className="flex items-center lg:flex-none lg:justify-start flex-1 justify-center lg:static absolute left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-0">
          <div className="flex flex-col items-center gap-0 group cursor-pointer">
            <img
              src="/Gemini_Generated_Image_8demn8demn8demn8.png"
              alt="Open View Logo"
              className="relative h-10 w-24 sm:h-12 sm:w-28 object-contain transition-transform group-hover:scale-102 filter brightness-0"
            />
            <span className="font-display text-[9px] sm:text-[11px] font-bold tracking-widest text-slate-800 whitespace-nowrap uppercase">
              Open View <span className="text-primary">Academy</span>
            </span>
          </div>
        </div>

        {/* Nav - Center (Desktop Only) */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 w-max">
          {['Explorar Cursos', 'Rutas de Aprendizaje', 'Comunidad', 'Planes', 'Para Empresas'].map((item) => (
            <div key={item} className="group relative flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <span className="text-[13px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-all duration-300">{item}</span>
              {item !== 'Planes' && item !== 'Para Empresas' && (
                <ChevronDown size={12} className="text-slate-400 group-hover:text-primary transition-colors duration-300" />
              )}
              <div className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </nav>

        {/* Actions - Right */}
        <div className="flex flex-1 justify-end items-center gap-3 sm:gap-6">
          <button className="text-slate-500 hover:text-slate-800 transition-all hover:scale-110">
            <Search size={20} />
          </button>
          <a href="#login" className="hidden sm:flex h-11 items-center justify-center rounded-full px-8 text-xs font-black uppercase tracking-widest text-white bg-gradient-primary hover:scale-105 transition-all shadow-[0_4px_12px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_20px_rgba(14,165,233,0.5)]">
            Iniciar Sesión
          </a>
        </div>
      </div>
    </header>
  );
}
