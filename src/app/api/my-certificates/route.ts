import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });
  const userId = (session.user as any).id;

  const courses = await prisma.course.findMany({
    include: { modules: { include: { lessons: true } } },
  });

  const completedLessons = await prisma.progress.findMany({
    where: { userId, completed: true },
    select: { lessonId: true },
  });
  const completedIds = new Set(completedLessons.map(p => p.lessonId));

  const certs = courses
    .map(course => {
      const all = course.modules.flatMap(m => m.lessons);
      const done = all.filter(l => completedIds.has(l.id)).length;
      return {
        id: course.id,
        title: course.title,
        image: course.image,
        totalLessons: all.length,
        doneLessons: done,
        earned: all.length > 0 && done === all.length,
      };
    })
    .filter(c => c.earned);

  return NextResponse.json(certs);
}