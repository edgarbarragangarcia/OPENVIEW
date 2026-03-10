import { ChevronDown, Search, Globe, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white shadow-soft">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Mobile Menu - Left (Only visible on Mobile) */}
        <div className="flex lg:hidden flex-1 justify-start">
          <button className="text-gray-700 hover:text-ntt-dark transition-colors p-2">
            <Menu size={24} />
          </button>
        </div>

        {/* Logo - Center on Mobile, Left on Desktop */}
        <div className="flex items-center lg:flex-none lg:justify-start flex-1 justify-center lg:static absolute left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-0">
          <div className="flex flex-col items-center gap-0">
            <img
              src="/Gemini_Generated_Image_8demn8demn8demn8.png"
              alt="Open View Logo"
              className="h-10 w-24 sm:h-12 sm:w-28 rounded-lg object-contain"
            />
            <span className="font-display text-[9px] sm:text-[11px] font-bold tracking-tight text-ntt-dark whitespace-nowrap">
              Open View <span className="text-primary">Consultants</span>
            </span>
          </div>
        </div>

        {/* Nav - Center (Desktop Only) */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <div className="group relative flex items-center gap-1 cursor-pointer">
            <span className="text-[15px] font-medium text-gray-700 group-hover:text-ntt-dark transition-colors">Industries</span>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-ntt-dark" />
          </div>
          <div className="group relative flex items-center gap-1 cursor-pointer">
            <span className="text-[15px] font-medium text-gray-700 group-hover:text-ntt-dark transition-colors">Services</span>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-ntt-dark" />
          </div>
          <a className="text-[15px] font-medium text-gray-700 hover:text-ntt-dark transition-colors" href="#products">Products</a>
          <div className="group relative flex items-center gap-1 cursor-pointer">
            <span className="text-[15px] font-medium text-gray-700 group-hover:text-ntt-dark transition-colors">Insights</span>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-ntt-dark" />
          </div>
          <div className="group relative flex items-center gap-1 cursor-pointer">
            <span className="text-[15px] font-medium text-gray-700 group-hover:text-ntt-dark transition-colors">About us</span>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-ntt-dark" />
          </div>
          <div className="group relative flex items-center gap-1 cursor-pointer">
            <span className="text-[15px] font-medium text-gray-700 group-hover:text-ntt-dark transition-colors">Careers</span>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-ntt-dark" />
          </div>
        </nav>

        {/* Actions - Right */}
        <div className="flex flex-1 justify-end items-center gap-3 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 cursor-pointer group">
            <Globe size={18} className="text-gray-500 group-hover:text-ntt-dark" />
            <ChevronDown size={14} className="text-gray-400 group-hover:text-ntt-dark" />
          </div>
          <button className="text-gray-500 hover:text-ntt-dark transition-colors">
            <Search size={20} />
          </button>
          <a href="#contacto" className="hidden sm:flex h-10 items-center justify-center rounded-full px-8 text-[15px] font-bold text-white bg-primary hover:bg-primary/90 transition-all">
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
