"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, GraduationCap, Check } from "lucide-react";

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
  const [grades, setGrades] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTeachers(data.filter((u: any) => u.role === "TEACHER" || u.role === "ADMIN"));
        }
      });
  }, []);

  const toggleGrade = (g: number) => {
    setGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g].sort((a, b) => a - b)
    );
  };

  const selectAll = () => setGrades(Array.from({ length: 11 }, (_, i) => i + 1));
  const clearAll = () => setGrades([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, grades }),
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
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-2 text-[#4a5578] hover:text-[#3561d4]"
      >
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>
      <h1 className="text-4xl font-bold text-[#0f1c3f]">Новый курс</h1>

      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#4a5578]">
            Название
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f] focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#4a5578]">
            Описание
          </label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f] focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#4a5578]">
              Категория
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f]"
            >
              <option>Программирование</option>
              <option>Дизайн</option>
              <option>Языки</option>
              <option>Бизнес</option>
              <option>Маркетинг</option>
              <option>Наука</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#4a5578]">
              Уровень
            </label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f]"
            >
              <option>Начинающий</option>
              <option>Средний</option>
              <option>Продвинутый</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#4a5578]">
              Длительность
            </label>
            <input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f]"
            />
          </div>
        </div>

        {/* КЛАССЫ */}
        <div>
          <label className="block text-sm font-medium mb-3 text-[#4a5578] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#3561d4]" />
            Для каких классов?
          </label>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs px-3 py-1.5 bg-[#4f7cff] text-white rounded-lg hover:opacity-90"
            >
              Все классы
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs px-3 py-1.5 bg-white/60 text-[#4a5578] rounded-lg hover:bg-white border border-white/80"
            >
              Сбросить
            </button>
          </div>

          <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
            {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => {
              const active = grades.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGrade(g)}
                  className={`aspect-square rounded-xl font-semibold text-sm transition-all flex items-center justify-center ${
                    active
                      ? "bg-gradient-to-br from-[#4f7cff] to-[#7c5cff] text-white shadow-lg shadow-indigo-500/40 scale-105"
                      : "bg-white/60 text-[#4a5578] hover:bg-white border border-white/80"
                  }`}
                >
                  {active ? <Check className="w-4 h-4" /> : g}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#8a95b8] mt-2">
            {grades.length === 0
              ? "Классы не выбраны — курс увидят все ученики"
              : `Курс увидят ученики классов: ${grades.join(", ")}`}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#4a5578]">
            Преподаватель
          </label>
          <select
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f]"
          >
            <option value="">— Не назначен —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || t.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#4a5578]">
            URL картинки
          </label>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f]"
          />
          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="mt-3 w-40 h-24 object-cover rounded-lg"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#4f7cff] to-[#7c5cff] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Создать курс
        </button>
      </form>
    </div>
  );
}
