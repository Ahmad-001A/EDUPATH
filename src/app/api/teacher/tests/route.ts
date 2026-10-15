import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    where: role === "ADMIN" ? {} : { teacherId: userId },
    select: { id: true },
  });

  const tests = await prisma.test.findMany({
    where: { courseId: { in: courses.map((c) => c.id) } },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, title: true } },
      questions: { include: { options: true } },
      _count: { select: { results: true } },
    },
  });

  return NextResponse.json(tests);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, courseId, timeLimit, passScore, questions, grades } = body;

  if (!title || !courseId || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }

  const validGrades = Array.isArray(grades)
    ? grades.filter((g: any) => Number.isInteger(g) && g >= 1 && g <= 11)
    : [];

  const test = await prisma.test.create({
    data: {
      title,
      description: description || null,
      courseId,
      timeLimit: timeLimit || 0,
      passScore: passScore || 70,
      grades: validGrades,
      questions: {
        create: questions.map((q: any, qi: number) => ({
          text: q.text,
          order: qi + 1,
          points: q.points || 1,
          options: {
            create: q.options.map((o: any, oi: number) => ({
              text: o.text,
              isCorrect: o.isCorrect || false,
              order: oi + 1,
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json(test, { status: 201 });
}
