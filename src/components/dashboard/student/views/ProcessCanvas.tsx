import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, X, Edit3, Trash2, ArrowLeft, ZoomIn, ZoomOut, Maximize2,
  Layers, GitBranch, Database, FileText,
  Zap, Target, RotateCcw, Square, CheckSquare, Info,
  ChevronDown, ChevronUp, ArrowRight, AlertTriangle, CheckCircle2,
  LogIn, LogOut as LogOutIcon, List, Eye, EyeOff, Save, Loader2,
  Sparkles, ClipboardCopy, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrCreateCanvas, saveCanvas } from '../../../../lib/canvas';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Node types map directly onto Karpathy's SPEC method: every non-terminal
 * block IS one of the six SPEC facets (Objetivo, Entradas, Pasos, Salidas,
 * Criterios de Éxito, Modos de Fallo). Legacy shape types are kept only so
 * canvases created before this model still render without crashing.
 */
type SpecNodeType = 'objective' | 'inputs' | 'steps' | 'outputs' | 'success' | 'failures';
type LegacyNodeType = 'process' | 'decision' | 'document' | 'database' | 'action' | 'note';
type NodeType = 'start' | 'end' | SpecNodeType | LegacyNodeType;

interface CanvasNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  title: string;
  color: string;
  content: string;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

interface SpecSection {
  key: SpecNodeType;
  label: string;
  icon: React.ElementType;
  color: string;
  question: string;
  placeholder: string;
}

/** The six steps of Karpathy's SPEC method, in order. This is the single source of truth for both the block palette and the progress bar. */
const SPEC_SECTIONS: SpecSection[] = [
  { key: 'objective', label: 'Objetivo',           icon: Target,       color: '#3b82f6', question: '¿Qué hace exactamente este paso? (una sola oración clara)', placeholder: 'Ej: Validar la identidad del usuario antes de permitir el acceso al sistema...' },
  { key: 'inputs',    label: 'Entradas',            icon: LogIn,        color: '#22c55e', question: '¿Qué información, datos o artefactos entran a este paso?', placeholder: 'Ej: Correo y contraseña ingresados por el usuario...' },
  { key: 'steps',     label: 'Pasos',               icon: List,         color: '#8b5cf6', question: '¿Cuál es esta sub-acción concreta dentro del proceso?', placeholder: 'Ej: Verificar el hash de la contraseña contra la base de datos...' },
  { key: 'outputs',   label: 'Salidas',             icon: LogOutIcon,   color: '#06b6d4', question: '¿Qué produce este paso? ¿Qué sale como resultado?', placeholder: 'Ej: Token de sesión firmado...' },
  { key: 'success',   label: 'Criterios de Éxito',  icon: CheckCircle2, color: '#10b981', question: '¿Cómo sabes que funcionó correctamente?', placeholder: 'Ej: El usuario accede al dashboard en menos de 2 segundos...' },
  { key: 'failures',  label: 'Modos de Fallo',      icon: AlertTriangle, color: '#ef4444', question: '¿Qué puede salir mal? ¿Cuál es este riesgo o error?', placeholder: 'Ej: Contraseña incorrecta tras 5 intentos bloquea la cuenta...' },
];

const NODE_TYPES: Record<NodeType, { label: string; icon: React.ElementType; defaultColor: string }> = {
  start: { label: 'Inicio', icon: Zap, defaultColor: '#22c55e' },
  end:   { label: 'Fin',    icon: Target, defaultColor: '#ef4444' },
  ...Object.fromEntries(SPEC_SECTIONS.map(s => [s.key, { label: s.label, icon: s.icon, defaultColor: s.color }])),
  // Legacy shape types — no longer offered in the palette, kept only so old canvases don't crash on render.
  process:  { label: 'Proceso',   icon: Square,      defaultColor: '#3b82f6' },
  decision: { label: 'Decisión',  icon: GitBranch,   defaultColor: '#f59e0b' },
  document: { label: 'Documento', icon: FileText,    defaultColor: '#8b5cf6' },
  database: { label: 'Datos',     icon: Database,    defaultColor: '#06b6d4' },
  action:   { label: 'Acción',    icon: CheckSquare, defaultColor: '#ec4899' },
  note:     { label: 'Nota',      icon: Info,        defaultColor: '#94a3b8' },
} as Record<NodeType, { label: string; icon: React.ElementType; defaultColor: string }>;

