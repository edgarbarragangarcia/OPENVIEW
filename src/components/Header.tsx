import { BookOpen, Menu, ArrowRight, User, ChevronDown, Search, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [overDarkHero, setOverDarkHero] = useState(true);
  const { user, signOut, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sentinel = document.getElementById('scrollstory-end');
      setOverDarkHero(sentinel ? sentinel.getBoundingClientRect().top > 80 : false);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dark = overDarkHero;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        dark
          ? isScrolled
            ? 'bg-black/30 backdrop-blur-xl border-b border-white/10 py-3'
            : 'bg-transparent border-b border-transparent py-5'
          : isScrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-3'
            : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <BookOpen size={24} />
          </div>
          <div className={`hidden sm:flex flex-col justify-center border-l-2 pl-3 transition-colors duration-500 ${dark ? 'border-white/20' : 'border-slate-200'}`}>
            <span className={`font-display text-sm font-extrabold tracking-tight leading-none transition-colors duration-500 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Open View
            </span>
            <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase mt-1">
              Academy
            </span>
          </div>
        </div>

        {/* Center: Desktop Nav */}
        <nav className={`hidden lg:flex items-center p-1.5 rounded-full backdrop-blur-md transition-colors duration-500 ${
          dark ? 'bg-white/5 border border-white/10' : 'bg-slate-100/50 border border-slate-200/50'
        }`}>
          {['Explorar Cursos', 'Rutas de Aprendizaje', 'Comunidad', 'Planes'].map((item) => (
            <div
              key={item}
              className={`relative px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 group ${
                dark
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
              }`}
            >
              {item}
              {(item === 'Explorar Cursos' || item === 'Rutas de Aprendizaje') && (
                <ChevronDown size={14} className={`transition-colors ${dark ? 'text-white/40 group-hover:text-sky-400' : 'text-slate-400 group-hover:text-sky-500'}`} />
              )}
            </div>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full transition-all ${
            dark ? 'text-white/60 hover:text-sky-400 hover:bg-white/10' : 'text-slate-500 hover:text-sky-500 hover:bg-sky-50'
          }`}>
            <Search size={18} />
          </button>

          {!isLoading && (
            user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${dark ? 'bg-white/10 text-sky-300' : 'bg-sky-100 text-sky-600'}`}>
                    <User size={16} />
                  </div>
                  <span className={`text-sm font-medium transition-colors ${dark ? 'text-white/90' : 'text-slate-700'}`}>
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className={`p-2 transition-colors hover:text-red-500 ${dark ? 'text-white/50' : 'text-slate-400'}`}
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all duration-300 bg-slate-900 rounded-full hover:shadow-[0_8px_20px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-sky-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Ingresar</span>
                <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            )
          )}

          {/* Mobile Menu Button */}
          <button className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            dark ? 'text-white/70 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
          }`}>
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

