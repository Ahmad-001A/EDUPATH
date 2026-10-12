import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const { title, courseId } = await req.json();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: true },
  });

  if (!course) return NextResponse.json({ error: "Курс не найден" }, { status: 404 });

  const order = course.modules.length + 1;

  const mod = await prisma.module.create({
    data: { title, order, courseId },
  });
  return NextResponse.json(mod, { status: 201 });
}