import { ChevronDown, Search, Globe, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-md border-b border-gray-100">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Mobile Menu - Left (Only visible on Mobile) */}
        <div className="flex lg:hidden flex-1 justify-start">
          <button className="text-orange-500 hover:text-orange-600 transition-colors p-2">
            <Menu size={24} />
          </button>
        </div>

        {/* Logo - Center on Mobile, Left on Desktop */}
        <div className="flex items-center lg:flex-none lg:justify-start flex-1 justify-center lg:static absolute left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-0">
          <div className="flex flex-col items-center gap-0 group cursor-pointer">
            <img
              src="/Gemini_Generated_Image_8demn8demn8demn8.png"
              alt="Open View Logo"
              className="relative h-10 w-24 sm:h-12 sm:w-28 rounded-lg object-contain transition-transform group-hover:scale-102"
            />
            <span className="font-display text-[9px] sm:text-[11px] font-bold tracking-widest text-ntt-dark whitespace-nowrap uppercase">
              Open View <span className="text-primary">Consultants</span>
            </span>
          </div>
        </div>

        {/* Nav - Center (Desktop Only) */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 w-max">
          {['Services', 'Industries', 'Products', 'Insights', 'About us', 'Careers'].map((item) => (
            <div key={item} className="group relative flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <span className="text-[13px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-ntt-dark transition-all duration-300">{item}</span>
              {item !== 'Products' && (
                <ChevronDown size={12} className="text-gray-400 group-hover:text-primary transition-colors duration-300" />
              )}
              <div className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </nav>

        {/* Actions - Right */}
        <div className="flex flex-1 justify-end items-center gap-3 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 cursor-pointer group">
            <Globe size={18} className="text-primary group-hover:scale-110 transition-all" />
            <ChevronDown size={14} className="text-gray-400 group-hover:text-ntt-dark" />
          </div>
          <button className="text-emerald-500 hover:text-emerald-600 transition-all hover:scale-110">
            <Search size={20} />
          </button>
          <a href="#contacto" className="hidden sm:flex h-11 items-center justify-center rounded-full px-8 text-xs font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 transition-all shadow-[0_4px_12px_rgba(13,89,242,0.2)] hover:scale-105">
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
