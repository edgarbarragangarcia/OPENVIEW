import { BookOpen, Menu, X, ArrowRight, User, ChevronDown, Search, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onLoginClick: () => void;
}

const NAV_ITEMS = ['Explorar Cursos', 'Rutas de Aprendizaje', 'Comunidad', 'Planes'];

export function Header({ onLoginClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleNavClick = (item: string) => {
    setIsMenuOpen(false);
    if (item === 'Rutas de Aprendizaje') {
      document.getElementById('rutas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4">
      <motion.div
        animate={{
          maxWidth: isScrolled ? 1100 : 1280,
          boxShadow: isScrolled
            ? '0 8px 30px -8px rgba(13,89,242,0.18), 0 1px 0 rgba(255,255,255,0.6) inset'
            : '0 0px 0px rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`mx-auto flex items-center justify-between transition-colors duration-500 ${
          isScrolled
            ? 'bg-white/70 backdrop-blur-2xl border border-white/60 rounded-full py-2.5 px-4 sm:px-6'
            : 'bg-transparent border border-transparent rounded-full py-3 px-2'
        }`}
      >

        {/* Left: Logo */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0">
          <img src="/logo.png" alt="Open View Academy Logo" className="h-10 sm:h-16 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <div className={`hidden sm:flex flex-col justify-center border-l-2 pl-4 py-1 transition-colors duration-500 ${isScrolled ? 'border-slate-200' : 'border-white/25'}`}>
            <span className={`font-display text-xl font-black tracking-tight leading-none transition-colors duration-500 ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              Open View
            </span>
            <span className="text-xs font-bold tracking-widest text-sky-400 uppercase mt-1">
              Academy
            </span>
          </div>
        </div>

        {/* Center: Desktop Nav */}
        <nav className={`hidden lg:flex items-center p-1.5 rounded-full backdrop-blur-md transition-colors duration-500 ${
          isScrolled ? 'bg-slate-100/50 border border-slate-200/50' : 'bg-white/10 border border-white/15'
        }`}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item}
              className={`relative px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 group ${
                isScrolled
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => handleNavClick(item)}
            >
              {item}
              {item === 'Explorar Cursos' && (
                <ChevronDown size={14} className={`transition-colors ${isScrolled ? 'text-slate-400 group-hover:text-sky-500' : 'text-slate-400 group-hover:text-sky-300'}`} />
              )}
            </div>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <button className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full transition-all ${
            isScrolled ? 'text-slate-500 hover:text-sky-500 hover:bg-sky-50' : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}>
            <Search size={18} />
          </button>

          {!isLoading && (
            user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                    <User size={16} />
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-500 ${isScrolled ? 'text-slate-700' : 'text-slate-200'}`}>
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className={`p-2 transition-colors ${isScrolled ? 'text-slate-400 hover:text-red-500' : 'text-slate-300 hover:text-red-400'}`}
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className={`pulse-glow hidden lg:inline-flex group relative items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white transition-all duration-300 rounded-full hover:-translate-y-0.5 overflow-hidden whitespace-nowrap ${
                  isScrolled ? 'bg-slate-900 hover:shadow-[0_8px_20px_rgba(14,165,233,0.4)]' : 'bg-gradient-primary hover:shadow-[0_8px_20px_rgba(14,165,233,0.5)]'
                }`}
              >
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-sky-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Ingresar</span>
                <ArrowRight size={14} className="relative z-10 hidden sm:inline transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            )
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            className={`lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full transition-colors ${
              isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu Panel — fondo sólido (sin backdrop-blur): este panel solo
          existe en móvil/tablet, y desenfocar toda la página detrás hacía que el
          menú tardara en aparecer al tocar la hamburguesa. */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-200 ease-out mx-1 mt-2 rounded-3xl bg-white border border-slate-200 shadow-[0_8px_30px_-8px_rgba(13,89,242,0.18)] ${
          isMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <nav className="px-6 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className="text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            >
              {item}
            </button>
          ))}

          <div className="h-px bg-slate-200 my-2" />

          {!isLoading && (
            user ? (
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={() => { setIsMenuOpen(false); signOut(); }}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsMenuOpen(false); onLoginClick(); }}
                className="mx-4 mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-white bg-slate-900 rounded-full"
              >
                Ingresar
                <ArrowRight size={16} />
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
