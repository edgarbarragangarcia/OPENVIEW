export function Footer() {
  return (
    <footer className="bg-[#f5f5f7] pt-12 pb-8">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b border-black/10">
          <div className="col-span-1 lg:col-span-1">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Open View Academy" className="h-8 w-auto object-contain" />
              <span className="text-sm font-semibold text-[#1d1d1f]">Open View</span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-[#6e6e73]">
              Consultoría, capacitación y transformación digital en IA, tecnología y negocios.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#1d1d1f] mb-4">Aprender</h3>
            <ul className="space-y-3">
              {['Ingeniería de Software', 'Inteligencia Artificial', 'Diseño de Interfaces', 'Negocios Digitales'].map(item => (
                <li key={item}>
                  <a href="#cursos" className="text-sm text-[#6e6e73] hover:text-[#0071e3] hover:underline underline-offset-4 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#1d1d1f] mb-4">Consultoría</h3>
            <ul className="space-y-3">
              {['Inteligencia Artificial', 'Desarrollo Web y Producto', 'Transformación Digital', 'Casos de Éxito'].map(item => (
                <li key={item}>
                  <a href="#servicios-consultoria" className="text-sm text-[#6e6e73] hover:text-[#0071e3] hover:underline underline-offset-4 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#1d1d1f] mb-4">Plataforma</h3>
            <ul className="space-y-3">
              {[
                { label: 'Sobre la Academia', href: '#nosotros' },
                { label: 'Planes y Precios', href: '#planes' },
                { label: 'Para Empresas', href: '#empresas' },
                { label: 'Centro de Ayuda', href: '#ayuda' },
              ].map(item => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-[#6e6e73] hover:text-[#0071e3] hover:underline underline-offset-4 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#86868b]">
            © 2026 Open View Academy. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {['Privacidad', 'Términos', 'Cookies'].map(item => (
              <a key={item} href="#" className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
