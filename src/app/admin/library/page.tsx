"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, FileText, Video, BookOpen, ExternalLink, Loader2 } from "lucide-react";

type Item = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  category: string;
};

export default function AdminLibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "PDF",
    url: "",
    category: "Программирование",
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/library", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: "", description: "", type: "PDF", url: "", category: "Программирование" });
        setShowModal(false);
        await fetchItems();
      } else {
        const err = await res.json();
        alert("Ошибка: " + (err.error || "не удалось сохранить"));
      }
    } catch (e) {
      alert("Ошибка соединения");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить материал?")) return;
    await fetch(`/api/admin/library/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const icons: any = { PDF: FileText, VIDEO: Video, BOOK: BookOpen, ARTICLE: FileText };

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Назад в админку
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold gradient-text">Управление библиотекой</h1>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2">
          <Plus className="w-5 h-5" /> Добавить материал
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : items.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-white/40">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Материалов пока нет. Добавьте первый!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => {
            const Icon = icons[item.type] || FileText;
            return (
              <div key={item.id} className="glass p-5 rounded-2xl border border-white/40 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {item.type}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description || "Без описания"}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{item.category}</span>
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                    Открыть <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-2xl max-w-lg w-full border border-white/40 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Новый материал</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Тип</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                    <option value="PDF">PDF</option>
                    <option value="VIDEO">Видео</option>
                    <option value="BOOK">Книга</option>
                    <option value="ARTICLE">Статья</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Категория</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ссылка (URL)</label>
                <input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  placeholder="https://example.com/file.pdf" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                  Отмена
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}