import { ChevronDown, Search, Globe } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-ntt-dark/80 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-6">
            <img
              src="/Gemini_Generated_Image_8demn8demn8demn8.png"
              alt="Open View Logo"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap">
              Open View <span className="text-primary">Consultants</span>
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <div className="group relative flex items-center gap-1 cursor-pointer">
              <span className="text-[15px] font-medium text-white/90 group-hover:text-white transition-colors">Industries</span>
              <ChevronDown size={14} className="text-white/60 group-hover:text-white" />
            </div>
            <div className="group relative flex items-center gap-1 cursor-pointer">
              <span className="text-[15px] font-medium text-white/90 group-hover:text-white transition-colors">Services</span>
              <ChevronDown size={14} className="text-white/60 group-hover:text-white" />
            </div>
            <a className="text-[15px] font-medium text-white/90 hover:text-white transition-colors" href="#products">Products</a>
            <div className="group relative flex items-center gap-1 cursor-pointer">
              <span className="text-[15px] font-medium text-white/90 group-hover:text-white transition-colors">Insights</span>
              <ChevronDown size={14} className="text-white/60 group-hover:text-white" />
            </div>
            <div className="group relative flex items-center gap-1 cursor-pointer">
              <span className="text-[15px] font-medium text-white/90 group-hover:text-white transition-colors">About us</span>
              <ChevronDown size={14} className="text-white/60 group-hover:text-white" />
            </div>
            <div className="group relative flex items-center gap-1 cursor-pointer">
              <span className="text-[15px] font-medium text-white/90 group-hover:text-white transition-colors">Careers</span>
              <ChevronDown size={14} className="text-white/60 group-hover:text-white" />
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 cursor-pointer group">
            <Globe size={18} className="text-white/70 group-hover:text-white" />
            <ChevronDown size={14} className="text-white/60 group-hover:text-white" />
          </div>
          <button className="text-white/70 hover:text-white transition-colors">
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
