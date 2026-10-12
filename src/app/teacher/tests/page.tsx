"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ClipboardList,
  X,
  Loader2,
  Users,
  Save,
  Upload,
  FileSpreadsheet,
  Download,
} from "lucide-react";

type Option = { text: string; isCorrect: boolean };
type Question = { text: string; points: number; options: Option[] };
type Course = { id: string; title: string };
type Test = {
  id: string;
  title: string;
  description: string | null;
  course: { id: string; title: string };
  questions: any[];
  _count: { results: number };
  passScore: number;
  timeLimit: number;
};

export default function TeacherTestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<"manual" | "file">("manual");

  const [form, setForm] = useState({
    title: "",
    description: "",
    courseId: "",
    timeLimit: 0,
    passScore: 70,
  });
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", points: 1, options: [{ text: "", isCorrect: false }] },
  ]);

  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "authenticated" && role !== "TEACHER" && role !== "ADMIN") {
      router.push("/");
    }
  }, [status, role, router]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([
        fetch("/api/teacher/tests").then((r) => r.json()),
        fetch("/api/teacher/course").then((r) => r.json()),
      ]);
      setTests(Array.isArray(t) ? t : []);
      setCourses(Array.isArray(c) ? c : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") fetchAll();
  }, [status]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      courseId: "",
      timeLimit: 0,
      passScore: 70,
    });
    setQuestions([
      { text: "", points: 1, options: [{ text: "", isCorrect: false }] },
    ]);
    setImportMode("manual");
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", points: 1, options: [{ text: "", isCorrect: false }] },
    ]);
  };

  const removeQuestion = (qi: number) => {
    setQuestions(questions.filter((_, i) => i !== qi));
  };

  const updateQuestion = (qi: number, field: string, value: any) => {
    const copy = [...questions];
    (copy[qi] as any)[field] = value;
    setQuestions(copy);
  };

  const addOption = (qi: number) => {
    const copy = [...questions];
    copy[qi].options.push({ text: "", isCorrect: false });
    setQuestions(copy);
  };

  const removeOption = (qi: number, oi: number) => {
    const copy = [...questions];
    if (copy[qi].options.length <= 2) {
      alert("Должно быть минимум 2 варианта");
      return;
    }
    copy[qi].options = copy[qi].options.filter((_, i) => i !== oi);
    setQuestions(copy);
  };

  const updateOption = (qi: number, oi: number, field: string, value: any) => {
    const copy = [...questions];
    (copy[qi].options[oi] as any)[field] = value;
    setQuestions(copy);
  };

  // ============ ИМПОРТ ИЗ ФАЙЛА ============
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());

      // Формат CSV:
      // вопрос;вариант1;вариант2;вариант3;вариант4;номер_правильного;баллы
      // Пример:
      // Что такое Python?;Змея;Язык программирования;Игра;Птица;2;1

      const newQuestions: Question[] = [];

      // Пропускаем заголовок если он есть
      const startIdx =
        lines[0].toLowerCase().includes("вопрос") ||
        lines[0].toLowerCase().includes("question")
          ? 1
          : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(/[;,\t]/).map((p) => p.trim());
        if (parts.length < 4) continue;

        const [qText, ...rest] = parts;
        // Последние два элемента: правильные ответы и баллы
        // Правильные ответы могут быть "1" или "1,3"
        const points = parseInt(rest[rest.length - 1]) || 1;
        const correctStr = rest[rest.length - 2];
        const optionTexts = rest.slice(0, rest.length - 2);

        if (!qText || optionTexts.length < 2) continue;

        const correctIndexes = correctStr
          .split(/[,|]/)
          .map((s) => parseInt(s.trim()) - 1)
          .filter((n) => !isNaN(n));

        const options: Option[] = optionTexts.map((text, idx) => ({
          text,
          isCorrect: correctIndexes.includes(idx),
        }));

        if (!options.some((o) => o.isCorrect)) {
          // Если не указан правильный — считаем первый правильным
          options[0].isCorrect = true;
        }

        newQuestions.push({
          text: qText,
          points,
          options,
        });
      }

      if (newQuestions.length === 0) {
        alert(
          "Не удалось распознать вопросы. Проверьте формат файла.\n\nФормат: вопрос;вариант1;вариант2;вариант3;вариант4;номер_правильного;баллы"
        );
        setImporting(false);
        return;
      }

      setQuestions(newQuestions);
      setImportMode("manual");
      alert(`✅ Загружено ${newQuestions.length} вопросов!`);
    } catch (e) {
      alert("Ошибка чтения файла");
    }
    setImporting(false);
  };

  const downloadTemplate = () => {
    const csv = `Вопрос;Вариант 1;Вариант 2;Вариант 3;Вариант 4;Правильный;Баллы
Что такое Python?;Змея;Язык программирования;Игра;Птица;2;1
Что такое HTML?;Язык разметки;Язык программирования;База данных;Протокол;1;1
Сколько будет 2+2?;3;4;5;6;2;2`;

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "шаблон-теста.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============ СОХРАНЕНИЕ ============
  const handleSubmit = async () => {
    if (!form.title || !form.courseId) {
      alert("Заполните название и выберите курс");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Вопрос ${i + 1}: пустой текст`);
        return;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        alert(`Вопрос ${i + 1}: нет правильного ответа`);
        return;
      }
      if (q.options.some((o) => !o.text.trim())) {
        alert(`Вопрос ${i + 1}: пустой вариант ответа`);
        return;
      }
    }

    setSaving(true);
    const res = await fetch("/api/teacher/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, questions }),
    });
    if (res.ok) {
      setShowModal(false);
      resetForm();
      await fetchAll();
    } else {
      alert("Ошибка создания теста");
    }
    setSaving(false);
  };

  const deleteTest = async (id: string) => {
    if (!confirm("Удалить тест? Все результаты тоже удалятся.")) return;
    await fetch(`/api/teacher/tests/${id}`, { method: "DELETE" });
    fetchAll();
  };

  if (status === "loading" || loading)
    return <p className="text-gray-500">Загрузка...</p>;

  return (
    <div className="space-y-6">
      <Link
        href="/teacher"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> В учительскую
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Мои тесты</h1>
          <p className="text-gray-500 mt-1">
            Создавайте тесты вручную или импортом из файла
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" /> Создать тест
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="glass p-16 rounded-3xl text-center border border-white/40">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Тестов пока нет. Создайте первый!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tests.map((test) => (
            <div
              key={test.id}
              className="glass p-6 rounded-2xl border border-white/40 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <button
                  onClick={() => deleteTest(test.id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-lg mb-1">{test.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{test.course.title}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-white/40">
                <span>{test.questions.length} вопросов</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {test._count.results} прошли
                </span>
                <span>Порог: {test.passScore}%</span>
              </div>

              <Link
                href={`/teacher/tests/${test.id}`}
                className="mt-4 block text-center bg-blue-50 text-blue-600 font-medium py-2 rounded-xl hover:bg-blue-100 transition text-sm"
              >
                Результаты и просмотр →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* МОДАЛКА СОЗДАНИЯ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass p-6 rounded-3xl max-w-4xl w-full border border-white/40 my-8 modal-animate max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-transparent pb-3 border-b border-white/40">
              <h3 className="text-xl font-bold">Новый тест</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Название теста
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: Основы Python"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Курс</label>
                  <select
                    value={form.courseId}
                    onChange={(e) =>
                      setForm({ ...form, courseId: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Выберите —</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Описание
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Лимит времени (мин, 0 = без)
                  </label>
                  <input
                    type="number"
                    value={form.timeLimit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        timeLimit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Проходной балл (%)
                  </label>
                  <input
                    type="number"
                    value={form.passScore}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        passScore: parseInt(e.target.value) || 70,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <hr className="border-white/40" />

              {/* ВЫБОР СПОСОБА ДОБАВЛЕНИЯ */}
              <div className="flex gap-2 p-1 glass rounded-2xl border border-white/40">
                <button
                  type="button"
                  onClick={() => setImportMode("manual")}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition ${
                    importMode === "manual"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  ✍️ Вручную
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("file")}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition ${
                    importMode === "file"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  📁 Импорт из файла
                </button>
              </div>

              {importMode === "file" && (
                <div className="glass p-6 rounded-2xl border-2 border-dashed border-blue-300 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-bold mb-2">
                    Загрузите файл с вопросами
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Формат CSV (открывается в Excel):
                    <br />
                    <code className="text-xs bg-white/60 px-2 py-1 rounded mt-2 inline-block">
                      Вопрос;В1;В2;В3;В4;Правильный;Баллы
                    </code>
                  </p>

                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={importing}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {importing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Выбрать файл
                    </button>
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="glass px-4 py-3 rounded-xl border border-white/40 text-sm font-medium hover:bg-white/60 transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Скачать шаблон
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {importMode === "manual" && (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">
                      Вопросы ({questions.length})
                    </h4>
                    <button
                      onClick={addQuestion}
                      className="text-sm text-blue-600 font-medium hover:underline"
                    >
                      + Добавить вопрос
                    </button>
                  </div>

                  {questions.map((q, qi) => (
                    <div
                      key={qi}
                      className="glass p-4 rounded-xl border border-white/40"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">
                          Вопрос {qi + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(qi)}
                            className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        value={q.text}
                        onChange={(e) =>
                          updateQuestion(qi, "text", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl mb-3"
                        placeholder="Текст вопроса"
                      />

                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={opt.isCorrect}
                              onChange={(e) =>
                                updateOption(
                                  qi,
                                  oi,
                                  "isCorrect",
                                  e.target.checked
                                )
                              }
                              className="w-5 h-5 rounded cursor-pointer accent-blue-600"
                              title="Правильный ответ"
                            />
                            <input
                              value={opt.text}
                              onChange={(e) =>
                                updateOption(qi, oi, "text", e.target.value)
                              }
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              placeholder={`Вариант ${oi + 1}`}
                            />
                            {q.options.length > 2 && (
                              <button
                                onClick={() => removeOption(qi, oi)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => addOption(qi)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        + Добавить вариант
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-white/40 sticky bottom-0 bg-transparent">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Создать тест
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}