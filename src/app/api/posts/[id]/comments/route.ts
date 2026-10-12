import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Пустой комментарий" }, { status: 400 });
  const comment = await prisma.comment.create({
    data: { content, postId: id, userId: (session.user as any).id },
  });
  return NextResponse.json(comment, { status: 201 });
}