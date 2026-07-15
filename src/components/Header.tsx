import { BookOpen, Menu, ArrowRight, User, ChevronDown, ChevronUp, Search, LogOut, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onLoginClick: () => void;
}

const LEARNING_PATHS = [
  {
    id: 1,
    title: 'Bloque 1 — El ecosistema Claude y sus herramientas',
    sessionsCount: 5,
    sessions: [
      { id: 1, title: 'Sesión 1 — Fundamentos de IA — Talleres Colab y Ollama', duration: '120m', conclusion: 'Comprenderás los conceptos básicos de IA y configurarás tu primer entorno de trabajo.' },
      { id: 2, title: 'Sesión 2 — Claude.ai a fondo: Proyectos, análisis certeros y ecosistema Gemini', duration: '80m', conclusion: 'Dominarás el uso avanzado de Claude.ai para el análisis y gestión de proyectos complejos.' },
      { id: 3, title: 'Sesión 3 — MCP: conectando Claude a Drive, correo y Airtable', duration: '80m', conclusion: 'Aprenderás a integrar Claude con herramientas de productividad esenciales en tu día a día.' },
      { id: 4, title: 'Sesión 4 — Airtable como base de datos: cargar, estructurar y consultar', duration: '80m', conclusion: 'Diseñarás y consultarás bases de datos estructuradas fácilmente desde cualquier dispositivo.' },
      { id: 5, title: 'Sesión 5 — Claude Cowork: automatizaciones de trabajo de conocimiento', duration: '80m', conclusion: 'Automatizarás tareas repetitivas de conocimiento para maximizar tu eficiencia y la de tu equipo.' }
    ]
  },
  {
    id: 2,
    title: 'Bloque 2 — Agentes, CLI y control desde el móvil',
    sessionsCount: 3,
    sessions: [
      { id: 6, title: 'Sesión 6 — Claude Code (CLI), Skills y tu primer agente', duration: '80m', conclusion: 'Crearás y desplegarás tu primer agente inteligente autónomo desde la línea de comandos.' },
      { id: 7, title: 'Sesión 7 — El móvil como centro de control, tareas programadas y n8n', duration: '80m', conclusion: 'Gestionarás automatizaciones complejas y tareas programadas usando n8n desde tu smartphone.' },
      { id: 8, title: 'Sesión 8 — Cierre: mapa de flujos de trabajo, mínimo 3 agentes y el bot en n8n', duration: '80m', conclusion: 'Integrarás todo el conocimiento construyendo flujos completos con múltiples agentes colaborando.' }
    ]
  }
];

export function Header({ onLoginClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut, isLoading } = useAuth();
  const [expandedBlock, setExpandedBlock] = useState<number | null>(1);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="flex items-center gap-3 cursor-pointer group">
          <img src="/logo.png" alt="Open View Academy Logo" className="h-16 w-auto object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
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
          {['Explorar Cursos', 'Rutas de Aprendizaje', 'Comunidad', 'Planes'].map((item) => (
            <div
              key={item}
              className="relative px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer flex items-center gap-1.5 group"
              onClick={() => {
                if (item === 'Rutas de Aprendizaje') {
                   document.getElementById('rutas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {item}
              {(item === 'Explorar Cursos' || item === 'Rutas de Aprendizaje') && (
                <ChevronDown size={14} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
              )}
              
              {/* Dropdown for Rutas de Aprendizaje */}
              {item === 'Rutas de Aprendizaje' && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-[600px] normal-case tracking-normal cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col p-3 max-h-[75vh] overflow-y-auto lms-scroll">
                    {LEARNING_PATHS.map((path) => {
                      const isExpanded = expandedBlock === path.id;
                      return (
                        <div key={path.id} className={`flex flex-col border rounded-xl mb-2 overflow-hidden transition-all duration-300 last:mb-0 ${isExpanded ? 'border-sky-200 ring-1 ring-sky-100 shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}>
                          <div 
                            className={`flex items-center justify-between p-4 transition-colors cursor-pointer ${isExpanded ? 'bg-sky-50/50' : 'hover:bg-slate-50'}`}
                            onClick={() => setExpandedBlock(isExpanded ? null : path.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-black shrink-0 ${isExpanded ? 'bg-sky-100 border-sky-200 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                {path.id}
                              </div>
                              <span className={`text-[15px] font-bold ${isExpanded ? 'text-sky-900' : 'text-slate-700'}`}>
                                {path.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 pl-4 shrink-0">
                              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{path.sessionsCount} sesiones</span>
                              {isExpanded ? (
                                <ChevronUp size={16} className="text-sky-500" />
                              ) : (
                                <ChevronDown size={16} className="text-slate-400" />
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Content */}
                          <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            <div className="bg-white px-4 pb-4 pt-1">
                              <div className="flex flex-col gap-3 mt-1">
                                {path.sessions.map((session) => (
                                  <div key={session.id} className="group p-3.5 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 transition-all shadow-sm hover:shadow">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                      <p className="text-[13px] font-semibold text-slate-700 group-hover:text-sky-800 leading-snug">
                                        {session.title}
                                      </p>
                                      <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-sky-600 text-[11px] font-medium shrink-0 pt-0.5 transition-colors">
                                        <FileText size={12} />
                                        <span>{session.duration}</span>
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
                                      {session.conclusion}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-sky-500 hover:bg-sky-50 transition-all">
            <Search size={18} />
          </button>

          {!isLoading && (
            user ? (
              <div className="flex items-center gap-3">
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
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all duration-300 bg-slate-900 rounded-full hover:shadow-[0_8px_20px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-sky-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Ingresar</span>
                <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            )
          )}

          {/* Mobile Menu Button */}
          <button className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
