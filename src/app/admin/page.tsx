import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Plus,
  Shield,
  GraduationCap,
  Palette,
  ClipboardList,
} from "lucide-react";

export default async function AdminPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  const [usersCount, coursesCount, lessonsCount, teachersCount, testsCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.test.count(),
    ]);

  const stats = [
    {
      label: "Пользователей",
      value: usersCount,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Курсов",
      value: coursesCount,
      icon: BookOpen,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Уроков",
      value: lessonsCount,
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Тестов",
      value: testsCount,
      icon: ClipboardList,
      color: "bg-pink-100 text-pink-600",
    },
  ];

  const sections = [
    {
      title: "Управление курсами",
      desc: "Создавать, редактировать, удалять курсы",
      href: "/admin/courses",
      icon: BookOpen,
      color: "bg-blue-600",
    },
    {
      title: "Управление пользователями",
      desc: "Роли, блокировки, удаление",
      href: "/admin/users",
      icon: Users,
      color: "bg-green-600",
    },
    {
      title: "Управление библиотекой",
      desc: "PDF, видео, книги, статьи",
      href: "/admin/library",
      icon: FileText,
      color: "bg-purple-600",
    },
    {
      title: "Все тесты платформы",
      desc: "Тесты от всех учителей",
      href: "/tests",
      icon: ClipboardList,
      color: "bg-pink-600",
    },
    {
      title: "Настройки сайта",
      desc: "Название, темы оформления",
      href: "/admin/settings",
      icon: Palette,
      color: "bg-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
            <Shield className="w-8 h-8" /> Админ-панель
          </h1>
          <p className="text-gray-500 mt-1">Управление платформой EduPath</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Добавить курс
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass p-5 rounded-2xl shadow-sm border border-white/40 flex items-center gap-4 card-hover"
          >
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Разделы управления</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((sec) => (
            <Link
              key={sec.href}
              href={sec.href}
              className="glass p-6 rounded-2xl shadow-sm border border-white/40 hover:shadow-md transition flex items-start gap-4 card-hover"
            >
              <div className={`p-3 rounded-xl ${sec.color} text-white`}>
                <sec.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{sec.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{sec.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/40 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-bold">
              Всего учителей в системе: {teachersCount}
            </p>
            <p className="text-sm text-gray-500">
              Управляйте ролями на странице пользователей
            </p>
          </div>
        </div>
        <Link
          href="/admin/users"
          className="text-blue-600 font-medium text-sm hover:underline"
        >
          Управлять →
        </Link>
      </div>
    </div>
  );
}