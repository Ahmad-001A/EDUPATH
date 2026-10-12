"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Palette } from "lucide-react";

const themes = [
  { id: "blue", name: "Океан", colors: ["#3b82f6", "#8b5cf6", "#ec4899"], desc: "Синий — по умолчанию" },
  { id: "green", name: "Лес", colors: ["#10b981", "#22c55e", "#84cc16"], desc: "Свежая зелень" },
  { id: "orange", name: "Закат", colors: ["#f97316", "#ef4444", "#ec4899"], desc: "Тёплые тона" },
  { id: "purple", name: "Лаванда", colors: ["#8b5cf6", "#a855f7", "#ec4899"], desc: "Фиолетовые акценты" },
  { id: "rose", name: "Роза", colors: ["#f43f5e", "#ec4899", "#a855f7"], desc: "Мягкий розовый" },
  { id: "dark", name: "Полночь", colors: ["#60a5fa", "#a78bfa", "#f472b6"], desc: "Тёмная тема" },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ siteName: "", siteDescription: "", contactEmail: "", theme: "blue" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      setForm({
        siteName: d.siteName || "EduPath",
        siteDescription: d.siteDescription || "",
        contactEmail: d.contactEmail || "",
        theme: d.theme || "blue",
      });
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
   if (res.ok) {
  setMsg("Сохранено!");
  document.documentElement.setAttribute("data-theme", form.theme);
  router.refresh();
} else setMsg("Ошибка сохранения");
    setSaving(false);
  };

  if (loading) return <p className="text-gray-500">Загрузка...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Назад в админку
      </Link>

      <h1 className="text-3xl font-bold gradient-text">Настройки сайта</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass p-8 rounded-2xl border border-white/40 space-y-5">
          <h2 className="font-bold text-lg">Основное</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Название сайта</label>
            <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea value={form.siteDescription} onChange={(e) => setForm({ ...form, siteDescription: e.target.value })} rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Контактный email</label>
            <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/40 space-y-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Palette className="w-5 h-5" /> Тема оформления
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {themes.map((t) => (
              <button key={t.id} type="button" onClick={() => setForm({ ...form, theme: t.id })}
                className={`p-4 rounded-2xl border-2 text-left transition ${
                  form.theme === t.id ? "border-blue-500 shadow-lg" : "border-white/40 hover:border-blue-300"
                }`}>
                <div className="flex gap-1 mb-3">
                  {t.colors.map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {msg && <p className={`text-sm ${msg.includes("Ошибка") ? "text-red-500" : "text-green-600"}`}>{msg}</p>}

        <button type="submit" disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Сохранить настройки
        </button>
      </form>
    </div>
  );
}