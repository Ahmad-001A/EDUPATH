import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function checkAdmin() {
  const session = await auth();
  return (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  const items = await prisma.libraryItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const body = await req.json();
  const item = await prisma.libraryItem.create({
    data: {
      title: body.title,
      description: body.description || null,
      type: body.type,
      url: body.url,
      category: body.category,
    },
  });
  return NextResponse.json(item, { status: 201 });
}