export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  Users,
  Award,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default async function TestsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const userGrade =
    role === "STUDENT" ? (session?.user as any)?.grade : null;

  const where: any = {};
  if (userGrade) {
    where.OR = [
      { grades: { isEmpty: true } },
      { grades: { has: userGrade } },
    ];
  }

  const tests = await prisma.test.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        select: { id: true, title: true, category: true, image: true },
      },
      questions: { select: { id: true } },
      _count: { select: { results: true } },
    },
  });

  const myResults = userId
    ? await prisma.testResult.findMany({
        where: { userId },
        select: { testId: true, percent: true, passed: true },
      })
    : [];

  const myBestResult = new Map<string, { percent: number; passed: boolean }>();
  for (const r of myResults) {
    const existing = myBestResult.get(r.testId);
    if (!existing || r.percent > existing.percent) {
      myBestResult.set(r.testId, { percent: r.percent, passed: r.passed });
    }
  }

  const grouped: Record<string, typeof tests> = {};
  for (const t of tests) {
    const cat = t.course?.category || "Без категории";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0f1c3f]">Тесты</h1>
          <p className="text-[#4a5578] mt-2">
            {userGrade
              ? `Тесты для ${userGrade} класса`
              : "Проверьте свои знания по предметам"}
          </p>
        </div>
        {userGrade && (
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#3561d4]" />
            <span className="font-semibold text-[#0f1c3f]">
              {userGrade} класс
            </span>
          </div>
        )}
      </div>

      {tests.length === 0 ? (
        <EmptyState
          title="Тестов пока нет"
          description={
            userGrade
              ? `Для ${userGrade} класса пока нет тестов. Зайдите позже!`
              : "Скоро преподаватели добавят тесты."
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catTests]) => (
            <div key={category} className="animate-fadeInUp">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#0f1c3f]">
                <span className="w-2 h-6 bg-gradient-to-b from-[#4f7cff] to-[#7c5cff] rounded-full" />
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {catTests.map((test, idx) => {
                  const my = myBestResult.get(test.id);
                  return (
                    <Link
                      key={test.id}
                      href={`/tests/${test.id}`}
                      className="glass-card rounded-2xl p-6 card-hover flex flex-col animate-fadeInUp"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-gradient-to-br from-[#7c5cff] to-[#4f7cff] rounded-2xl text-white shadow-lg shadow-indigo-500/40">
                          <ClipboardList className="w-6 h-6" />
                        </div>
                        {my && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              my.passed
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {my.passed ? (
                              <>
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                {my.percent}%
                              </>
                            ) : (
                              `${my.percent}% — не сдан`
                            )}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-lg mb-1 line-clamp-1 text-[#0f1c3f]">
                        {test.title}
                      </h3>
                      <p className="text-sm text-[#4a5578] line-clamp-2 mb-3 min-h-[40px]">
                        {test.description || test.course?.title}
                      </p>

                      {test.grades.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs font-semibold bg-[#eef0ff] text-[#7c5cff] px-2 py-1 rounded-full">
                            {test.grades.join(", ")} кл.
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-[#8a95b8] mt-auto pt-3 border-t border-white/60">
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-4 h-4" />
                          {test.questions.length} вопр.
                        </span>
                        {test.timeLimit > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {test.timeLimit} мин
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {test._count.results}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs font-semibold text-[#3561d4]">
                          Порог: {test.passScore}%
                        </span>
                        <Award className="w-4 h-4 text-yellow-500" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
