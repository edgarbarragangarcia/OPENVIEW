import { supabase } from './supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CanvasRecord {
  id: string;
  user_id: string;
  course_id: string | null;
  name: string;
  description: string | null;
  zoom: number;
  pan_x: number;
  pan_y: number;
  created_at: string;
  updated_at: string;
}

export interface NodeRecord {
  id: string;
  canvas_id: string;
  node_key: string;
  type: string;
  title: string;
  color: string;
  pos_x: number;
  pos_y: number;
  spec_objective: string;
  spec_inputs: string[];
  spec_steps: string[];
  spec_outputs: string[];
  spec_success: string[];
  spec_failures: string[];
}

export interface ConnectionRecord {
  id: string;
  canvas_id: string;
  conn_key: string;
  from_node: string;
  to_node: string;
  label: string;
}

export interface FullCanvas {
  canvas: CanvasRecord;
  nodes: NodeRecord[];
  connections: ConnectionRecord[];
}

// ─── Get or create user's canvas for a course ────────────────────────────────

export async function getOrCreateCanvas(courseId?: string): Promise<FullCanvas> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Try to find existing canvas for this user (+ optional course)
  let query = supabase
    .from('process_canvases')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (courseId) query = query.eq('course_id', courseId);

  const { data: canvases, error: fetchErr } = await query;
  if (fetchErr) throw fetchErr;

  let canvas: CanvasRecord;

  if (canvases && canvases.length > 0) {
    canvas = canvases[0] as CanvasRecord;
  } else {
    // Create a new canvas
    const { data: newCanvas, error: createErr } = await supabase
      .from('process_canvases')
      .insert({
        user_id: user.id,
        course_id: courseId ?? null,
        name: 'Mi Canvas de Procesos',
        zoom: 0.75,
        pan_x: 40,
        pan_y: 20,
      })
      .select()
      .single();

    if (createErr) throw createErr;
    canvas = newCanvas as CanvasRecord;
  }

  // Load nodes and connections
  const [{ data: nodes, error: nodesErr }, { data: connections, error: connsErr }] = await Promise.all([
    supabase.from('canvas_nodes').select('*').eq('canvas_id', canvas.id),
    supabase.from('canvas_connections').select('*').eq('canvas_id', canvas.id),
  ]);

  if (nodesErr) throw nodesErr;
  if (connsErr) throw connsErr;

  return {
    canvas,
    nodes: (nodes ?? []) as NodeRecord[],
    connections: (connections ?? []) as ConnectionRecord[],
  };
}

// ─── Save entire canvas (upsert approach) ────────────────────────────────────

export interface SaveCanvasPayload {
  canvasId: string;
  name: string;
  zoom: number;
  panX: number;
  panY: number;
  nodes: {
    node_key: string;
    type: string;
    title: string;
    color: string;
    pos_x: number;
    pos_y: number;
    spec_objective: string;
    spec_inputs: string[];
    spec_steps: string[];
    spec_outputs: string[];
    spec_success: string[];
    spec_failures: string[];
  }[];
  connections: {
    conn_key: string;
    from_node: string;
    to_node: string;
    label: string;
  }[];
}

export async function saveCanvas(payload: SaveCanvasPayload): Promise<void> {
  const { canvasId, name, zoom, panX, panY, nodes, connections } = payload;

  // 1. Update canvas meta
  const { error: canvasErr } = await supabase
    .from('process_canvases')
    .update({ name, zoom, pan_x: panX, pan_y: panY })
    .eq('id', canvasId);

  if (canvasErr) throw canvasErr;

  // 2. Delete all existing nodes & connections (full replace strategy)
  await supabase.from('canvas_connections').delete().eq('canvas_id', canvasId);
  await supabase.from('canvas_nodes').delete().eq('canvas_id', canvasId);

  // 3. Insert new nodes
  if (nodes.length > 0) {
    const { error: nodesErr } = await supabase.from('canvas_nodes').insert(
      nodes.map(n => ({ canvas_id: canvasId, ...n }))
    );
    if (nodesErr) throw nodesErr;
  }

  // 4. Insert new connections
  if (connections.length > 0) {
    const { error: connsErr } = await supabase.from('canvas_connections').insert(
      connections.map(c => ({ canvas_id: canvasId, ...c }))
    );
    if (connsErr) throw connsErr;
  }
}

// ─── Update canvas name only ──────────────────────────────────────────────────

export async function updateCanvasName(canvasId: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('process_canvases')
    .update({ name })
    .eq('id', canvasId);
  if (error) throw error;
}
