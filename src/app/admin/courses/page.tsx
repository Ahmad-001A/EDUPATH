"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";

type Course = {
  id: string;
  title: string;
  category: string;
  level: string;
  image: string;
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/courses");
    const data = await res.json();
    setCourses(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот курс? Все модули и уроки тоже удалятся.")) return;
    await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    fetchCourses();
  };

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ ВНИМАНИЕ! Удалить ВСЕ курсы, модули, уроки и весь прогресс учеников?\n\nЭто действие НЕЛЬЗЯ отменить.")) return;
    if (!confirm("Точно уверены? Нажмите ОК ещё раз для подтверждения.")) return;

    setDeletingAll(true);
    const res = await fetch("/api/admin/courses/delete-all", { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Все курсы удалены!");
      fetchCourses();
    } else {
      alert("❌ Ошибка: " + data.error);
    }
    setDeletingAll(false);
  };

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Назад в админку
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold gradient-text">Управление курсами</h1>
        <div className="flex gap-3">
          {courses.length > 0 && (
            <button onClick={handleDeleteAll} disabled={deletingAll}
              className="bg-red-100 text-red-700 px-5 py-2.5 rounded-xl font-medium hover:bg-red-200 transition flex items-center gap-2 disabled:opacity-50">
              {deletingAll ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
              Удалить все курсы
            </button>
          )}
          <Link href="/admin/courses/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2">
            <Plus className="w-5 h-5" /> Добавить курс
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : courses.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-white/40">
          <p className="text-gray-500">Курсов пока нет. Создайте первый!</p>
        </div>
      ) : (
        <div className="glass rounded-2xl shadow-sm border border-white/40 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/40 border-b border-white/40">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Курс</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Категория</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Уровень</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-white/30 hover:bg-white/30">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={course.image || ""} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="font-medium">{course.title}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{course.category}</td>
                  <td className="px-6 py-4 text-gray-600">{course.level}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/courses/${course.id}`} className="inline-flex p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-1">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(course.id)} className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}