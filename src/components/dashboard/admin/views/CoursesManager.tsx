import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { Course, getCourses, updateCourse } from '../../../../lib/courses';

interface CoursesManagerProps {
  onEdit: (courseId?: string) => void;
}

export function CoursesManager({ onEdit }: CoursesManagerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const data = await getCourses(false); // get all, not just published
    setCourses(data);
    setLoading(false);
  };

  const togglePublish = async (course: Course) => {
    await updateCourse(course.id, { published: !course.published });
    loadCourses();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Mis Cursos</h1>
          <p className="text-slate-500">Administra el catálogo de la academia</p>
        </div>
        <button
          onClick={() => onEdit()} // null id = create new
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-sky-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nuevo Curso
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500">
                <th className="p-4 font-bold">Curso</th>
                <th className="p-4 font-bold">Categoría</th>
                <th className="p-4 font-bold">Precio</th>
                <th className="p-4 font-bold">Inscritos</th>
                <th className="p-4 font-bold text-center">Estado</th>
                <th className="p-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Cargando cursos...</td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No hay cursos creados aún.</td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {course.cover_url && <img src={course.cover_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-bold text-slate-800 line-clamp-2">{course.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{course.categories?.name || '-'}</td>
                    <td className="p-4 text-sm text-slate-600 font-medium">
                      {course.price > 0 ? `$${course.price}` : 'Gratis'}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {course.enrollments?.[0]?.count || 0}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => togglePublish(course)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          course.published 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        }`}
                      >
                        {course.published ? <Eye size={14} /> : <EyeOff size={14} />}
                        {course.published ? 'Publicado' : 'Borrador'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onEdit(course.id)}
                          className="p-2 text-slate-400 hover:text-sky-500 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors"
                          title="Editar Curso"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-lg border border-slate-200 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
