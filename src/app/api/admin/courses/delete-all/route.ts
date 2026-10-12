import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    // Удаляем всё связанное с курсами (каскадно)
    await prisma.progress.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.course.deleteMany({});

    return NextResponse.json({ success: true, message: "Все курсы удалены" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}