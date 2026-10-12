export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FileText, Video, BookOpen, ExternalLink } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default async function LibraryPage() {
  const items = await prisma.libraryItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const icons: any = { PDF: FileText, VIDEO: Video, BOOK: BookOpen, ARTICLE: FileText };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Библиотека материалов</h1>
        <p className="text-gray-500 mt-1">
          Полезные ресурсы для обучения и вдохновения
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Материалов пока нет"
          description="Здесь будут появляться книги, статьи, видео и PDF для вашего обучения."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const Icon = icons[item.type] || FileText;
            return (
              <div
                key={item.id}
                className="glass rounded-2xl shadow-sm border border-white/40 p-6 card-hover animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {item.type}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {item.description || "Без описания"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {item.category}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline"
                  >
                    Открыть <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}