import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function checkTeacher() {
  const session = await auth();
  if (!session?.user) return false;
  const role = (session.user as any).role;
  return role === "TEACHER" || role === "ADMIN";
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkTeacher())) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      videoUrl: body.videoUrl,
      videoDuration: body.videoDuration || 0,
    },
  });
  return NextResponse.json(lesson);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkTeacher())) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const { id } = await params;
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ success: true });
}