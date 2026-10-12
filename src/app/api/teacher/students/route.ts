import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const courses = await prisma.course.findMany({
    where: { teacherId: userId },
    include: {
      modules: { include: { lessons: true } },
    },
  });

  const lessonIds = courses.flatMap(c => c.modules.flatMap(m => m.lessons.map(l => l.id)));

  const progresses = await prisma.progress.findMany({
    where: { lessonId: { in: lessonIds }, completed: true },
    include: { user: { select: { id: true, name: true, email: true } }, lesson: { select: { id: true, title: true } } },
  });

  const studentMap = new Map<string, { id: string; name: string | null; email: string; completedLessons: number; lastActivity: Date }>();
  for (const p of progresses) {
    const key = p.user.id;
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        completedLessons: 0,
        lastActivity: p.user ? new Date() : new Date(),
      });
    }
    const s = studentMap.get(key)!;
    s.completedLessons++;
  }

  const totalLessons = lessonIds.length;
  const students = Array.from(studentMap.values()).map(s => ({
    ...s,
    totalLessons,
    percent: totalLessons === 0 ? 0 : Math.round((s.completedLessons / totalLessons) * 100),
  }));

  return NextResponse.json({ students, totalLessons });
}