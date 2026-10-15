import Link from "next/link";
import { GraduationCap, Mail, Send, Sparkles } from "lucide-react";

export default function Footer({ siteName = "EduPath" }: { siteName?: string }) {
  return (
    <footer className="mt-16 pt-8 pb-10">
      <div className="relative overflow-hidden rounded-3xl border-2 border-white/80 glass-solid p-8 md:p-12 shadow-2xl shadow-blue-200/40">
        {/* Декоративные пятна */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Верхний блок — о платформе */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-11 h-11 flex items-center justify-center rounded-2xl shadow-lg shadow-blue-300/60">
                  <GraduationCap className="w-6 h-6" />
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {siteName}
                </span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed max-w-md font-medium">
                Современная образовательная платформа, где студенты учатся,
                учителя преподают, а администраторы управляют всем процессом.
                Курсы, видеоуроки, тесты, сертификаты и живое сообщество — всё
                в одном месте.
              </p>
            </div>

            <div>
              <h3 className="text-blue-600 font-bold mb-4 text-sm uppercase tracking-wider">
                Разделы
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/courses"
                    className="text-slate-700 hover:text-blue-600 hover:translate-x-1 transition-all font-medium inline-flex items-center gap-1"
                  >
                    → Курсы
                  </Link>
                </li>
                <li>
                  <Link
                    href="/library"
                    className="text-slate-700 hover:text-blue-600 hover:translate-x-1 transition-all font-medium inline-flex items-center gap-1"
                  >
                    → Библиотека
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tests"
                    className="text-slate-700 hover:text-blue-600 hover:translate-x-1 transition-all font-medium inline-flex items-center gap-1"
                  >
                    → Тесты
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="text-slate-700 hover:text-blue-600 hover:translate-x-1 transition-all font-medium inline-flex items-center gap-1"
                  >
                    → Сообщество
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-blue-600 font-bold mb-4 text-sm uppercase tracking-wider">
                Возможности
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Проверка видео
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Тесты с защитой
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Сертификаты
                </li>
              </ul>
            </div>
          </div>

          {/* Роли */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-2xl p-4 border-2 border-white/70 flex items-start gap-3 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-200/50 transition-all card-hover">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-blue-300/60">
                🎓
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Ученик</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Учится, проходит тесты, получает сертификаты
                </p>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 border-2 border-white/70 flex items-start gap-3 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-200/50 transition-all card-hover">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-cyan-300/60">
                👨‍🏫
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Учитель</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Создаёт курсы, ведёт тесты, следит за учениками
                </p>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 border-2 border-white/70 flex items-start gap-3 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-200/50 transition-all card-hover">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-purple-300/60">
                👑
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Админ</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Управляет пользователями, курсами, настройками
                </p>
              </div>
            </div>
          </div>

          {/* Технологии + миссия */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-white/80 bg-gradient-to-br from-blue-50/80 via-white/70 to-purple-50/80 backdrop-blur-xl p-6 mb-6 shadow-lg shadow-blue-200/40">
            <div className="absolute top-0 right-0 opacity-10 text-blue-600">
              <Sparkles className="w-32 h-32" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">
                Технологии
              </p>
              <p className="text-sm text-slate-800 font-semibold">
                Next.js 15 · React 19 · TypeScript · Tailwind v4 · Prisma 6 ·
                Supabase · NextAuth v5
              </p>
              <p className="text-sm text-slate-700 mt-4 italic font-medium">
                «Сделать качественное образование удобным, красивым и
                доступным каждому».
              </p>
            </div>
          </div>

          {/* Копирайт + контакты */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-white/60">
            <p className="text-xs text-slate-600 font-medium">
              © {new Date().getFullYear()} {siteName}. Все права защищены.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:perpendr@gmail.com"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 hover:bg-blue-50 border-2 border-white/80 hover:border-blue-300 text-slate-700 hover:text-blue-600 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-200/50 font-medium text-xs"
              >
                <Mail className="w-4 h-4" />
                perpendr@gmail.com
              </a>
              <a
                href="https://t.me/patrikpitt"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 hover:bg-blue-50 border-2 border-white/80 hover:border-blue-300 text-slate-700 hover:text-blue-600 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-200/50 font-medium text-xs"
              >
                <Send className="w-4 h-4" />
                @patrikpitt
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
