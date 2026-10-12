import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const { name, email } = await req.json();
  const userId = (session.user as any).id;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email },
  });
  return NextResponse.json(user);
}