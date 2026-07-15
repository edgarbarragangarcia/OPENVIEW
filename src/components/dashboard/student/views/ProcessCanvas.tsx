import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, X, Edit3, Trash2, ArrowLeft, ZoomIn, ZoomOut, Maximize2,
  Layers, GitBranch, Database, FileText,
  Zap, Target, RotateCcw, Square, CheckSquare, Info,
  ChevronDown, ChevronUp, ArrowRight, AlertTriangle, CheckCircle2,
  LogIn, LogOut as LogOutIcon, List, Eye, EyeOff, Save, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrCreateCanvas, saveCanvas } from '../../../../lib/canvas';

// ─── Types ───────────────────────────────────────────────────────────────────

type NodeType = 'process' | 'decision' | 'start' | 'end' | 'document' | 'database' | 'action' | 'note';

/**
 * SPEC format based on Karpathy's structured specification method.
 * Each field maps to: Purpose → Inputs → Steps → Outputs → Success → Failures
 */
interface NodeSpec {
  objective: string;      // One-line purpose: "What does this do?"
  inputs: string[];       // What enters this step
  steps: string[];        // Ordered list of sub-steps or actions
  outputs: string[];      // What comes out of this step
  success: string[];      // How to know it worked
  failures: string[];     // What can go wrong / failure modes
}

interface CanvasNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  title: string;
  color: string;
  spec: NodeSpec;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const NODE_TYPES: Record<NodeType, { label: string; icon: React.ElementType; defaultColor: string }> = {
  start:    { label: 'Inicio',      icon: Zap,          defaultColor: '#22c55e' },
  end:      { label: 'Fin',         icon: Target,        defaultColor: '#ef4444' },
  process:  { label: 'Proceso',     icon: Square,        defaultColor: '#3b82f6' },
  decision: { label: 'Decisión',    icon: GitBranch,     defaultColor: '#f59e0b' },
  document: { label: 'Documento',   icon: FileText,      defaultColor: '#8b5cf6' },
  database: { label: 'Datos',       icon: Database,      defaultColor: '#06b6d4' },
  action:   { label: 'Acción',      icon: CheckSquare,   defaultColor: '#ec4899' },
  note:     { label: 'Nota',        icon: Info,          defaultColor: '#94a3b8' },
};

const PALETTE_COLORS = [
  '#3b82f6','#22c55e','#ef4444','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#94a3b8',
  '#0ea5e9','#10b981','#f97316','#a855f7','#14b8a6','#f43f5e','#334155','#1e293b',
];

const EMPTY_SPEC: NodeSpec = {
  objective: '',
  inputs: [''],
  steps: [''],
  outputs: [''],
  success: [''],
  failures: [''],
};

function makeSpec(overrides: Partial<NodeSpec> = {}): NodeSpec {
  return { ...EMPTY_SPEC, ...overrides };
}

const NODE_CARD_W = 280;
const NODE_CARD_H = 220; // collapsed height

function getId() { return Math.random().toString(36).slice(2, 9); }

