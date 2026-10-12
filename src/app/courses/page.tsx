export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, Users } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      teacher: { select: { name: true } },
      modules: { include: { lessons: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Каталог курсов</h1>
        <p className="text-gray-500 mt-1">
          Выберите направление и начните учиться уже сегодня
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="Курсов пока нет"
          description="Скоро здесь появятся курсы от наших преподавателей. Зайдите чуть позже!"
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
                className="glass rounded-3xl overflow-hidden group card-hover border border-white/40 animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={
                      course.image ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-xs font-semibold px-3 py-1.5 rounded-full text-gray-800">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{totalLessons} уроков</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/40">
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
                      <span className="text-xs text-gray-500">
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