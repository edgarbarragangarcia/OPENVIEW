import { ChevronDown, Search, Globe } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white shadow-soft">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-center gap-0">
            <img
              src="/Gemini_Generated_Image_8demn8demn8demn8.png"
              alt="Open View Logo"
              className="h-12 w-28 rounded-lg object-contain"
            />
            <span className="font-display text-[11px] font-bold tracking-tight text-ntt-dark whitespace-nowrap">
              Open View <span className="text-primary">Consultants</span>
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
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
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 cursor-pointer group">
            <Globe size={18} className="text-gray-500 group-hover:text-ntt-dark" />
            <ChevronDown size={14} className="text-gray-400 group-hover:text-ntt-dark" />
          </div>
          <button className="text-gray-500 hover:text-ntt-dark transition-colors">
            <Search size={20} />
          </button>
          <a href="#contacto" className="flex h-10 items-center justify-center rounded-full px-8 text-[15px] font-bold text-white bg-primary hover:bg-primary/90 transition-all">
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
