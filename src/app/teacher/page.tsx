"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  BookOpen,
  Video,
  ChevronDown,
  ChevronRight,
  Loader2,
  FileText,
  Users,
  Award,
  CheckCircle,
  XCircle,
  ClipboardList,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  videoDuration: number | null;
  order: number;
};
type Module = { id: string; title: string; order: number; lessons: Lesson[] };
type Course = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  category: string;
  modules: Module[];
};
type Student = {
  id: string;
  name: string | null;
  email: string;
  completedLessons: number;
  totalLessons: number;
  percent: number;
};
type CertRequestType = {
  id: string;
  user: { id: string; name: string | null; email: string };
  course: { id: string; title: string };
  completedLessons: number;
  totalLessons: number;
  createdAt: string;
};

export default function TeacherPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"courses" | "students" | "requests" | "tests">(
    "courses"
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [requests, setRequests] = useState<CertRequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  const [newModule, setNewModule] = useState({ courseId: "", title: "" });
  const [newLesson, setNewLesson] = useState({
    moduleId: "",
    title: "",
    content: "",
    videoUrl: "",
    videoDuration: 0,
  });
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "authenticated" && role !== "TEACHER" && role !== "ADMIN") {
      router.push("/");
    }
  }, [status, role, router]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, s, r] = await Promise.all([
        fetch("/api/teacher/course").then((r) => r.json()),
        fetch("/api/teacher/students").then((r) => r.json()),
        fetch("/api/teacher/cert-requests").then((r) => r.json()),
      ]);
      setCourses(Array.isArray(c) ? c : []);
      setStudents(Array.isArray(s?.students) ? s.students : []);
      setRequests(Array.isArray(r) ? r : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") fetchAll();
  }, [status]);

  const toggleModule = (id: string) => {
    const next = new Set(openModules);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenModules(next);
  };

  const addModule = async () => {
    if (!newModule.title || !newModule.courseId) return;
    setSaving(true);
    await fetch("/api/teacher/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newModule),
    });
    setNewModule({ courseId: "", title: "" });
    setShowModuleModal(false);
    await fetchAll();
    setSaving(false);
  };

  const deleteModule = async (id: string) => {
    if (!confirm("Удалить модуль и все его уроки?")) return;
    await fetch(`/api/teacher/modules/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const addLesson = async () => {
    if (!newLesson.title || !newLesson.moduleId) return;
    setSaving(true);
    await fetch("/api/teacher/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLesson),
    });
    setNewLesson({
      moduleId: "",
      title: "",
      content: "",
      videoUrl: "",
      videoDuration: 0,
    });
    setShowLessonModal(false);
    await fetchAll();
    setSaving(false);
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Удалить урок?")) return;
    await fetch(`/api/teacher/lessons/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const approveRequest = async (id: string) => {
    await fetch(`/api/teacher/cert-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    fetchAll();
  };

  const rejectRequest = async (id: string) => {
    await fetch(`/api/teacher/cert-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    fetchAll();
  };

  if (status === "loading" || loading) {
    return <p className="text-gray-500">Загрузка...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">
          Учительская панель
        </h1>
        <p className="text-gray-500 mt-1">
          Управляйте курсами, уроками и следите за учениками
        </p>
      </div>

      <div className="flex gap-2 border-b border-white/40 flex-wrap">
        <button
          onClick={() => setTab("courses")}
          className={`px-5 py-3 font-medium transition border-b-2 ${
            tab === "courses"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" /> Мои курсы
        </button>
        <button
          onClick={() => setTab("students")}
          className={`px-5 py-3 font-medium transition border-b-2 ${
            tab === "students"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" /> Мои ученики (
          {students.length})
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`px-5 py-3 font-medium transition border-b-2 ${
            tab === "requests"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" /> Заявки на сертификат (
          {requests.length})
        </button>
        <button
          onClick={() => setTab("tests")}
          className={`px-5 py-3 font-medium transition border-b-2 ${
            tab === "tests"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          <ClipboardList className="w-4 h-4 inline mr-2" /> Мои тесты
        </button>
      </div>

      {tab === "courses" && (
        <>
          {courses.length === 0 ? (
            <div className="glass p-12 rounded-2xl text-center border border-white/40">
              <p className="text-gray-500">
                Вам пока не назначен ни один курс.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Обратитесь к администратору.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="glass rounded-2xl border border-white/40 overflow-hidden"
                >
                  <div className="p-6 border-b border-white/40 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={course.image || ""}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />{" "}
                          {course.title}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {course.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setNewModule({ courseId: course.id, title: "" });
                        setShowModuleModal(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Модуль
                    </button>
                  </div>

                  <div className="p-6 space-y-3">
                    {course.modules.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        Модулей пока нет. Создайте первый!
                      </p>
                    ) : (
                      course.modules.map((mod) => (
                        <div
                          key={mod.id}
                          className="border border-white/40 rounded-xl overflow-hidden bg-white/40"
                        >
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/60"
                            onClick={() => toggleModule(mod.id)}
                          >
                            <div className="flex items-center gap-3">
                              {openModules.has(mod.id) ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                              <span className="font-medium">
                                Модуль {mod.order}. {mod.title}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({mod.lessons.length} уроков)
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setNewLesson({
                                    moduleId: mod.id,
                                    title: "",
                                    content: "",
                                    videoUrl: "",
                                    videoDuration: 0,
                                  });
                                  setShowLessonModal(true);
                                }}
                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                                title="Добавить урок"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteModule(mod.id)}
                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                                title="Удалить модуль"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {openModules.has(mod.id) && (
                            <div className="border-t border-white/40 p-3 space-y-2">
                              {mod.lessons.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-2">
                                  Уроков нет
                                </p>
                              ) : (
                                mod.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/60"
                                  >
                                    <div className="flex items-center gap-3">
                                      {lesson.videoUrl ? (
                                        <Video className="w-4 h-4 text-purple-600" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-blue-600" />
                                      )}
                                      <span className="text-sm font-medium">
                                        {lesson.order}. {lesson.title}
                                      </span>
                                      {lesson.videoDuration ? (
                                        <span className="text-xs text-gray-400">
                                          (
                                          {Math.floor(
                                            (lesson.videoDuration || 0) / 60
                                          )}
                                          :
                                          {String(
                                            (lesson.videoDuration || 0) % 60
                                          ).padStart(2, "0")}
                                          )
                                        </span>
                                      ) : null}
                                    </div>
                                    <button
                                      onClick={() => deleteLesson(lesson.id)}
                                      className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "students" && (
        <div className="glass rounded-2xl border border-white/40 overflow-hidden">
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                Пока никто не проходил ваши уроки
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/40 border-b border-white/40">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Ученик
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Прогресс
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-white/30 hover:bg-white/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {s.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="font-medium">
                          {s.name || "Без имени"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {s.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-xs">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {s.completedLessons} / {s.totalLessons}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${s.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          s.percent === 100
                            ? "bg-green-100 text-green-700"
                            : s.percent >= 50
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s.percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="glass p-12 rounded-2xl text-center border border-white/40">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Заявок на сертификат пока нет</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="glass p-6 rounded-2xl border border-white/40"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {req.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-bold">
                        {req.user?.name || "Без имени"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {req.user?.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        📚 Курс: <b>{req.course?.title}</b>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveRequest(req.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Одобрить
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-200 transition flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Отклонить
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/40">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">
                      Прогресс ученика по курсу
                    </span>
                    <span className="font-bold">
                      {req.completedLessons} / {req.totalLessons} уроков
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          req.totalLessons === 0
                            ? 0
                            : (req.completedLessons / req.totalLessons) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "tests" && (
        <div className="glass p-12 rounded-2xl text-center border border-white/40">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Тесты для ваших курсов</h3>
          <p className="text-gray-500 mb-6">
            Управляйте тестами во встроенной панели
          </p>
          <Link
            href="/teacher/tests"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5" /> Перейти к тестам
          </Link>
        </div>
      )}

      {showModuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-2xl max-w-md w-full border border-white/40">
            <h3 className="text-xl font-bold mb-4">Новый модуль</h3>
            <input
              value={newModule.title}
              onChange={(e) =>
                setNewModule({ ...newModule, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4"
              placeholder="Название модуля"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowModuleModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={addModule}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-2xl max-w-lg w-full border border-white/40 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Новый урок</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Название урока
                </label>
                <input
                  value={newLesson.title}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  placeholder="Например: Переменные"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ссылка на YouTube
                </label>
                <input
                  value={newLesson.videoUrl}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, videoUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Длительность видео (в секундах)
                </label>
                <input
                  type="number"
                  value={newLesson.videoDuration}
                  onChange={(e) =>
                    setNewLesson({
                      ...newLesson,
                      videoDuration: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  placeholder="600 = 10 минут"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ученику нужно посмотреть минимум 70% для зачёта
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Текст / задание
                </label>
                <textarea
                  value={newLesson.content}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  placeholder="Описание урока или задание"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowLessonModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={addLesson}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}