export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Clock, Users, Star, BookOpen } from "lucide-react";
import CertRequestButton from "@/components/CertRequestButton";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      teacher: { select: { name: true, email: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!course) notFound();

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );

  const firstLesson = course.modules.flatMap((m) => m.lessons)[0];

  // Прогресс ученика
  let completedCount = 0;
  let percent = 0;
  if (session?.user) {
    const userId = (session.user as any).id;
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    completedCount = await prisma.progress.count({
      where: {
        userId,
        completed: true,
        lessonId: { in: lessonIds },
      },
    });
    percent = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
  }

  return (
    <div className="space-y-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Назад к каталогу
      </Link>

      <div className="glass rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div className="h-72 relative">
          <img
            src={
              course.image ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
            }
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-8">
            <div>
              <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                {course.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">
                {course.title}
              </h1>
              {course.teacher?.name && (
                <p className="text-white/80 mt-2 text-sm">
                  👨‍🏫 Преподаватель: {course.teacher.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" /> {course.duration}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> {totalLessons} уроков
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                {course.level}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">О курсе</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Программа курса</h2>

              {course.modules.length === 0 ? (
                <div className="glass p-8 rounded-xl text-center border border-white/40">
                  <p className="text-gray-500 text-sm">
                    Программа курса скоро появится
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.modules.map((mod) => (
                    <div
                      key={mod.id}
                      className="glass rounded-xl border border-white/40 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/40 bg-white/40">
                        <h3 className="font-medium text-gray-900">
                          Модуль {mod.order}. {mod.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {mod.lessons.length} уроков
                        </p>
                      </div>

                      {mod.lessons.length > 0 && (
                        <div className="p-2">
                          {mod.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/courses/${course.id}/lessons/${lesson.id}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/60 transition"
                            >
                              <Play className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="text-sm">
                                {lesson.order}. {lesson.title}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24 border border-white/50">
              <h3 className="font-bold text-lg mb-4">Прогресс обучения</h3>

              {session?.user ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Пройдено</span>
                      <span className="font-bold">
                        {completedCount} / {totalLessons}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {percent}% курса
                    </p>
                  </div>

                  {firstLesson ? (
                    <Link
                      href={`/courses/${course.id}/lessons/${firstLesson.id}`}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      {completedCount === 0
                        ? "Начать курс"
                        : percent === 100
                        ? "Повторить"
                        : "Продолжить"}
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-white font-medium py-3 rounded-xl cursor-not-allowed"
                    >
                      Уроки скоро появятся
                    </button>
                  )}

                  {percent === 100 && totalLessons > 0 && (
                    <CertRequestButton courseId={course.id} />
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Войдите, чтобы отслеживать прогресс
                  </p>
                  <Link
                    href="/login"
                    className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    Войти
                  </Link>
                </>
              )}

              <div className="mt-6 space-y-2 text-sm text-gray-600 border-t border-white/40 pt-4">
                <div className="flex items-center justify-between">
                  <span>Уровень</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Уроков</span>
                  <span className="font-medium">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Длительность</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}