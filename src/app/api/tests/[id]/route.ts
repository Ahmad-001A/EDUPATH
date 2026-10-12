import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
            select: { id: true, text: true, order: true },
          },
        },
      },
    },
  });

  if (!test)
    return NextResponse.json({ error: "Тест не найден" }, { status: 404 });

  // Результат пользователя, если уже проходил
  let myResult = null;
  if (session?.user) {
    const userId = (session.user as any).id;
    myResult = await prisma.testResult.findFirst({
      where: { userId, testId: id },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json({ test, myResult });
}