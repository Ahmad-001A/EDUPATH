"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

type Teacher = { id: string; name: string | null; email: string };

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Программирование",
    level: "Начинающий",
    duration: "12 уроков",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    teacherId: "",
  });

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTeachers(data.filter((u: any) => u.role === "TEACHER" || u.role === "ADMIN"));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/admin/courses");
      router.refresh();
    } else {
      alert("Ошибка создания");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>
      <h1 className="text-3xl font-bold gradient-text">Новый курс</h1>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl border border-white/40 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Название</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Описание</label>
          <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Категория</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl">
              <option>Программирование</option>
              <option>Дизайн</option>
              <option>Языки</option>
              <option>Бизнес</option>
              <option>Маркетинг</option>
              <option>Наука</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Уровень</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl">
              <option>Начинающий</option>
              <option>Средний</option>
              <option>Продвинутый</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Длительность</label>
            <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Преподаватель (необязательно)</label>
          <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl">
            <option value="">— Не назначен —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name || t.email}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Если учителя нет в списке — сначала сделайте его учителем на странице «Пользователи».
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL картинки</label>
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          <img src={form.image} alt="preview" className="mt-3 w-40 h-24 object-cover rounded-lg" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Создать курс
        </button>
      </form>
    </div>
  );
}