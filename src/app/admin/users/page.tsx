"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Trash2, ShieldCheck, Ban, CheckCircle, GraduationCap } from "lucide-react";

type Course = { id: string; title: string };
type UserType = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
  taughtCourses: Course[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [newRole, setNewRole] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [u, c] = await Promise.all([
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/admin/courses").then(r => r.json()),
    ]);
    setUsers(Array.isArray(u) ? u : []);
    setCourses(Array.isArray(c) ? c : []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openRoleModal = (user: UserType) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setSelectedCourse(user.taughtCourses[0]?.id || "");
  };

  const saveRole = async () => {
    if (!selectedUser) return;
    await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole, banned: selectedUser.banned }),
    });
    if (newRole === "TEACHER" && selectedCourse) {
      await fetch(`/api/admin/courses/${selectedCourse}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...courses.find(c => c.id === selectedCourse), teacherId: selectedUser.id }),
      });
    }
    setSelectedUser(null);
    fetchAll();
  };

  const toggleBan = async (user: UserType) => {
    if (!confirm(user.banned ? `Разблокировать ${user.email}?` : `Заблокировать ${user.email}?`)) return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: user.role, banned: !user.banned }),
    });
    fetchAll();
  };

  const deleteUser = async (user: UserType) => {
    if (!confirm(`УДАЛИТЬ ${user.email}? Нельзя отменить!`)) return;
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Назад в админку
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold gradient-text">Управление пользователями</h1>
        <span className="text-gray-500">Всего: {users.length}</span>
      </div>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <div className="glass rounded-2xl shadow-sm border border-white/40 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/40 border-b border-white/40">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Пользователь</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Роль</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Предмет</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Статус</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/30 hover:bg-white/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {user.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{user.name || "Без имени"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                      user.role === "TEACHER" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.taughtCourses.length > 0 ? user.taughtCourses.map(c => c.title).join(", ") : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {user.banned ? (
                      <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">Забанен</span>
                    ) : (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Активен</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openRoleModal(user)} title="Сменить роль"
                      className="inline-flex p-2 text-purple-600 hover:bg-purple-50 rounded-lg mr-1">
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleBan(user)} title={user.banned ? "Разбанить" : "Забанить"}
                      className="inline-flex p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg mr-1">
                      {user.banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteUser(user)} title="Удалить"
                      className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-2xl max-w-md w-full border border-white/40">
            <h3 className="text-xl font-bold mb-4">Роль для {selectedUser.email}</h3>

            <label className="block text-sm font-medium mb-2">Роль</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4">
              <option value="STUDENT">STUDENT — ученик</option>
              <option value="TEACHER">TEACHER — учитель</option>
              <option value="ADMIN">ADMIN — админ</option>
            </select>

            {newRole === "TEACHER" && (
              <>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Предмет (курс)
                </label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4">
                  <option value="">— Выберите курс —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={saveRole}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 font-medium">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}