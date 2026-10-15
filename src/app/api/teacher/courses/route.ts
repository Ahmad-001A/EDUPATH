import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function checkTeacher() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") return null;
  return (session.user as any).id;
}

export async function POST(req: Request) {
  const userId = await checkTeacher();
  if (!userId)
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const body = await req.json();

  const validGrades = Array.isArray(body.grades)
    ? body.grades.filter((g: any) => Number.isInteger(g) && g >= 1 && g <= 11)
    : [];

  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      image:
        body.image ||
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      category: body.category,
      level: body.level,
      duration: body.duration,
      grades: validGrades,
      teacherId: userId,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
