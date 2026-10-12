import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const userId = (session.user as any).id;
  const { courseId, message } = await req.json();

  const existing = await prisma.certRequest.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Заявка уже отправлена" }, { status: 400 });
  }

  const request = await prisma.certRequest.create({
    data: { userId, courseId, message, status: "PENDING" },
  });
  return NextResponse.json(request, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const userId = (session.user as any).id;

  const requests = await prisma.certRequest.findMany({
    where: { userId },
    include: { course: { select: { id: true, title: true } } },
  });
  return NextResponse.json(requests);
}