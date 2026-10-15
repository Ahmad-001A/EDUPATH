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

  // Если роль TEACHER или ADMIN — убираем класс
  const grade =
    body.role === "STUDENT" ? body.grade ?? null : null;

  const user = await prisma.user.update({
    where: { id },
    data: {
      role: body.role,
      banned: body.banned,
      grade,
    },
  });
  return NextResponse.json(user);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
