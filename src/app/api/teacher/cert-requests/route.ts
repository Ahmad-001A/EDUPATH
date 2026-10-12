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
    where: { teacherId: userId },
    select: { id: true },
  });

  const requests = await prisma.certRequest.findMany({
    where: { courseId: { in: courses.map((c) => c.id) }, status: "PENDING" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Для каждой заявки считаем прогресс ученика
  const enriched = await Promise.all(
    requests.map(async (r) => {
      const course = await prisma.course.findUnique({
        where: { id: r.courseId },
        include: { modules: { include: { lessons: true } } },
      });
      const lessonIds = course?.modules.flatMap((m) => m.lessons.map((l) => l.id)) || [];
      const completedCount = await prisma.progress.count({
        where: { userId: r.userId, completed: true, lessonId: { in: lessonIds } },
      });
      return {
        ...r,
        totalLessons: lessonIds.length,
        completedLessons: completedCount,
      };
    })
  );

  return NextResponse.json(enriched);
}