/** Order in which block types appear in the left palette: Inicio, the six Karpathy steps, Fin. */
const PALETTE_TYPES: NodeType[] = ['start', ...SPEC_SECTIONS.map(s => s.key), 'end'];

const PALETTE_COLORS = [
  '#3b82f6','#22c55e','#ef4444','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#94a3b8',
  '#0ea5e9','#10b981','#f97316','#a855f7','#14b8a6','#f43f5e','#334155','#1e293b',
];

const NODE_CARD_W = 200;
const NODE_CARD_H = 150; // collapsed height

function getId() { return Math.random().toString(36).slice(2, 9); }

function isTerminalType(type: NodeType) {
  return type === 'start' || type === 'end';
}

function getNodeCenter(node: CanvasNode) {
  const isTerminal = isTerminalType(node.type);
  const w = isTerminal ? 140 : NODE_CARD_W;
  const h = isTerminal ? 80 : NODE_CARD_H;
  return { x: node.x + w / 2, y: node.y + h / 2 };
}

/** A block is "complete" when its single SPEC facet has content written in. */
function isNodeComplete(node: CanvasNode): boolean {
  if (isTerminalType(node.type)) return true;
  return node.content.trim().length > 0;
}

// ─── Consultant Prompt Generator ──────────────────────────────────────────────

function groupNodesBySection(nodes: CanvasNode[]) {
  return SPEC_SECTIONS.map(sec => ({
    section: sec,
    items: nodes.filter(n => n.type === sec.key),
  }));
}

function generateConsultantPrompt(canvasName: string, nodes: CanvasNode[], connections: Connection[]): string {
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const nodeLabel = (n: CanvasNode) => n.title || NODE_TYPES[n.type].label;

  const specText = groupNodesBySection(nodes).map(({ section, items }) => {
    if (items.length === 0) return `**${section.label}:** _sin bloques definidos_`;
    return `**${section.label}:**\n${items.map(n => `- ${n.content || '(sin contenido)'}`).join('\n')}`;
  }).join('\n\n');

  const flowText = connections.length > 0
    ? connections.map(c => {
        const from = nodeById.get(c.fromId);
        const to = nodeById.get(c.toId);
        const fromLabel = from ? nodeLabel(from) : '?';
        const toLabel = to ? nodeLabel(to) : '?';
        return `- ${fromLabel} → ${toLabel}${c.label ? ` (${c.label})` : ''}`;
      }).join('\n')
    : '(Sin conexiones definidas todavía)';

  return `Eres un consultor senior de transformación digital especializado en automatización de procesos con agentes de IA (agentes LLM con herramientas/function-calling, RPA, human-in-the-loop).

Te entrego un proceso de negocio llamado "${canvasName}", especificado con el método SPEC de Andrej Karpathy (Objetivo → Entradas → Pasos → Salidas → Criterios de Éxito → Modos de Fallo).

## Especificación (SPEC)

${specText}

## Flujo / conexiones entre bloques

${flowText}

## Lo que necesito de ti

Actuando como consultor, evalúa este proceso y entrega:

1. **Diagnóstico por sección**: para cada Paso definido, indica si es candidato a automatizarse con un agente de IA, qué tipo de agente sería el adecuado (conversacional, con herramientas/function-calling, RPA determinista, o si debe seguir siendo humano) y por qué.
2. **Riesgos si se automatiza**: qué podría salir mal (alucinaciones, decisiones irreversibles, falta de contexto) usando como referencia los "Modos de Fallo" ya definidos, y qué controles se necesitarían (aprobación humana, límites de acción, logging/auditoría).
3. **Rediseño del proceso con agentes de IA**: propone un nuevo flujo señalando qué pasos pasan a ejecutarse con agentes, cuáles siguen siendo humanos, y dónde deben existir puntos de control o aprobación.
4. **Priorización**: ordena las oportunidades de automatización por impacto (tiempo/costo ahorrado) vs. esfuerzo de implementación (bajo/medio/alto).
5. **Plan de acción**: qué implementarías primero como piloto y qué necesitarías (datos, integraciones, herramientas, permisos) para lograrlo.

Sé específico y crítico: no asumas que todo debe automatizarse, señala explícitamente qué pasos deben seguir siendo humanos y por qué.`;
}

