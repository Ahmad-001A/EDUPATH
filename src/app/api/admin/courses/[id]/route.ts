import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function checkAdmin() {
  const session = await auth();
  return (session?.user as any)?.role === "ADMIN";
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const validGrades = Array.isArray(body.grades)
    ? body.grades.filter((g: any) => Number.isInteger(g) && g >= 1 && g <= 11)
    : [];

  const course = await prisma.course.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      image: body.image,
      category: body.category,
      level: body.level,
      duration: body.duration,
      grades: validGrades,
      teacherId: body.teacherId || null,
    },
  });
  return NextResponse.json(course);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const { id } = await params;
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
