export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Award, Clock, TrendingUp, GraduationCap } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const [completedLessons, allCourses, myProgress] = await Promise.all([
    prisma.progress.count({ where: { userId, completed: true } }),
    prisma.course.findMany({
      include: { modules: { include: { lessons: true } } },
    }),
    prisma.progress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    }),
  ]);

  const myLessonIds = new Set(myProgress.map((p) => p.lessonId));

  const courseProgress = allCourses
    .map((course) => {
      const totalLessons = course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      );
      const doneLessons = course.modules.reduce(
        (sum, m) =>
          sum + m.lessons.filter((l) => myLessonIds.has(l.id)).length,
        0
      );
      const percent =
        totalLessons === 0
          ? 0
          : Math.round((doneLessons / totalLessons) * 100);
      return { ...course, totalLessons, doneLessons, percent };
    })
    .filter((c) => c.totalLessons > 0);

  const earnedCertificates = courseProgress.filter((c) => c.percent === 100);

  const stats = [
    {
      label: "Курсов",
      value: allCourses.length,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Уроков пройдено",
      value: completedLessons,
      icon: Award,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Сертификатов",
      value: earnedCertificates.length,
      icon: TrendingUp,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Средний прогресс",
      value: `${
        courseProgress.length === 0
          ? 0
          : Math.round(
              courseProgress.reduce((a, c) => a + c.percent, 0) /
                courseProgress.length
            )
      }%`,
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            {role === "TEACHER" ? "Кабинет учителя" : "Мой кабинет"}
          </h1>
          <p className="text-gray-500 mt-1">Привет, {session.user?.name}!</p>
        </div>
        {role === "TEACHER" && (
          <Link
            href="/teacher"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <GraduationCap className="w-5 h-5" /> Учительская панель
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="glass p-5 rounded-2xl shadow-sm border border-white/40 flex items-center gap-4 card-hover animate-fadeInUp"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Мои курсы</h2>
        {courseProgress.length === 0 ? (
          <EmptyState
            title="Пока нет курсов с уроками"
            description="Когда появятся курсы с уроками, они отобразятся здесь с вашим прогрессом."
            actionLabel="К каталогу курсов"
            actionHref="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courseProgress.map((course, idx) => (
              <div
                key={course.id}
                className="glass rounded-2xl shadow-sm border border-white/40 overflow-hidden card-hover animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={course.image || ""}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900">{course.title}</h3>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Прогресс</span>
                      <span>
                        {course.percent}% ({course.doneLessons}/
                        {course.totalLessons})
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${course.percent}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link
                    href={`/courses/${course.id}`}
                    className="mt-4 block text-center w-full bg-blue-50 text-blue-600 font-medium py-2 rounded-xl hover:bg-blue-100 transition"
                  >
                    {course.percent > 0
                      ? course.percent === 100
                        ? "Повторить"
                        : "Продолжить"
                      : "Начать"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {earnedCertificates.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" /> Мои сертификаты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earnedCertificates.map((course) => (
              <Link
                key={course.id}
                href={`/certificate/${course.id}`}
                className="glass rounded-2xl border border-yellow-200 p-6 card-hover bg-gradient-to-br from-yellow-50/50 to-orange-50/50"
              >
                <Award className="w-12 h-12 text-yellow-500 mb-3" />
                <h3 className="font-bold">{course.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Выдан за прохождение курса
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}