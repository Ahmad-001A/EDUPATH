"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, BookOpen, ClipboardList, FileText, Loader2, X } from "lucide-react";

type CourseResult = {
  id: string;
  title: string;
  category: string;
  image: string | null;
};
type TestResult = {
  id: string;
  title: string;
  course: { title: string };
};
type LibraryResult = {
  id: string;
  title: string;
  type: string;
  category: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    courses: CourseResult[];
    tests: TestResult[];
    library: LibraryResult[];
  }>({ courses: [], tests: [], library: [] });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Закрываем при клике вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce поиска
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ courses: [], tests: [], library: [] });
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults({
          courses: data.courses || [],
          tests: data.tests || [],
          library: data.library || [],
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Горячая клавиша Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const total =
    results.courses.length + results.tests.length + results.library.length;
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div className="relative hidden md:block" ref={wrapperRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Поиск... (Ctrl+K)"
        className="pl-10 pr-10 py-2 bg-white/70 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white border border-white/70 w-48 lg:w-72 transition-all"
      />
      {query && (
        <button
          onClick={() => {
            setQuery("");
            setResults({ courses: [], tests: [], library: [] });
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-solid rounded-2xl shadow-2xl border-2 border-white/70 overflow-hidden z-50 animate-scaleIn max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Поиск...
            </div>
          ) : total === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-slate-500">
                Ничего не найдено по запросу «{query}»
              </p>
            </div>
          ) : (
            <div className="py-2">
              {/* Курсы */}
              {results.courses.length > 0 && (
                <div className="px-2 py-1">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider px-3 py-2">
                    Курсы
                  </p>
                  {results.courses.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.id}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-50 transition"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {c.title}
                        </p>
                        <p className="text-xs text-slate-500">{c.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Тесты */}
              {results.tests.length > 0 && (
                <div className="px-2 py-1 border-t border-white/60">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider px-3 py-2">
                    Тесты
                  </p>
                  {results.tests.map((t) => (
                    <Link
                      key={t.id}
                      href={`/tests/${t.id}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-purple-50 transition"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t.course.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Библиотека */}
              {results.library.length > 0 && (
                <div className="px-2 py-1 border-t border-white/60">
                  <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider px-3 py-2">
                    Библиотека
                  </p>
                  {results.library.map((l) => (
                    <Link
                      key={l.id}
                      href="/library"
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-cyan-50 transition"
                    >
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {l.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {l.type} · {l.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}