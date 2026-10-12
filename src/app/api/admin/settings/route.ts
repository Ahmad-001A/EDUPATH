import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function checkAdmin() {
  const session = await auth();
  return (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "main" } });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const body = await req.json();
  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      siteName: body.siteName,
      siteDescription: body.siteDescription,
      contactEmail: body.contactEmail,
      theme: body.theme,
    },
    create: {
      id: "main",
      siteName: body.siteName,
      siteDescription: body.siteDescription,
      contactEmail: body.contactEmail,
      theme: body.theme,
    },
  });
  return NextResponse.json(settings);
}