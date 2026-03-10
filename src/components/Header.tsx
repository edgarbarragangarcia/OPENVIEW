import { Hexagon } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Logo placeholder - Replace src with your actual logo URL or path */}
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg">
            <img 
              src="/logo.png" 
              alt="Open View Logo" 
              className="h-full w-full object-contain"
              onError={(e) => {
                // Fallback to Hexagon if image not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-primary/10', 'text-primary', 'rounded-full');
                e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hexagon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>');
              }}
            />
          </div>
          <span className="font-display text-xl font-black tracking-tighter text-gray-900">OPEN<span className="text-primary">VIEW</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#servicios">Servicios</a>
          <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#portafolio">Portafolio</a>
          <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#proceso">Proceso</a>
          <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#nosotros">Nosotros</a>
        </nav>
        <div className="flex items-center gap-4">
          <a href="#contacto" className="flex h-10 items-center justify-center rounded-full px-6 text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
            Hablemos
          </a>
        </div>
      </div>
    </header>
  );
}
