import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function checkAdmin() {
  const session = await auth();
  return (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { teacher: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const body = await req.json();

  const validGrades = Array.isArray(body.grades)
    ? body.grades.filter((g: any) => Number.isInteger(g) && g >= 1 && g <= 11)
    : [];

  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      image: body.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      category: body.category,
      level: body.level,
      duration: body.duration,
      grades: validGrades,
      teacherId: body.teacherId || null,
    },
  });
  return NextResponse.json(course, { status: 201 });
}
