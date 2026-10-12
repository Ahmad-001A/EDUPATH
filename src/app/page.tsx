export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  BookOpen,
  Award,
  TrendingUp,
  CheckCircle,
  MoreHorizontal,
  GraduationCap,
  Lightbulb,
  Rocket,
  Star,
  Target,
  Trophy,
  Zap,
  BookMarked,
  Pencil,
} from "lucide-react";
import Footer from "@/components/Footer";

export default async function Home() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const [coursesCount, myProgress, testsCount, myTests, courses, settings] =
    await Promise.all([
      prisma.course.count(),
      userId
        ? prisma.progress.count({ where: { userId, completed: true } })
        : 0,
      prisma.test.count(),
      userId ? prisma.testResult.count({ where: { userId } }) : 0,
      prisma.course.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.siteSettings.findUnique({ where: { id: "main" } }),
    ]);

  const stats = [
    {
      label: "Курсов",
      value: coursesCount,
      icon: BookOpen,
      color: "from-indigo-500 to-blue-600",
      shadow: "shadow-indigo-300/60",
    },
    {
      label: "Уроков пройдено",
      value: myProgress,
      icon: Award,
      color: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-300/60",
    },
    {
      label: "Доступных тестов",
      value: testsCount,
      icon: TrendingUp,
      color: "from-sky-400 to-blue-500",
      shadow: "shadow-sky-300/60",
    },
    {
      label: "Тестов пройдено",
      value: myTests,
      icon: CheckCircle,
      color: "from-cyan-400 to-sky-500",
      shadow: "shadow-cyan-300/60",
    },
  ];

  return (
    <div className="space-y-8 pt-6">
      {/* HERO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeInUp">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
            Привет, {session?.user?.name || "гость"}! 👋
          </h1>
          <p className="text-slate-600 text-lg md:text-xl mt-4">
            {session
              ? "Продолжай в том же духе!"
              : "Войдите, чтобы начать учиться"}
          </p>
        </div>

        <div className="relative h-40 md:h-48 hidden md:block">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-xl shadow-yellow-300/50 rotate-[-8deg]">
              <Lightbulb className="w-10 h-10 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div className="absolute top-0 left-0 animate-float">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-300/50 rotate-[10deg]">
              <GraduationCap className="w-8 h-8 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div
            className="absolute top-1 right-0 animate-float"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-300/50 rotate-[-10deg]">
              <BookMarked className="w-7 h-7 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div
            className="absolute bottom-0 left-6 animate-float"
            style={{ animationDelay: "1s" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-300/50 rotate-[6deg]">
              <Rocket className="w-7 h-7 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div
            className="absolute bottom-1 right-4 animate-float"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-300/50 rotate-[-6deg]">
              <Trophy className="w-7 h-7 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div
            className="absolute top-1/3 left-1/4 animate-float"
            style={{ animationDelay: "2s" }}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-300/50 rotate-12">
              <Star className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
          </div>
          <div
            className="absolute top-1/2 right-1/4 animate-float"
            style={{ animationDelay: "2.5s" }}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-300/50 -rotate-12">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
          </div>
          <div
            className="absolute bottom-1/3 right-1/3 animate-float"
            style={{ animationDelay: "3s" }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-300/50 rotate-6">
              <Target className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
          </div>
          <div
            className="absolute top-1/4 right-1/2 animate-float"
            style={{ animationDelay: "1.2s" }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center shadow-lg shadow-red-300/50 rotate-45">
              <Pencil className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
          </div>
        </div>
      </div>

      {/* СТАТИСТИКА */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-solid rounded-2xl p-5 flex items-center gap-4 card-hover animate-fadeInUp border-2 border-white/70"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow} shrink-0`}
            >
              <stat.icon className="w-7 h-7 text-white" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-600 mt-0.5 font-medium">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ПОСЛЕДНИЕ КУРСЫ */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-slate-900">
            Последние курсы
          </h2>
          <Link
            href="/courses"
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
          >
            Все курсы →
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="glass-solid rounded-3xl p-12 text-center border-2 border-white/70">
            <p className="text-slate-600">Курсов пока нет. Зайдите позже!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course, idx) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="glass-solid rounded-3xl p-4 md:p-5 flex flex-col md:flex-row gap-5 items-center card-hover animate-fadeInUp border-2 border-white/70"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="w-full md:w-64 h-40 md:h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                  <img
                    src={course.image || ""}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full mb-2">
                        {course.category}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                        {course.description}
                      </p>
                    </div>
                    <button className="w-9 h-9 rounded-full hover:bg-white/70 flex items-center justify-center text-slate-400 shrink-0">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-white/70 overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-800 shrink-0">
                      100%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ФУТЕР — только на главной странице */}
      <Footer siteName={settings?.siteName || "EduPath"} />
    </div>
  );
}