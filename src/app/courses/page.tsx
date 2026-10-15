export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Clock, Users, GraduationCap } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default async function CoursesPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const userGrade =
    role === "STUDENT" ? (session?.user as any)?.grade : null;

  const where: any = {};
  if (userGrade) {
    where.OR = [
      { grades: { isEmpty: true } },
      { grades: { has: userGrade } },
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      teacher: { select: { name: true } },
      modules: { include: { lessons: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0f1c3f]">
            Каталог курсов
          </h1>
          <p className="text-[#4a5578] mt-2">
            {userGrade
              ? `Курсы для ${userGrade} класса`
              : "Выберите направление и начните учиться"}
          </p>
        </div>
        {userGrade && (
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#3561d4]" />
            <span className="font-semibold text-[#0f1c3f]">
              {userGrade} класс
            </span>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="Курсов пока нет"
          description={
            userGrade
              ? `Для ${userGrade} класса пока нет курсов. Зайдите позже!`
              : "Скоро здесь появятся курсы от наших преподавателей."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const totalLessons = course.modules.reduce(
              (sum, m) => sum + m.lessons.length,
              0
            );
            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="glass-card rounded-3xl overflow-hidden group card-hover animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={course.image || ""}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-xs font-semibold px-3 py-1.5 rounded-full text-[#0f1c3f]">
                      {course.category}
                    </span>
                  </div>
                  {course.grades.length > 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-[#7c5cff]/90 backdrop-blur-md text-xs font-semibold px-3 py-1.5 rounded-full text-white">
                        {course.grades.join(", ")} кл.
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1 text-[#0f1c3f]">
                    {course.title}
                  </h3>
                  <p className="text-sm text-[#4a5578] mb-4 line-clamp-2 min-h-[40px]">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#8a95b8] mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{totalLessons} уроков</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/60">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        course.level === "Начинающий"
                          ? "bg-green-100 text-green-700"
                          : course.level === "Средний"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {course.level}
                    </span>
                    {course.teacher?.name && (
                      <span className="text-xs text-[#8a95b8]">
                        👨‍🏫 {course.teacher.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