function getNodeCenter(node: CanvasNode) {
  const isTerminal = node.type === 'start' || node.type === 'end';
  const w = isTerminal ? 140 : NODE_CARD_W;
  const h = isTerminal ? 80 : NODE_CARD_H;
  return { x: node.x + w / 2, y: node.y + h / 2 };
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

interface SpecSection {
  key: keyof NodeSpec;
  label: string;
  icon: React.ElementType;
  color: string;
  plural: boolean;
}

const SPEC_SECTIONS: SpecSection[] = [
  { key: 'objective', label: 'Objetivo',            icon: Target,         color: '#3b82f6', plural: false },
  { key: 'inputs',    label: 'Entradas',             icon: LogIn,          color: '#22c55e', plural: true  },
  { key: 'steps',     label: 'Pasos',                icon: List,           color: '#8b5cf6', plural: true  },
  { key: 'outputs',   label: 'Salidas',              icon: LogOutIcon,     color: '#06b6d4', plural: true  },
  { key: 'success',   label: 'Criterios de Éxito',   icon: CheckCircle2,   color: '#10b981', plural: true  },
  { key: 'failures',  label: 'Modos de Fallo',       icon: AlertTriangle,  color: '#ef4444', plural: true  },
];

function SpecCardNode({ node, selected, connectingFrom, onMouseDown, onStartConnect, onDelete, onEdit }: {
  node: CanvasNode;
  selected: boolean;
  connectingFrom: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onStartConnect: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = NODE_TYPES[node.type];
  const Icon = cfg.icon;
  const isTerminal = node.type === 'start' || node.type === 'end';

  const renderSpecPreview = () => {
    if (isTerminal) return null;
    const obj = node.spec.objective;
    return (
      <div className="px-3 pb-3 space-y-2">
        {/* Objective */}
        {obj ? (
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: '#3b82f615', color: '#3b82f6' }}>
              <Target size={8} />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{obj}</p>
          </div>
        ) : (
          <p className="text-[10px] text-slate-300 italic">Sin objetivo definido...</p>
        )}

        {/* Mini badge pills */}
        <div className="flex flex-wrap gap-1">
          {node.spec.inputs.filter(Boolean).slice(0, 2).map((inp, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: '#22c55e15', color: '#16a34a' }}>↓ {inp}</span>
          ))}
          {node.spec.outputs.filter(Boolean).slice(0, 2).map((out, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: '#06b6d415', color: '#0891b2' }}>↑ {out}</span>
          ))}
        </div>
        {/* Steps count */}
        {node.spec.steps.filter(Boolean).length > 0 && (
          <div className="flex items-center gap-1">
            <List size={9} className="text-slate-400" />
            <span className="text-[9px] text-slate-400">{node.spec.steps.filter(Boolean).length} paso(s) definidos</span>
          </div>
        )}
      </div>
    );
  };

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
            borderColor: selected ? '#38bdf8' : `${node.color}50`,
            boxShadow: selected
              ? `0 0 0 3px #38bdf820, 0 8px 32px ${node.color}25`
              : `0 2px 12px ${node.color}15, 0 1px 3px rgba(0,0,0,0.06)`,
          }}
        />

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

          {/* SPEC Preview (collapsed) */}
          {!isTerminal && (
            <div className="flex-1 overflow-hidden">
              {renderSpecPreview()}
            </div>
          )}
        </div>

        {/* Controls */}
        {!isTerminal && (
          <div className={`absolute -top-2.5 right-1 flex gap-1 transition-all duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
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
          className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-all duration-200 shadow-sm ${
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

// ─── SPEC Edit Modal ──────────────────────────────────────────────────────────

function SpecEditModal({ node, onSave, onClose }: {
  node: CanvasNode;
  onSave: (updates: Partial<CanvasNode>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(node.title);
  const [color, setColor] = useState(node.color);
  const [type, setType] = useState<NodeType>(node.type);
  const [spec, setSpec] = useState<NodeSpec>({ ...node.spec });
  const [activeSection, setActiveSection] = useState<keyof NodeSpec>('objective');

  const updateList = (key: keyof NodeSpec, idx: number, val: string) => {
    setSpec(prev => {
      const arr = [...(prev[key] as string[])];
      arr[idx] = val;
      return { ...prev, [key]: arr };
    });
  };

  const addItem = (key: keyof NodeSpec) => {
    setSpec(prev => ({ ...prev, [key]: [...(prev[key] as string[]), ''] }));
  };

  const removeItem = (key: keyof NodeSpec, idx: number) => {
    setSpec(prev => {
      const arr = (prev[key] as string[]).filter((_, i) => i !== idx);
      return { ...prev, [key]: arr.length === 0 ? [''] : arr };
    });
  };

  const activeSec = SPEC_SECTIONS.find(s => s.key === activeSection)!;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, color }}>
              {(() => { const Icon = NODE_TYPES[type].icon; return <Icon size={16} />; })()}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Editar SPEC</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Formato Karpathy · Especificación Estructurada</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: Meta & Section Nav */}
          <div className="w-52 border-r border-slate-100 flex flex-col shrink-0">
            {/* Title & Color */}
            <div className="p-4 space-y-3 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre</p>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  placeholder="Nombre del nodo..." />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo</p>
                <div className="grid grid-cols-4 gap-1">
                  {(Object.entries(NODE_TYPES) as [NodeType, typeof NODE_TYPES[NodeType]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={key} onClick={() => setType(key)} title={cfg.label}
                        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all ${type === key ? 'border-sky-400 bg-sky-50' : 'border-slate-100 hover:border-slate-300'}`}
                        style={{ color: type === key ? cfg.defaultColor : '#94a3b8' }}>
                        <Icon size={13} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {PALETTE_COLORS.slice(0, 8).map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-slate-700 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>

            {/* SPEC Section Nav */}
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 mb-2">Secciones SPEC</p>
              {SPEC_SECTIONS.map(sec => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.key;
                return (
                  <button key={sec.key} onClick={() => setActiveSection(sec.key)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                      isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
                    }`}>
                    <Icon size={12} style={{ color: isActive ? 'white' : sec.color }} />
                    <span className="text-[11px] font-bold">{sec.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Section Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5 mb-1">
                {(() => { const Icon = activeSec.icon; return <Icon size={16} style={{ color: activeSec.color }} />; })()}
                <h4 className="text-sm font-black text-slate-900">{activeSec.label}</h4>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeSection === 'objective' && '¿Qué hace exactamente este paso? (una sola oración clara)'}
                {activeSection === 'inputs'    && '¿Qué información, datos o artefactos entran a este paso?'}
                {activeSection === 'steps'     && '¿Cuáles son las sub-acciones ordenadas que se ejecutan?'}
                {activeSection === 'outputs'   && '¿Qué produce este paso? ¿Qué sale como resultado?'}
                {activeSection === 'success'   && '¿Cómo sabes que funcionó correctamente?'}
                {activeSection === 'failures'  && '¿Qué puede salir mal? ¿Cuáles son los riesgos o errores comunes?'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {activeSection === 'objective' ? (
                <textarea
                  value={spec.objective}
                  onChange={e => setSpec(prev => ({ ...prev, objective: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                  placeholder="Ej: Validar la identidad del usuario antes de permitir el acceso al sistema..."
                />
              ) : (
                <>
                  {(spec[activeSection] as string[]).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 group/item">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black shrink-0"
                        style={{ borderColor: `${activeSec.color}40`, color: activeSec.color }}>
                        {idx + 1}
                      </div>
                      <input
                        value={item}
                        onChange={e => updateList(activeSection, idx, e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder={`${activeSec.label.slice(0, -1)} ${idx + 1}...`}
                      />
                      <button onClick={() => removeItem(activeSection, idx)}
                        className="opacity-0 group-hover/item:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addItem(activeSection)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-sky-500 transition-colors mt-1 ml-7">
                    <Plus size={12} /> Agregar {activeSec.label.toLowerCase().replace('s de ', ' de ')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex-1 text-[10px] text-slate-400">
            💡 Método SPEC basado en el enfoque de especificación estructurada de Andrej Karpathy
          </div>
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
          <button onClick={() => { onSave({ title, color, type, spec }); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg">
            Guardar SPEC
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
            spec: {
              objective: n.spec_objective ?? '',
              inputs:   n.spec_inputs  ?? [''],
              steps:    n.spec_steps   ?? [''],
              outputs:  n.spec_outputs ?? [''],
              success:  n.spec_success ?? [''],
              failures: n.spec_failures ?? [''],
            },
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
          spec_objective: n.spec.objective,
          spec_inputs:   n.spec.inputs.filter(Boolean),
          spec_steps:    n.spec.steps.filter(Boolean),
          spec_outputs:  n.spec.outputs.filter(Boolean),
          spec_success:  n.spec.success.filter(Boolean),
          spec_failures: n.spec.failures.filter(Boolean),
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

  const addNode = (type: NodeType) => {
    const cfg = NODE_TYPES[type];
    const newNode: CanvasNode = {
      id: getId(), type,
      x: (200 + Math.random() * 300) / zoom,
      y: (150 + Math.random() * 200) / zoom,
      title: cfg.label,
      color: cfg.defaultColor,
      spec: makeSpec(),
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setTimeout(() => setEditingNode(newNode), 50);
  };

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

        {/* SPEC legend */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          {SPEC_SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex items-center gap-1" title={s.label}>
                <Icon size={11} style={{ color: s.color }} />
                <span className="text-[10px] font-bold text-slate-400">{s.label}</span>
              </div>
            );
          })}
        </div>

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
          onClick={handleSave}
          disabled={savingCanvas || loadingCanvas}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow disabled:opacity-60"
        >
          {savingCanvas ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {savingCanvas ? 'Guardando...' : 'Guardar Canvas'}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <aside className="w-52 bg-white border-r border-slate-200 flex flex-col py-4 px-3 gap-1.5 overflow-y-auto shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-1">Bloques SPEC</p>
          {(Object.entries(NODE_TYPES) as [NodeType, typeof NODE_TYPES[NodeType]][]).map(([type, cfg]) => {
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

          <div className="border-t border-slate-100 mt-3 pt-3 space-y-2 px-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Secciones SPEC</p>
            {SPEC_SECTIONS.map(sec => {
              const Icon = sec.icon;
              return (
                <div key={sec.key} className="flex items-center gap-2">
                  <Icon size={11} style={{ color: sec.color }} />
                  <span className="text-[10px] text-slate-500 font-semibold">{sec.label}</span>
                </div>
              );
            })}
          </div>

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

      {/* SPEC Edit Modal */}
      <AnimatePresence>
        {editingNode && (
          <SpecEditModal
            node={editingNode}
            onSave={updates => {
              setNodes(prev => prev.map(n => n.id === editingNode.id ? { ...n, ...updates } : n));
            }}
            onClose={() => setEditingNode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