// ─── SPEC Document Generator ───────────────────────────────────────────────────

function generateSpecDocument(canvasName: string, nodes: CanvasNode[], connections: Connection[]): string {
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const nodeLabel = (n: CanvasNode) => n.title || NODE_TYPES[n.type].label;
  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const specText = groupNodesBySection(nodes).map(({ section, items }, i) => {
    const heading = `## ${i + 1}. ${section.label}`;
    if (items.length === 0) return `${heading}\n\n_Sin bloques definidos._`;
    const ordered = section.key === 'steps';
    const list = items.map((n, idx) => `${ordered ? `${idx + 1}.` : '-'} ${n.content || '_sin contenido_'}`).join('\n');
    return `${heading}\n\n${list}`;
  }).join('\n\n');

  const flowText = connections.length > 0
    ? connections.map(c => {
        const from = nodeById.get(c.fromId);
        const to = nodeById.get(c.toId);
        return `- ${from ? nodeLabel(from) : '?'} → ${to ? nodeLabel(to) : '?'}${c.label ? ` (${c.label})` : ''}`;
      }).join('\n')
    : '_Sin conexiones definidas todavía._';

  return `# ${canvasName}

**Documento de Especificación de Proceso**
Método SPEC (Objetivo → Entradas → Pasos → Salidas → Criterios de Éxito → Modos de Fallo) — Andrej Karpathy
Generado el ${today}

## Flujo del proceso

${flowText}

${specText}
`;
}

// ─── Arrow ───────────────────────────────────────────────────────────────────

function ArrowLine({ from, to, label, selected, onClick }: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  selected: boolean;
  onClick: () => void;
}) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const cx1 = from.x + dx * 0.4;
  const cx2 = to.x - dx * 0.4;
  const d = `M ${from.x} ${from.y} C ${cx1} ${from.y}, ${cx2} ${to.y}, ${to.x} ${to.y}`;

  return (
    <g onClick={onClick} className="cursor-pointer">
      <path d={d} fill="none" stroke="transparent" strokeWidth={16} />
      <path d={d} fill="none" stroke={selected ? '#38bdf8' : '#94a3b8'}
        strokeWidth={selected ? 2.5 : 1.5} markerEnd="url(#arrowhead)" className="transition-all" />
      {label && (
        <>
          <rect x={mx - 24} y={my - 10} width={48} height={18} rx={6} fill="white" stroke="#e2e8f0" />
          <text x={mx} y={my + 4} textAnchor="middle" fontSize={10} fill="#475569" fontWeight={700}>{label}</text>
        </>
      )}
    </g>
  );
}

// ─── SPEC Card ───────────────────────────────────────────────────────────────

