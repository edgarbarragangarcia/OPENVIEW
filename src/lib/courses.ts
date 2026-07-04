import { supabase } from './supabase';

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  long_desc: string;
  cover_url: string;
  price: number;
  category_id: number | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hrs: number;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  categories?: Category;
  enrollments?: { count: number }[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  position: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  pdf_url?: string | null;
  duration_min: number;
  position: number;
  is_free: boolean;
  created_at?: string;
}

// ── Courses ──────────────────────────────────────────────────

export async function getCourses(publishedOnly = true) {
  let query = supabase
    .from('courses')
    .select('*, categories(*), enrollments(count)')
    .order('created_at', { ascending: false });

  if (publishedOnly) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) throw error;
  return data as Course[];
}

export async function getCourseById(id: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*, categories(*), modules(*, lessons(*))')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createCourse(course: Partial<Course>) {
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCourse(id: string, updates: Partial<Course>) {
  const { data, error } = await supabase
    .from('courses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCourse(id: string) {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
}

// ── Modules ──────────────────────────────────────────────────

export async function createModule(mod: Partial<Module>) {
  const { data, error } = await supabase
    .from('modules')
    .insert(mod)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateModule(id: string, updates: Partial<Module>) {
  const { data, error } = await supabase
    .from('modules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteModule(id: string) {
  const { error } = await supabase.from('modules').delete().eq('id', id);
  if (error) throw error;
}

// ── Lessons ──────────────────────────────────────────────────

export async function createLesson(lesson: Partial<Lesson>) {
  const { data, error } = await supabase
    .from('lessons')
    .insert(lesson)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLesson(id: string, updates: Partial<Lesson>) {
  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLesson(id: string) {
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) throw error;
}

// ── Categories ───────────────────────────────────────────────

export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data as Category[];
}

// ── Admin stats ───────────────────────────────────────────────

export async function getAdminStats() {
  const [coursesRes, enrollmentsRes, studentsRes] = await Promise.all([
    supabase.from('courses').select('id', { count: 'exact' }),
    supabase.from('enrollments').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
  ]);
  return {
    totalCourses: coursesRes.count ?? 0,
    totalEnrollments: enrollmentsRes.count ?? 0,
    totalStudents: studentsRes.count ?? 0,
  };
}

// ── Storage ───────────────────────────────────────────────────

export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  return data;
}

export function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
