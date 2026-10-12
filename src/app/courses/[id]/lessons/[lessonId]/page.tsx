import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, BookOpen, Award } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import ReadingProgress from "@/components/ReadingProgress";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const session = await auth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: { course: true, lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!lesson) notFound();

  const userId = (session?.user as any)?.id;
  let completed = false;
  let watchedSeconds = 0;
  if (userId) {
    const prog = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    completed = prog?.completed || false;
    watchedSeconds = prog?.watchedSeconds || 0;
  }

  const ytMatch = lesson.videoUrl?.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
  );
  const ytId = ytMatch ? ytMatch[1] : null;

  const lessons = lesson.module.lessons;
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="space-y-6">
      <ReadingProgress />

      <Link
        href={`/courses/${id}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Назад к курсу
      </Link>

      <div className="glass rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-white/40">
          <p className="text-sm text-gray-500">
            {lesson.module.course.title} · Модуль {lesson.module.order}
          </p>
          <h1 className="text-2xl font-bold mt-1">
            {lesson.order}. {lesson.title}
          </h1>
        </div>

        <div className="p-8 space-y-6">
          {ytId && session ? (
            <VideoPlayer
              videoId={ytId}
              lessonId={lesson.id}
              videoDuration={lesson.videoDuration || 0}
              initialWatched={watchedSeconds}
              initialCompleted={completed}
            />
          ) : ytId && !session ? (
            <div className="glass p-6 rounded-xl border border-white/40 text-center">
              <p className="text-gray-500">
                <Link
                  href="/login"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Войдите
                </Link>
                , чтобы смотреть и отмечать прогресс
              </p>
            </div>
          ) : null}

          {lesson.content && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Материал урока
              </h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {lesson.content}
              </div>
            </div>
          )}

          {completed && (
            <div className="flex gap-3">
              {nextLesson ? (
                <Link
                  href={`/courses/${id}/lessons/${nextLesson.id}`}
                  className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  Следующий урок <Play className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href={`/certificate/${id}`}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" /> Получить сертификат
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/40 pt-6">
            {prevLesson ? (
              <Link
                href={`/courses/${id}/lessons/${prevLesson.id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4" /> Предыдущий
              </Link>
            ) : (
              <div />
            )}
            {nextLesson && (
              <Link
                href={`/courses/${id}/lessons/${nextLesson.id}`}
                className="flex items-center gap-2 text-blue-600 font-medium hover:underline"
              >
                Следующий урок <Play className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}