import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-transparent border-t border-black/5 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
          <div className="col-span-1 lg:col-span-2">
            <a href="/" className="text-2xl font-black tracking-tighter text-gray-900">
              OPEN<span className="text-primary">VIEW</span>
            </a>
            <p className="mt-6 max-w-xs text-lg font-light leading-relaxed text-gray-600">
              Agencia de desarrollo de software e inteligencia artificial. Construyendo el futuro digital desde Colombia para el mundo.
            </p>
            <div className="mt-8 flex gap-6">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Github size={20} />
              </a>
              <a href="mailto:hola@openview.ai" className="text-gray-500 hover:text-primary transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Servicios</h3>
            <ul className="mt-6 space-y-4">
              <li><a href="#servicios" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Plataformas Web</a></li>
              <li><a href="#servicios" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Inteligencia Artificial</a></li>
              <li><a href="#servicios" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Automatización</a></li>
              <li><a href="#servicios" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Consultoría IT</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Empresa</h3>
            <ul className="mt-6 space-y-4">
              <li><a href="#nosotros" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Sobre Nosotros</a></li>
              <li><a href="#portafolio" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Portafolio</a></li>
              <li><a href="#proceso" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Proceso</a></li>
              <li><a href="#contacto" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Conversemos</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-24 border-t border-black/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-light text-gray-500">
            © 2024 Open View. Todos los derechos reservados.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-light text-gray-500 hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="text-xs font-light text-gray-500 hover:text-primary transition-colors">Términos</a>
            <a href="#" className="text-xs font-light text-gray-500 hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
