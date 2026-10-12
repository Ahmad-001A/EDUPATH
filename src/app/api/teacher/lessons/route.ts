import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const { title, content, videoUrl, moduleId, videoDuration } = await req.json();
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { lessons: true },
  });
  if (!mod) return NextResponse.json({ error: "Модуль не найден" }, { status: 404 });

  const order = mod.lessons.length + 1;
  const lesson = await prisma.lesson.create({
    data: {
      title,
      content,
      videoUrl,
      videoDuration: videoDuration || 0,
      order,
      moduleId,
    },
  });
  return NextResponse.json(lesson, { status: 201 });
}