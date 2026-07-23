import { Menu, X, ChevronRight, User, Search, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type LandingView = 'home' | 'consultoria';

interface HeaderProps {
  onLoginClick: () => void;
  activeView?: LandingView;
  onNavigateView?: (view: LandingView) => void;
}

const NAV_ITEMS = ['Explorar Cursos', 'Servicios de Consultoría', 'Rutas de Aprendizaje', 'Comunidad', 'Planes'];

export function Header({ onLoginClick, activeView = 'home', onNavigateView }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (item: string) => {
    setIsMenuOpen(false);
    if (item === 'Servicios de Consultoría') {
      if (activeView !== 'consultoria') {
        onNavigateView?.('consultoria');
        return;
      }
      document.getElementById('servicios-consultoria')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (item === 'Explorar Cursos' || item === 'Rutas de Aprendizaje') {
      if (activeView !== 'home') {
        onNavigateView?.('home');
      }
    }
    if (item === 'Rutas de Aprendizaje') {
      setTimeout(() => document.getElementById('rutas')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), activeView !== 'home' ? 50 : 0);
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-black/5' : 'bg-black/30 backdrop-blur-xl'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-12 sm:h-14 px-4 sm:px-8">
        {/* Left: Logo */}
        <button
          onClick={() => onNavigateView?.('home')}
          className="flex items-center gap-2 group min-w-0"
        >
          <img src="/logo.png" alt="Open View Academy" className="h-7 w-auto object-contain shrink-0" />
          <span className={`hidden sm:inline text-sm font-semibold tracking-tight transition-colors duration-300 ${isScrolled ? 'text-[#1d1d1f]' : 'text-white'}`}>
            Open View
          </span>
        </button>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = item === 'Servicios de Consultoría' && activeView === 'consultoria';
            return (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`text-xs font-medium tracking-wide whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? (isScrolled ? 'text-[#0071e3]' : 'text-white')
                    : isScrolled
                      ? 'text-[#1d1d1f]/80 hover:text-[#0071e3]'
                      : 'text-white/80 hover:text-white'
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
            isScrolled ? 'text-[#1d1d1f]/70 hover:text-[#0071e3]' : 'text-white/80 hover:text-white'
          }`}>
            <Search size={16} />
          </button>

          {!isLoading && (
            user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
                    <User size={14} />
                  </div>
                  <span className={`text-xs font-medium transition-colors duration-300 ${isScrolled ? 'text-[#1d1d1f]/80' : 'text-white/80'}`}>
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className={`p-2 transition-colors ${isScrolled ? 'text-[#1d1d1f]/50 hover:text-red-500' : 'text-white/60 hover:text-red-300'}`}
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className={`hidden lg:inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 ${
                  isScrolled ? 'bg-[#1d1d1f] text-white hover:bg-black' : 'bg-white text-[#1d1d1f] hover:bg-white/90'
                }`}
              >
                Ingresar
                <ChevronRight size={13} />
              </button>
            )
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            className={`lg:hidden flex items-center justify-center w-8 h-8 shrink-0 rounded-full transition-colors ${
              isScrolled ? 'text-[#1d1d1f]' : 'text-white'
            }`}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`lg:hidden overflow-hidden bg-white border-b border-black/5 will-change-transform transition-[max-height,opacity] duration-200 ease-out ${
          isMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="px-6 py-3 flex flex-col">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className="text-left py-3 border-b border-black/5 text-sm font-medium text-[#1d1d1f] last:border-none"
            >
              {item}
            </button>
          ))}

          {!isLoading && (
            user ? (
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium text-[#1d1d1f]">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={() => { setIsMenuOpen(false); signOut(); }}
                  className="p-2 text-[#1d1d1f]/50 hover:text-red-500 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsMenuOpen(false); onLoginClick(); }}
                className="mt-3 mb-2 inline-flex items-center justify-center gap-1 px-6 py-2.5 text-sm font-medium text-white bg-[#1d1d1f] rounded-full"
              >
                Ingresar
                <ChevronRight size={15} />
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
