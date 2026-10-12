import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, title: true, category: true } },
      _count: { select: { questions: true, results: true } },
    },
  });
  return NextResponse.json(tests);
}