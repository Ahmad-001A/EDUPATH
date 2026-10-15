"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  GraduationCap,
  Check,
  BookOpen,
  Save,
} from "lucide-react";

export default function NewTeacherCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Программирование",
    level: "Начинающий",
    duration: "12 уроков",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  });
  const [grades, setGrades] = useState<number[]>([]);

  const toggleGrade = (g: number) => {
    setGrades((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : [...prev, g].sort((a, b) => a - b)
    );
  };

  const selectAll = () =>
    setGrades(Array.from({ length: 11 }, (_, i) => i + 1));
  const clearAll = () => setGrades([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/teacher/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, grades }),
    });

    if (res.ok) {
      router.push("/teacher");
      router.refresh();
    } else {
      alert("Ошибка создания курса");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/teacher"
        className="inline-flex items-center gap-2 text-[#4a5578] hover:text-[#3561d4]"
      >
        <ArrowLeft className="w-4 h-4" /> В учительскую
      </Link>

      <div>
        <h1 className="text-4xl font-bold text-[#0f1c3f] flex items-center gap-3">
          <BookOpen className="w-9 h-9 text-[#3561d4]" />
          Новый курс
        </h1>
        <p className="text-[#4a5578] mt-2">
          Создайте курс и укажите, для каких классов он предназначен
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card p-8 rounded-3xl space-y-6"
      >
        {/* Название */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-[#0f1c3f]">
            Название курса *
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-5 py-4 border border-white/80 rounded-2xl bg-white/60 text-[#0f1c3f] text-base focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 focus:bg-white transition"
            placeholder="Например: Информатика для 8 класса"
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-[#0f1c3f]">
            Описание курса *
          </label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full px-5 py-4 border border-white/80 rounded-2xl bg-white/60 text-[#0f1c3f] text-base focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 focus:bg-white transition resize-none"
            placeholder="Расскажите, чему научится ученик..."
          />
        </div>

        {/* Категория, уровень, длительность */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#0f1c3f]">
              Категория
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="w-full px-5 py-4 border border-white/80 rounded-2xl bg-white/60 text-[#0f1c3f] focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 focus:bg-white transition"
            >
              <option>Программирование</option>
              <option>Математика</option>
              <option>Физика</option>
              <option>Химия</option>
              <option>Биология</option>
              <option>История</option>
              <option>География</option>
              <option>Языки</option>
              <option>Литература</option>
              <option>Дизайн</option>
              <option>Бизнес</option>
              <option>Маркетинг</option>
              <option>Наука</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[#0f1c3f]">
              Уровень
            </label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full px-5 py-4 border border-white/80 rounded-2xl bg-white/60 text-[#0f1c3f] focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 focus:bg-white transition"
            >
              <option>Начинающий</option>
              <option>Средний</option>
              <option>Продвинутый</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[#0f1c3f]">
              Длительность
            </label>
            <input
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: e.target.value })
              }
              className="w-full px-5 py-4 border border-white/80 rounded-2xl bg-white/60 text-[#0f1c3f] focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 focus:bg-white transition"
            />
          </div>
        </div>

        {/* ⚡ ВЫБОР КЛАССОВ */}
        <div className="bg-gradient-to-br from-[#eef0ff] via-[#f5eefe] to-[#ffeef5] rounded-3xl p-6 border-2 border-white">
          <label className="block text-base font-bold mb-4 text-[#0f1c3f] flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#3561d4]" />
            Для каких классов предназначен курс? *
          </label>

          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              type="button"
              onClick={selectAll}
              className="text-sm px-4 py-2 bg-gradient-to-r from-[#4f7cff] to-[#7c5cff] text-white rounded-xl hover:opacity-90 transition font-medium shadow-lg shadow-indigo-500/30"
            >
              ✓ Выбрать все
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm px-4 py-2 bg-white text-[#4a5578] rounded-xl hover:bg-gray-50 border border-white/80 font-medium transition"
            >
              Сбросить
            </button>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
            {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => {
              const active = grades.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGrade(g)}
                  className={`aspect-square rounded-2xl font-bold text-lg transition-all flex items-center justify-center ${
                    active
                      ? "bg-gradient-to-br from-[#4f7cff] to-[#7c5cff] text-white shadow-xl shadow-indigo-500/40 scale-110"
                      : "bg-white text-[#4a5578] hover:bg-[#eef0ff] border-2 border-white shadow-md hover:scale-105"
                  }`}
                >
                  {active ? <Check className="w-6 h-6" /> : g}
                </button>
              );
            })}
          </div>

          <div
            className={`mt-4 p-3 rounded-xl text-sm ${
              grades.length === 0
                ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            {grades.length === 0
              ? "⚠️ Классы не выбраны — курс увидят ВСЕ ученики"
              : `✅ Курс увидят ученики классов: ${grades
                  .map((g) => `${g}`)
                  .join(", ")}`}
          </div>
        </div>

        {/* Картинка */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-[#0f1c3f]">
            URL обложки курса
          </label>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-5 py-4 border border-white/80 rounded-2xl bg-white/60 text-[#0f1c3f] focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 focus:bg-white transition"
          />
          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="mt-3 w-full h-48 object-cover rounded-2xl shadow-lg"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#4f7cff] to-[#7c5cff] text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Save className="w-6 h-6" />
          )}
          Создать курс
        </button>
      </form>
    </div>
  );
}
