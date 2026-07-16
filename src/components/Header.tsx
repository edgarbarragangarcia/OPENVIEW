import { BookOpen, Menu, X, ArrowRight, User, ChevronDown, Search, LogOut } from 'lucide-react';
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
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-3'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0">
          <img src="/logo.png" alt="Open View Academy Logo" className="h-10 sm:h-16 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <div className="hidden sm:flex flex-col justify-center border-l-2 border-slate-200 pl-4 py-1">
            <span className="font-display text-xl font-black tracking-tight text-slate-900 leading-none">
              Open View
            </span>
            <span className="text-xs font-bold tracking-widest text-sky-500 uppercase mt-1">
              Academy
            </span>
          </div>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:flex items-center p-1.5 rounded-full bg-slate-100/50 border border-slate-200/50 backdrop-blur-md">
          {NAV_ITEMS.map((item) => (
            <div
              key={item}
              className="relative px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer flex items-center gap-1.5 group"
              onClick={() => handleNavClick(item)}
            >
              {item}
              {item === 'Explorar Cursos' && (
                <ChevronDown size={14} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
              )}
            </div>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-sky-500 hover:bg-sky-50 transition-all">
            <Search size={18} />
          </button>

          {!isLoading && (
            user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="hidden lg:inline-flex group relative items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white transition-all duration-300 bg-slate-900 rounded-full hover:shadow-[0_8px_20px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 overflow-hidden whitespace-nowrap"
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
            className="lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-xl border-b border-slate-200/50 ${
          isMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
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
