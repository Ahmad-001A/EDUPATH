import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const notifications: any[] = [];

  if (role === "TEACHER" || role === "ADMIN") {
    const courses = await prisma.course.findMany({
      where: role === "ADMIN" ? {} : { teacherId: userId },
      select: { id: true },
    });
    const pending = await prisma.certRequest.count({
      where: { courseId: { in: courses.map((c) => c.id) }, status: "PENDING" },
    });
    if (pending > 0) {
      notifications.push({
        id: "cert-requests",
        type: "cert-request",
        title: "Заявки на сертификат",
        text: `У вас ${pending} новых заявок`,
        href: "/teacher",
      });
    }
  }

  const approved = await prisma.certRequest.findMany({
    where: { userId, status: "APPROVED" },
    include: { course: { select: { title: true } } },
    orderBy: { reviewedAt: "desc" },
    take: 5,
  });
  for (const a of approved) {
    notifications.push({
      id: `cert-${a.id}`,
      type: "certificate",
      title: "Сертификат одобрен",
      text: `Курс «${a.course.title}»`,
      href: `/certificate/${a.courseId}`,
    });
  }

  return NextResponse.json(notifications);
}