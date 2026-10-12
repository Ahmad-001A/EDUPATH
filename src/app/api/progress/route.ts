import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Войдите" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, watchedSeconds, markComplete } = body;
    const userId = (session.user as any).id;

    if (!lessonId) {
      return NextResponse.json({ error: "Нет lessonId" }, { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
    }

    const existing = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    const newWatched = Math.max(
      Number(watchedSeconds) || 0,
      existing?.watchedSeconds || 0
    );

    let completed = existing?.completed || false;

    if (markComplete === true) {
      const duration = lesson.videoDuration || 0;
      if (duration === 0) {
        completed = true;
      } else {
        const percent = (newWatched / duration) * 100;
        if (percent >= 70) {
          completed = true;
        }
      }
    }

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { watchedSeconds: newWatched, completed },
      create: {
        userId,
        lessonId,
        watchedSeconds: newWatched,
        completed,
      },
    });

    return NextResponse.json({
      progress,
      requiredSeconds: Math.floor((lesson.videoDuration || 0) * 0.7),
      duration: lesson.videoDuration || 0,
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Войдите" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json({ error: "Нет lessonId" }, { status: 400 });
    }

    const progress = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    return NextResponse.json(
      progress || { watchedSeconds: 0, completed: false }
    );
  } catch (error) {
    console.error("Progress API GET error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}