function SpecCardNode({ node, selected, connectingFrom, complete, onMouseDown, onStartConnect, onDelete, onEdit }: {
  node: CanvasNode;
  selected: boolean;
  connectingFrom: boolean;
  complete: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onStartConnect: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const cfg = NODE_TYPES[node.type];
  const Icon = cfg.icon;
  const isTerminal = isTerminalType(node.type);
  const cardHeight = isTerminal ? 80 : NODE_CARD_H;

  return (
    <foreignObject
      x={node.x} y={node.y}
      width={isTerminal ? 140 : NODE_CARD_W}
      height={cardHeight}
      style={{ overflow: 'visible' }}
    >
      <div
        onMouseDown={onMouseDown}
        className="relative select-none group"
        style={{ width: isTerminal ? 140 : NODE_CARD_W, height: cardHeight, cursor: 'grab' }}
      >
        <div
          className={`absolute inset-0 ${isTerminal ? 'rounded-full' : 'rounded-2xl'} border-2 bg-white transition-all duration-200`}
          style={{
            borderColor: selected ? '#38bdf8' : !isTerminal && !complete ? '#f59e0b80' : `${node.color}50`,
            boxShadow: selected
              ? `0 0 0 3px #38bdf820, 0 8px 32px ${node.color}25`
              : `0 2px 12px ${node.color}15, 0 1px 3px rgba(0,0,0,0.06)`,
          }}
        />

        {/* Completeness badge */}
        {!isTerminal && (
          <div
            className={`absolute -top-2.5 left-1 z-20 w-5 h-5 rounded-full border shadow-sm flex items-center justify-center ${
              complete ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'
            }`}
            title={complete ? 'Bloque completo' : 'Falta escribir el contenido de este bloque'}
          >
            {complete
              ? <CheckCircle2 size={10} className="text-emerald-500" />
              : <AlertTriangle size={10} className="text-amber-500" />}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center gap-2 px-3 py-2.5 ${isTerminal ? 'justify-center h-full' : 'border-b border-slate-100'}`}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${node.color}20`, color: node.color }}>
              <Icon size={12} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-slate-800 leading-tight truncate">{node.title || cfg.label}</p>
              {!isTerminal && (
                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: node.color }}>{cfg.label}</p>
              )}
            </div>
            {!isTerminal && (
              <button onMouseDown={e => { e.stopPropagation(); onEdit(); }}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all">
                <Edit3 size={10} />
              </button>
            )}
          </div>

          {/* Content preview */}
          {!isTerminal && (
            <div className="flex-1 overflow-hidden px-3 pb-3 pt-2">
              {node.content ? (
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-4">{node.content}</p>
              ) : (
                <p className="text-[10px] text-slate-300 italic">Sin definir todavía...</p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        {!isTerminal && (
          <div className={`absolute -top-2.5 right-1 z-20 flex gap-1 transition-all duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <button onMouseDown={e => { e.stopPropagation(); onEdit(); }}
              className="w-5 h-5 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-sky-500 hover:border-sky-300 transition-colors">
              <Edit3 size={8} />
            </button>
            <button onMouseDown={e => { e.stopPropagation(); onDelete(); }}
              className="w-5 h-5 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors">
              <Trash2 size={8} />
            </button>
          </div>
        )}

        {/* Connect handle (right side) */}
        <button
          onMouseDown={e => { e.stopPropagation(); onStartConnect(); }}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-all duration-200 shadow-sm ${
            connectingFrom
              ? 'opacity-100 border-sky-500'
              : 'opacity-0 group-hover:opacity-100 border-slate-300 hover:border-sky-400'
          }`}
          title="Conectar"
        >
          <ArrowRight size={10} className={connectingFrom ? 'text-sky-500' : 'text-slate-400'} />
        </button>
      </div>
    </foreignObject>
  );
}

// ─── Node Edit Modal ──────────────────────────────────────────────────────────

function NodeEditModal({ node, onSave, onClose }: {
  node: CanvasNode;
  onSave: (updates: Partial<CanvasNode>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(node.title);
  const [color, setColor] = useState(node.color);
  const [type, setType] = useState<NodeType>(node.type);
  const [content, setContent] = useState(node.content);

  const section = SPEC_SECTIONS.find(s => s.key === type);
  const cfg = NODE_TYPES[type];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, color }}>
              <cfg.icon size={16} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{cfg.label}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Método SPEC de Andrej Karpathy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Type switcher */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo de bloque</p>
            <div className="grid grid-cols-4 gap-1">
              {PALETTE_TYPES.map(key => {
                const c = NODE_TYPES[key];
                return (
                  <button key={key} onClick={() => setType(key)} title={c.label}
                    className={`flex items-center justify-center p-1.5 rounded-lg border transition-all ${type === key ? 'border-sky-400 bg-sky-50' : 'border-slate-100 hover:border-slate-300'}`}
                    style={{ color: type === key ? c.defaultColor : '#94a3b8' }}>
                    <c.icon size={13} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre corto</p>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
              placeholder={cfg.label} />
          </div>

          {/* Color */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Color</p>
            <div className="flex flex-wrap gap-1.5">
              {PALETTE_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-slate-700 scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Content — only for the six Karpathy SPEC block types; legacy/terminal types have nothing to fill in */}
          {section && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <section.icon size={13} style={{ color: section.color }} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{section.label}</p>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">{section.question}</p>
              <textarea
                autoFocus
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                placeholder={section.placeholder}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex-1 text-[10px] text-slate-400">
            💡 Cada bloque es una de las seis secciones del método SPEC
          </div>
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
          <button onClick={() => { onSave({ title, color, type, content }); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg">
            Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Generic Text Output Modal (AI prompt / SPEC document) ────────────────────

function TextModal({ title, subtitle, icon: Icon, accentClass, text, downloadFileName, onClose }: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accentClass: string;
  text: string;
  downloadFileName?: string;
  onClose: () => void;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar. Selecciona el texto manualmente.');
    }
  };

  const handleDownload = () => {
    if (!downloadFileName) return;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accentClass}`}>
              <Icon size={16} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{title}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <textarea
            readOnly
            value={text}
            className="w-full h-80 px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
            onClick={e => (e.target as HTMLTextAreaElement).select()}
          />
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex-1 text-[10px] text-slate-400">
            💡 Generado a partir de los bloques y conexiones de tu canvas actual
          </div>
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            Cerrar
          </button>
          {downloadFileName && (
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              <Download size={13} /> Descargar .md
            </button>
          )}
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors shadow-lg">
            <ClipboardCopy size={13} /> Copiar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_NODES: CanvasNode[] = [];

const INITIAL_CONNECTIONS: Connection[] = [];

// ─── Main Canvas ─────────────────────────────────────────────────────────────

interface ProcessCanvasProps {
  onBack: () => void;
  courseId?: string;
}

export function ProcessCanvas({ onBack, courseId }: ProcessCanvasProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<CanvasNode | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.75);
  const [pan, setPan] = useState({ x: 40, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [canvasName, setCanvasName] = useState('Canvas de Procesos');
  const [editingName, setEditingName] = useState(false);
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [loadingCanvas, setLoadingCanvas] = useState(true);
  const [savingCanvas, setSavingCanvas] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');

  // Load canvas from Supabase on mount
  useEffect(() => {
    getOrCreateCanvas(courseId)
      .then(({ canvas, nodes: dbNodes, connections: dbConns }) => {
        setCanvasId(canvas.id);
        setCanvasName(canvas.name);
        setZoom(canvas.zoom ?? 0.75);
        setPan({ x: canvas.pan_x ?? 40, y: canvas.pan_y ?? 20 });

        if (dbNodes.length > 0) {
          setNodes(dbNodes.map(n => ({
            id: n.node_key,
            type: n.type as NodeType,
            x: n.pos_x,
            y: n.pos_y,
            title: n.title,
            color: n.color,
            content: n.spec_objective ?? '',
          })));
        }

        if (dbConns.length > 0) {
          setConnections(dbConns.map(c => ({
            id: c.conn_key,
            fromId: c.from_node,
            toId: c.to_node,
            label: c.label ?? '',
          })));
        }
      })
      .catch(err => {
        console.error('Error cargando canvas:', err);
        toast.error('No se pudo cargar el canvas');
      })
      .finally(() => setLoadingCanvas(false));
  }, [courseId]);

  // Save canvas to Supabase
  const handleSave = useCallback(async () => {
    if (!canvasId) return;
    setSavingCanvas(true);
    try {
      await saveCanvas({
        canvasId,
        name: canvasName,
        zoom,
        panX: pan.x,
        panY: pan.y,
        nodes: nodes.map(n => ({
          node_key:      n.id,
          type:          n.type,
          title:         n.title,
          color:         n.color,
          pos_x:         n.x,
          pos_y:         n.y,
          spec_objective: n.content,
          spec_inputs:   [],
          spec_steps:    [],
          spec_outputs:  [],
          spec_success:  [],
          spec_failures: [],
        })),
        connections: connections.map(c => ({
          conn_key:  c.id,
          from_node: c.fromId,
          to_node:   c.toId,
          label:     c.label ?? '',
        })),
      });
      toast.success('Canvas guardado correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar el canvas');
    } finally {
      setSavingCanvas(false);
    }
  }, [canvasId, canvasName, zoom, pan, nodes, connections]);

  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<{ id: string; startX: number; startY: number; nodeX: number; nodeY: number } | null>(null);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const onNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        setConnections(prev => [...prev, { id: getId(), fromId: connectingFrom, toId: nodeId }]);
      }
      setConnectingFrom(null);
      return;
    }
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setSelectedConnId(null);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    draggingRef.current = { id: nodeId, startX: e.clientX, startY: e.clientY, nodeX: node.x, nodeY: node.y };
  }, [connectingFrom, nodes]);

  const onSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const dragging = draggingRef.current;
    if (dragging) {
      const dx = (e.clientX - dragging.startX) / zoom;
      const dy = (e.clientY - dragging.startY) / zoom;
      setNodes(prev => prev.map(n =>
        n.id === dragging.id
          ? { ...n, x: Math.max(0, dragging.nodeX + dx), y: Math.max(0, dragging.nodeY + dy) }
          : n
      ));
    }
    if (panStartRef.current) {
      setPan({
        x: panStartRef.current.panX + (e.clientX - panStartRef.current.x),
        y: panStartRef.current.panY + (e.clientY - panStartRef.current.y),
      });
    }
  }, [zoom]);

  const onSvgMouseUp = useCallback(() => {
    draggingRef.current = null;
    panStartRef.current = null;
    setIsPanning(false);
  }, []);

  const onSvgMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
      setSelectedNodeId(null);
      setSelectedConnId(null);
      if (e.altKey || e.button === 1) {
        setIsPanning(true);
        panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      }
      if (!e.altKey && e.button === 0) setConnectingFrom(null);
    }
  }, [pan]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(2, Math.max(0.25, z + (e.deltaY > 0 ? -0.06 : 0.06))));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConnectingFrom(null);
      if ((e.key === 'Delete' || e.key === 'Backspace') && !editingNode && !editingName) {
        if (selectedNodeId) {
          setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
          setConnections(prev => prev.filter(c => c.fromId !== selectedNodeId && c.toId !== selectedNodeId));
          setSelectedNodeId(null);
        }
        if (selectedConnId) {
          setConnections(prev => prev.filter(c => c.id !== selectedConnId));
          setSelectedConnId(null);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, selectedConnId, editingNode, editingName]);

  const handleGeneratePrompt = () => {
    if (nodes.length === 0) {
      toast.error('Agrega al menos un bloque al canvas primero');
      return;
    }
    setGeneratedPrompt(generateConsultantPrompt(canvasName, nodes, connections));
    setShowPromptModal(true);
  };

  const handleExportDoc = () => {
    if (nodes.length === 0) {
      toast.error('Agrega al menos un bloque al canvas primero');
      return;
    }
    setGeneratedDoc(generateSpecDocument(canvasName, nodes, connections));
    setShowDocModal(true);
  };

  const addNode = (type: NodeType) => {
    const cfg = NODE_TYPES[type];
    const newNode: CanvasNode = {
      id: getId(), type,
      x: (200 + Math.random() * 300) / zoom,
      y: (150 + Math.random() * 200) / zoom,
      title: cfg.label,
      color: cfg.defaultColor,
      content: '',
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    if (!isTerminalType(type)) {
      setTimeout(() => setEditingNode(newNode), 50);
    }
  };

  const sectionStats = SPEC_SECTIONS.map(sec => {
    const items = nodes.filter(n => n.type === sec.key);
    const done = items.filter(n => n.content.trim().length > 0).length;
    return { ...sec, total: items.length, done };
  });

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] font-sans"
      style={{ cursor: isPanning ? 'grabbing' : connectingFrom ? 'crosshair' : 'default' }}>

      {/* TOP BAR */}
      <header className="flex items-center gap-3 px-5 h-14 bg-white border-b border-slate-200 shrink-0 z-10 shadow-sm">

        {editingName ? (
          <input autoFocus value={canvasName} onChange={e => setCanvasName(e.target.value)}
            onBlur={() => setEditingName(false)} onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
            className="text-sm font-black text-slate-800 bg-transparent focus:outline-none border-b-2 border-sky-400 px-1" />
        ) : (
          <button onClick={() => setEditingName(true)} className="flex items-center gap-2 group">
            <Layers size={14} className="text-sky-500" />
            <span className="text-sm font-black text-slate-800 group-hover:text-sky-600 transition-colors">{canvasName}</span>
            <Edit3 size={11} className="text-slate-300 group-hover:text-sky-400 transition-colors" />
          </button>
        )}

        <div className="flex-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all">
            <ZoomOut size={13} />
          </button>
          <span className="text-xs font-bold text-slate-600 w-9 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all">
            <ZoomIn size={13} />
          </button>
          <button onClick={() => { setZoom(0.75); setPan({ x: 40, y: 20 }); }} className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all ml-1">
            <Maximize2 size={13} />
          </button>
        </div>

        <button
          onClick={handleExportDoc}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all"
        >
          <FileText size={13} />
          Exportar SPEC
        </button>

        <button
          onClick={handleGeneratePrompt}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all shadow"
        >
          <Sparkles size={13} />
          Evaluar con IA
        </button>

        <button
          onClick={handleSave}
          disabled={savingCanvas || loadingCanvas}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow disabled:opacity-60"
        >
          {savingCanvas ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {savingCanvas ? 'Guardando...' : 'Guardar Canvas'}
        </button>
      </header>

      {/* SPEC PROGRESS BAR */}
      <div className="flex items-center gap-2 px-5 h-12 bg-white border-b border-slate-200 shrink-0 overflow-x-auto">
        {sectionStats.map(sec => {
          const Icon = sec.icon;
          const isEmpty = sec.total === 0;
          const pct = sec.total > 0 ? Math.round((sec.done / sec.total) * 100) : 0;
          return (
            <div key={sec.key}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl shrink-0 ${isEmpty ? 'opacity-40' : ''}`}
              style={{ background: `${sec.color}0d` }}
              title={`${sec.label}: ${sec.done}/${sec.total} bloques completos`}
            >
              <Icon size={12} style={{ color: sec.color }} />
              <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{sec.label}</span>
              <span className="text-[10px] font-black whitespace-nowrap" style={{ color: sec.color }}>{sec.done}/{sec.total}</span>
              <div className="w-10 h-1 rounded-full bg-slate-200 overflow-hidden shrink-0">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: sec.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <aside className="w-52 bg-white border-r border-slate-200 flex flex-col py-4 px-3 gap-1.5 overflow-y-auto shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-1">Bloques del método Karpathy</p>
          {PALETTE_TYPES.map(type => {
            const cfg = NODE_TYPES[type];
            const Icon = cfg.icon;
            return (
              <button key={type} onClick={() => addNode(type)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-left group">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${cfg.defaultColor}18`, color: cfg.defaultColor }}>
                  <Icon size={13} />
                </div>
                <span className="text-xs font-bold text-slate-700">{cfg.label}</span>
                <Plus size={11} className="ml-auto text-slate-300 group-hover:text-sky-400 transition-colors" />
              </button>
            );
          })}

          <div className="border-t border-slate-100 mt-3 pt-3 px-2 space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Atajos</p>
            {[
              ['Clic en nodo', 'Seleccionar'],
              ['⊕ handle', 'Conectar'],
              ['Alt+Drag', 'Mover vista'],
              ['Scroll', 'Zoom'],
              ['Del', 'Eliminar'],
              ['Esc', 'Cancelar'],
            ].map(([k, a]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500">{a}</span>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">{k}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* CANVAS SVG */}
        <div className="flex-1 relative overflow-hidden">
          <svg ref={svgRef}
            className="absolute inset-0 w-full h-full"
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseDown={onSvgMouseDown}
            onWheel={onWheel}
          >
            <defs>
              <pattern id="dots" width={24 * zoom} height={24 * zoom} patternUnits="userSpaceOnUse"
                x={pan.x % (24 * zoom)} y={pan.y % (24 * zoom)}>
                <circle cx={1} cy={1} r={1} fill="#cbd5e1" opacity={0.5} />
              </pattern>
              <marker id="arrowhead" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="#94a3b8" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Connections */}
              {connections.map(conn => {
                const from = nodes.find(n => n.id === conn.fromId);
                const to = nodes.find(n => n.id === conn.toId);
                if (!from || !to) return null;
                return (
                  <ArrowLine key={conn.id}
                    from={getNodeCenter(from)} to={getNodeCenter(to)}
                    label={conn.label}
                    selected={selectedConnId === conn.id}
                    onClick={() => { setSelectedConnId(conn.id); setSelectedNodeId(null); }}
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map(node => (
                <SpecCardNode key={node.id}
                  node={node}
                  selected={selectedNodeId === node.id}
                  connectingFrom={connectingFrom === node.id}
                  complete={isNodeComplete(node)}
                  onMouseDown={e => onNodeMouseDown(e, node.id)}
                  onStartConnect={() => setConnectingFrom(node.id)}
                  onDelete={() => {
                    setNodes(prev => prev.filter(n => n.id !== node.id));
                    setConnections(prev => prev.filter(c => c.fromId !== node.id && c.toId !== node.id));
                    setSelectedNodeId(null);
                  }}
                  onEdit={() => setEditingNode(node)}
                />
              ))}
            </g>
          </svg>

          {/* Connecting hint */}
          <AnimatePresence>
            {connectingFrom && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 pointer-events-none">
                <ArrowRight size={13} />
                Haz clic en otro bloque para conectar · ESC para cancelar
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connection delete bar */}
          <AnimatePresence>
            {selectedConnId && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Conexión seleccionada</span>
                <button onClick={() => { setConnections(prev => prev.filter(c => c.id !== selectedConnId)); setSelectedConnId(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors">
                  <Trash2 size={11} /> Eliminar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Node Edit Modal */}
      <AnimatePresence>
        {editingNode && (
          <NodeEditModal
            node={editingNode}
            onSave={updates => {
              setNodes(prev => prev.map(n => n.id === editingNode.id ? { ...n, ...updates } : n));
            }}
            onClose={() => setEditingNode(null)}
          />
        )}
      </AnimatePresence>

      {/* AI Consultant Prompt Modal */}
      <AnimatePresence>
        {showPromptModal && (
          <TextModal
            title="Prompt para evaluación con IA"
            subtitle="Cópialo y pégalo en Claude para una evaluación de consultoría"
            icon={Sparkles}
            accentClass="bg-violet-100 text-violet-600"
            text={generatedPrompt}
            onClose={() => setShowPromptModal(false)}
          />
        )}
      </AnimatePresence>

      {/* SPEC Document Export Modal */}
      <AnimatePresence>
        {showDocModal && (
          <TextModal
            title="Documento SPEC"
            subtitle="Especificación completa del proceso, lista para compartir o archivar"
            icon={FileText}
            accentClass="bg-sky-100 text-sky-600"
            text={generatedDoc}
            downloadFileName={`${canvasName || 'canvas'}-spec.md`}
            onClose={() => setShowDocModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
