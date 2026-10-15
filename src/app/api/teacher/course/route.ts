import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Войдите" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== "TEACHER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  return NextResponse.json(courses);
}
