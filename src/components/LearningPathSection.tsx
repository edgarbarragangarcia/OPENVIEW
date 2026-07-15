import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Clock, BookOpen, BarChart } from 'lucide-react';
import { motion } from 'motion/react';

export const LEARNING_PATHS_DATA = [
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

interface LearningPathSectionProps {
  onEnroll?: () => void;
}

export function LearningPathSection({ onEnroll }: LearningPathSectionProps) {
  const [expandedBlock, setExpandedBlock] = useState<number | null>(1);

  return (
    <section id="rutas" className="py-24 px-6 sm:px-10 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto">
        
        {/* Header de la Ruta */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm mb-12"
        >
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1">
              <h2 className="font-serif text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
                IA DE CERO A PROFESIONAL
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Capacitar al equipo en el ecosistema completo de Claude y sus herramientas —Claude.ai, Claude Cowork, Claude Code (CLI), app móvil y conectividad MCP— complementado con el ecosistema Gemini, para que cada participante replique sus tareas reales en agentes de IA y la empresa trabaje junto con la IA de forma más competitiva.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600 mb-8">
                <div className="flex items-center gap-2">
                  <BarChart size={16} className="text-sky-500" />
                  <span>Principiante</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-sky-500" />
                  <span>16h de contenido</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-sky-500" />
                  <span>8 lecciones · 2 módulos</span>
                </div>
              </div>

              <button
                onClick={onEnroll}
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-sky-500 px-8 text-sm font-bold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600 hover:-translate-y-0.5 transition-all duration-300"
              >
                Inscribirse en la ruta
              </button>
            </div>
          </div>
        </motion.div>

        {/* Contenido de la Ruta (Acordeón) */}
        <div>
          <h3 className="font-serif text-2xl font-black text-slate-900 mb-6">Contenido de la ruta</h3>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-3 overflow-hidden">
            {LEARNING_PATHS_DATA.map((path) => {
              const isExpanded = expandedBlock === path.id;
              return (
                <div key={path.id} className={`flex flex-col border rounded-xl mb-3 transition-all duration-300 last:mb-0 ${isExpanded ? 'border-sky-200 ring-1 ring-sky-100 shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div 
                    className={`flex items-center justify-between p-5 transition-colors cursor-pointer ${isExpanded ? 'bg-sky-50/50' : 'hover:bg-slate-50'}`}
                    onClick={() => setExpandedBlock(isExpanded ? null : path.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-black shrink-0 ${isExpanded ? 'bg-sky-100 border-sky-200 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        {path.id}
                      </div>
                      <span className={`text-base sm:text-lg font-bold ${isExpanded ? 'text-sky-900' : 'text-slate-800'}`}>
                        {path.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 pl-4 shrink-0">
                      <span className="text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap">{path.sessionsCount} sesiones</span>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-sky-500" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="bg-white px-5 pb-5 pt-2">
                      <div className="flex flex-col gap-3">
                        {path.sessions.map((session) => (
                          <div key={session.id} className="group p-4 sm:p-5 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 transition-all shadow-sm hover:shadow">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <p className="text-sm sm:text-base font-semibold text-slate-700 group-hover:text-sky-800 leading-snug">
                                {session.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-sky-600 text-xs font-medium shrink-0 pt-0.5 transition-colors">
                                <FileText size={14} />
                                <span>{session.duration}</span>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
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

      </div>
    </section>
  );
}
