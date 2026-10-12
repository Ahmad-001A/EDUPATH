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
} from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default async function TestsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const tests = await prisma.test.findMany({
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
        select: { testId: true, percent: true, passed: true, createdAt: true },
        orderBy: { createdAt: "desc" },
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
      <div>
        <h1 className="text-3xl font-bold gradient-text">Тесты</h1>
        <p className="text-gray-500 mt-1">
          Проверьте свои знания по предметам
        </p>
      </div>

      {tests.length === 0 ? (
        <EmptyState
          title="Тестов пока нет"
          description="Скоро преподаватели добавят тесты по своим предметам. Следите за обновлениями!"
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catTests]) => (
            <div key={category} className="animate-fadeInUp">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {catTests.map((test, idx) => {
                  const my = myBestResult.get(test.id);
                  return (
                    <Link
                      key={test.id}
                      href={`/tests/${test.id}`}
                      className="glass rounded-2xl border border-white/40 p-6 card-hover flex flex-col animate-fadeInUp"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
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

                      <h3 className="font-bold text-lg mb-1 line-clamp-1">
                        {test.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[40px]">
                        {test.description || test.course?.title}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-3 border-t border-white/40">
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
                        <span className="text-xs font-semibold text-blue-600">
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