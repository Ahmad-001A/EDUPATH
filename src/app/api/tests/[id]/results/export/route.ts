import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "TEACHER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;

  const test = await prisma.test.findUnique({
    where: { id },
    select: { title: true },
  });

  const results = await prisma.testResult.findMany({
    where: { testId: id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const rows = [
    ["Ученик", "Email", "Баллы", "Максимум", "Процент", "Статус", "Дата"],
    ...results.map((r) => [
      r.user.name || "Без имени",
      r.user.email,
      String(r.score),
      String(r.maxScore),
      `${r.percent}%`,
      r.passed ? "Сдал" : "Не сдал",
      new Date(r.createdAt).toLocaleString("ru-RU"),
    ]),
  ];

  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = "\uFEFF" + csv;

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="test-${id}.csv"`,
    },
  });
}