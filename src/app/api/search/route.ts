import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  const session = await auth();
  const role = (session?.user as any)?.role;

  if (q.length < 2) {
    return NextResponse.json({ courses: [], tests: [], library: [] });
  }

  // Для ученика — фильтр по классу
  const userGrade =
    role === "STUDENT" ? (session?.user as any)?.grade : null;

  const courseWhere: any = {
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ],
  };
  if (userGrade) {
    courseWhere.AND = [
      { OR: [{ grades: { isEmpty: true } }, { grades: { has: userGrade } }] },
    ];
  }

  const testWhere: any = {
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ],
  };
  if (userGrade) {
    testWhere.AND = [
      { OR: [{ grades: { isEmpty: true } }, { grades: { has: userGrade } }] },
    ];
  }

  const [courses, tests, library] = await Promise.all([
    prisma.course.findMany({
      where: courseWhere,
      take: 5,
      select: { id: true, title: true, category: true, image: true },
    }),
    prisma.test.findMany({
      where: testWhere,
      take: 5,
      select: {
        id: true,
        title: true,
        course: { select: { title: true } },
      },
    }),
    prisma.libraryItem.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, title: true, type: true, category: true },
    }),
  ]);

  return NextResponse.json({ courses, tests, library });
}
