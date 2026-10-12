import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json();

  const updated = await prisma.certRequest.update({
    where: { id },
    data: { status, reviewedAt: new Date() },
  });
  return NextResponse.json(updated);
}