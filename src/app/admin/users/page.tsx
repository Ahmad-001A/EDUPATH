"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, User, Trash2, ShieldCheck, Ban, CheckCircle,
  GraduationCap, X, Users as UsersIcon,
} from "lucide-react";

type Course = { id: string; title: string };
type UserType = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  grade: number | null;
  createdAt: string;
  taughtCourses: Course[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newGrade, setNewGrade] = useState<number>(1);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");

  const fetchAll = async () => {
    setLoading(true);
    const [u, c] = await Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/courses").then((r) => r.json()),
    ]);
    setUsers(Array.isArray(u) ? u : []);
    setCourses(Array.isArray(c) ? c : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterRole !== "all" && u.role !== filterRole) return false;
      if (filterGrade !== "all") {
        if (filterGrade === "none") {
          if (u.grade !== null) return false;
        } else {
          if (u.grade !== parseInt(filterGrade)) return false;
        }
      }
      return true;
    });
  }, [users, filterGrade, filterRole]);

  const openRoleModal = (user: UserType) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewGrade(user.grade || 1);
    setSelectedCourse(user.taughtCourses[0]?.id || "");
  };

  const saveRole = async () => {
    if (!selectedUser) return;
    await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: newRole,
        banned: selectedUser.banned,
        grade: newRole === "STUDENT" ? newGrade : null,
      }),
    });
    if (newRole === "TEACHER" && selectedCourse) {
      const course = courses.find((c) => c.id === selectedCourse);
      await fetch(`/api/admin/courses/${selectedCourse}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, teacherId: selectedUser.id }),
      });
    }
    setSelectedUser(null);
    fetchAll();
  };

  const toggleBan = async (user: UserType) => {
    if (
      !confirm(
        user.banned
          ? `Разблокировать ${user.email}?`
          : `Заблокировать ${user.email}?`
      )
    )
      return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: user.role,
        banned: !user.banned,
        grade: user.grade,
      }),
    });
    fetchAll();
  };

  const deleteUser = async (user: UserType) => {
    if (!confirm(`УДАЛИТЬ ${user.email}? Нельзя отменить!`)) return;
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    fetchAll();
  };

  // Счётчики по классам
  const gradeCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    users
      .filter((u) => u.role === "STUDENT" && u.grade)
      .forEach((u) => {
        counts[u.grade!] = (counts[u.grade!] || 0) + 1;
      });
    return counts;
  }, [users]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-[#4a5578] hover:text-[#3561d4]"
      >
        <ArrowLeft className="w-4 h-4" /> Назад в админку
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-4xl font-bold text-[#0f1c3f]">
          Управление пользователями
        </h1>
        <span className="text-[#8a95b8]">Всего: {users.length}</span>
      </div>

      {/* Счётчики по классам */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-[#0f1c3f] mb-3 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#3561d4]" />
          Ученики по классам
        </h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
            <button
              key={g}
              onClick={() => {
                setFilterGrade(filterGrade === String(g) ? "all" : String(g));
                setFilterRole("STUDENT");
              }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                filterGrade === String(g)
                  ? "bg-[#4f7cff] text-white shadow-lg shadow-indigo-500/30"
                  : "bg-white/60 text-[#4a5578] hover:bg-white"
              }`}
            >
              {g} кл. · {gradeCounts[g] || 0}
            </button>
          ))}
          <button
            onClick={() => {
              setFilterGrade("all");
              setFilterRole("all");
            }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
              filterGrade === "all" && filterRole === "all"
                ? "bg-[#4f7cff] text-white shadow-lg"
                : "bg-white/60 text-[#4a5578] hover:bg-white"
            }`}
          >
            Все
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f] focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40"
        >
          <option value="all">Все роли</option>
          <option value="STUDENT">Ученики</option>
          <option value="TEACHER">Учителя</option>
          <option value="ADMIN">Админы</option>
        </select>

        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="px-4 py-2 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f] focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40"
        >
          <option value="all">Все классы</option>
          {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
            <option key={g} value={g}>
              {g} класс
            </option>
          ))}
          <option value="none">Без класса</option>
        </select>

        {(filterGrade !== "all" || filterRole !== "all") && (
          <button
            onClick={() => {
              setFilterGrade("all");
              setFilterRole("all");
            }}
            className="px-4 py-2 text-[#4a5578] hover:text-red-600 flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Сбросить
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-[#8a95b8]">Загрузка...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <UsersIcon className="w-12 h-12 text-[#8a95b8] mx-auto mb-3" />
          <p className="text-[#4a5578]">Нет пользователей по фильтру</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/40 border-b border-white/60">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#4a5578]">
                    Пользователь
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#4a5578]">
                    Роль
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#4a5578]">
                    Класс
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#4a5578]">
                    Предмет
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#4a5578]">
                    Статус
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-[#4a5578]">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/40 hover:bg-white/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#4f7cff] to-[#7c5cff] rounded-full flex items-center justify-center text-white font-medium">
                          {user.name?.[0]?.toUpperCase() || (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#0f1c3f]">
                            {user.name || "Без имени"}
                          </p>
                          <p className="text-xs text-[#8a95b8]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "TEACHER"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.grade ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#eef0ff] text-[#7c5cff] px-2 py-1 rounded-full">
                          <GraduationCap className="w-3 h-3" />
                          {user.grade} кл.
                        </span>
                      ) : (
                        <span className="text-xs text-[#8a95b8]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4a5578]">
                      {user.taughtCourses.length > 0
                        ? user.taughtCourses.map((c) => c.title).join(", ")
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {user.banned ? (
                        <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Забанен
                        </span>
                      ) : (
                        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Активен
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openRoleModal(user)}
                        title="Сменить роль"
                        className="inline-flex p-2 text-purple-600 hover:bg-purple-50 rounded-lg mr-1"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleBan(user)}
                        title={user.banned ? "Разбанить" : "Забанить"}
                        className="inline-flex p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg mr-1"
                      >
                        {user.banned ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Ban className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
                        title="Удалить"
                        className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Модалка смены роли */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full modal-animate">
            <h3 className="text-xl font-bold mb-4 text-[#0f1c3f]">
              Настройки {selectedUser.email}
            </h3>

            <label className="block text-sm font-medium mb-2 text-[#4a5578]">
              Роль
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f] mb-4"
            >
              <option value="STUDENT">STUDENT — ученик</option>
              <option value="TEACHER">TEACHER — учитель</option>
              <option value="ADMIN">ADMIN — админ</option>
            </select>

            {newRole === "STUDENT" && (
              <>
                <label className="block text-sm font-medium mb-2 text-[#4a5578]">
                  Класс
                </label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f] mb-4"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>
                      {g} класс
                    </option>
                  ))}
                </select>
              </>
            )}

            {newRole === "TEACHER" && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700">
                  ℹ️ При назначении учителем — класс удаляется автоматически
                </div>
                <label className="block text-sm font-medium mb-2 text-[#4a5578] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Предмет (курс)
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 border border-white/80 rounded-xl bg-white/60 text-[#0f1c3f] mb-4"
                >
                  <option value="">— Не выбран —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-3 border border-white/80 rounded-xl hover:bg-white/60 text-[#4a5578]"
              >
                Отмена
              </button>
              <button
                onClick={saveRole}
                className="flex-1 bg-gradient-to-r from-[#4f7cff] to-[#7c5cff] text-white px-4 py-3 rounded-xl hover:opacity-90 font-medium shadow-lg shadow-indigo-500/30"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
