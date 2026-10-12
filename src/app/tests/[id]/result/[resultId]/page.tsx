import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default async function TestResultPage({
  params,
}: {
  params: Promise<{ id: string; resultId: string }>;
}) {
  const { id, resultId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const result = await prisma.testResult.findUnique({
    where: { id: resultId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      test: {
        include: {
          course: { select: { title: true } },
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  if (!result) notFound();

  // Доступ: сам ученик, учитель курса, админ
  const course = await prisma.course.findUnique({
    where: { id: result.test.courseId },
  });
  const isOwner = result.userId === userId;
  const isTeacher = course?.teacherId === userId;
  const isAdmin = role === "ADMIN";
  if (!isOwner && !isTeacher && !isAdmin) redirect("/");

  const answers: Record<string, string[]> = JSON.parse(result.answers);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href={isOwner ? "/tests" : `/teacher/tests/${id}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>

      <div className="glass p-8 rounded-3xl border border-white/50 text-center">
        <div
          className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            result.passed
              ? "bg-gradient-to-br from-green-400 to-emerald-500"
              : "bg-gradient-to-br from-red-400 to-rose-500"
          }`}
        >
          {result.passed ? (
            <CheckCircle className="w-12 h-12 text-white" />
          ) : (
            <XCircle className="w-12 h-12 text-white" />
          )}
        </div>

        <h1 className="text-2xl font-bold">
          {result.test.title} — {result.passed ? "сдан" : "не сдан"}
        </h1>
        {isTeacher || isAdmin ? (
          <p className="text-gray-500 mt-1">
            Ученик: <b>{result.user.name}</b> ({result.user.email})
          </p>
        ) : null}
        <p className="text-gray-500 mt-1">
          Результат: {result.score}/{result.maxScore} ({result.percent}%)
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Разбор ответов</h2>

        {result.test.questions.map((q, qi) => {
          const selected = answers[q.id] || [];
          const correctIds = q.options
            .filter((o) => o.isCorrect)
            .map((o) => o.id);
          const isCorrect =
            selected.length === correctIds.length &&
            selected.every((s) => correctIds.includes(s));

          return (
            <div
              key={q.id}
              className={`glass p-6 rounded-2xl border ${
                isCorrect ? "border-green-300" : "border-red-300"
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                    isCorrect ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {isCorrect ? "✓" : "✕"}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {qi + 1}. {q.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {q.points} {q.points === 1 ? "балл" : "балла"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 ml-11">
                {q.options.map((opt) => {
                  const userSelected = selected.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-xl text-sm border ${
                        opt.isCorrect
                          ? "bg-green-50 border-green-200"
                          : userSelected
                          ? "bg-red-50 border-red-200"
                          : "bg-white/40 border-white/40"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          opt.isCorrect
                            ? "bg-green-500 border-green-500 text-white"
                            : userSelected
                            ? "bg-red-500 border-red-500 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {opt.isCorrect && "✓"}
                        {!opt.isCorrect && userSelected && "✕"}
                      </div>
                      <span>{opt.text}</span>
                      {opt.isCorrect && (
                        <span className="ml-auto text-xs text-green-700 font-medium">
                          Правильный
                        </span>
                      )}
                      {!opt.isCorrect && userSelected && (
                        <span className="ml-auto text-xs text-red-700 font-medium">
                          Ваш выбор
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}