import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;

  // ПРОВЕРКА: уже проходил?
  const existing = await prisma.testResult.findFirst({
    where: { userId, testId: id },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "Вы уже проходили этот тест. Повторная сдача невозможна.",
        result: existing,
      },
      { status: 403 }
    );
  }

  const { answers } = await req.json();

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });

  if (!test)
    return NextResponse.json({ error: "Тест не найден" }, { status: 404 });

  let score = 0;
  let maxScore = 0;

  for (const q of test.questions) {
    maxScore += q.points;
    const selected = answers[q.id] || [];
    const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
    const isCorrect =
      selected.length === correctIds.length &&
      selected.every((id: string) => correctIds.includes(id));
    if (isCorrect) score += q.points;
  }

  const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  const passed = percent >= test.passScore;

  const result = await prisma.testResult.create({
    data: {
      userId,
      testId: id,
      score,
      maxScore,
      percent,
      passed,
      answers: JSON.stringify(answers),
    },
  });

  return NextResponse.json(result, { status: 201 });
}