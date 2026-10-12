import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Award, ArrowLeft, CheckCircle } from "lucide-react";
import PrintButton from "@/components/PrintButton";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { include: { lessons: true } },
      teacher: { select: { name: true } },
    },
  });

  if (!course) notFound();

  const request = await prisma.certRequest.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!request || request.status !== "APPROVED") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" /> Назад к курсу
        </Link>
        <div className="glass p-12 rounded-2xl text-center border border-white/40">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium">Сертификат пока недоступен</p>
          <p className="text-gray-500 mt-2">
            {request?.status === "PENDING"
              ? "Ваша заявка на рассмотрении у учителя"
              : "Отправьте заявку на сертификат со страницы курса"}
          </p>
        </div>
      </div>
    );
  }

  const certNumber = `EP-${new Date().getFullYear()}-${courseId.slice(-6).toUpperCase()}`;
  const issuedDate = new Date(
    request.reviewedAt || Date.now()
  ).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`/courses/${courseId}`}
        className="no-print inline-flex items-center gap-2 text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Назад к курсу
      </Link>

      <div
        className="certificate-print rounded-3xl p-12 relative overflow-hidden animate-scaleIn"
        style={{
          background:
            "linear-gradient(135deg, #fef3c7 0%, #fde68a 40%, #fcd34d 100%)",
          border: "8px double #b45309",
          boxShadow: "0 25px 50px -12px rgba(180, 83, 9, 0.4)",
        }}
      >
        <div className="absolute top-4 left-4 w-24 h-24 border-4 border-yellow-700/30 rounded-full" />
        <div className="absolute bottom-4 right-4 w-32 h-32 border-4 border-yellow-700/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-8 border-yellow-700/10 rounded-full" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-16 h-16 text-yellow-700" />
          </div>

          <p className="text-sm uppercase tracking-[0.4em] text-yellow-800 font-bold mb-3">
            Сертификат
          </p>
          <h1 className="text-5xl font-serif font-bold text-yellow-900 mb-2">
            Об окончании
          </h1>

          <div className="my-8">
            <p className="text-yellow-800 text-sm uppercase tracking-widest mb-2">
              Настоящий сертификат выдан
            </p>
            <p
              className="text-4xl font-bold text-yellow-900 italic"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {session.user?.name}
            </p>
          </div>

          <div className="my-8 max-w-2xl mx-auto">
            <p className="text-yellow-800 text-sm">за успешное прохождение курса</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              «{course.title}»
            </p>
            <p className="text-yellow-800 text-sm mt-2">
              под руководством{" "}
              {course.teacher?.name || "преподавателя платформы"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-12 pt-8 border-t-2 border-yellow-700/30">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-yellow-800 mb-1">
                Номер
              </p>
              <p className="font-bold text-yellow-900">{certNumber}</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-yellow-700 mx-auto mb-1" />
              <p className="text-xs text-yellow-800">Одобрено преподавателем</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-yellow-800 mb-1">
                Дата выдачи
              </p>
              <p className="font-bold text-yellow-900">{issuedDate}</p>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-yellow-800">
            <div className="w-16 h-0.5 bg-yellow-700/40" />
            <span className="text-sm font-serif italic">
              EduPath Platform
            </span>
            <div className="w-16 h-0.5 bg-yellow-700/40" />
          </div>
        </div>
      </div>

      <PrintButton />
    </div>
  );
}