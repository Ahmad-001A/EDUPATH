import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  GraduationCap,
  Lightbulb,
  Rocket,
  Target,
  Zap,
  Star,
  Trophy,
  Cpu,
} from "lucide-react";

export default function HeroBanner({
  name,
  isLoggedIn,
}: {
  name?: string;
  isLoggedIn?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl glass-solid p-8 md:p-14 animate-fadeInUp">
      {/* ═══ БОЛЬШИЕ ИКОНКИ НА ФОНЕ ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -left-10 opacity-[0.12] text-white">
          <BookOpen className="w-56 h-56 md:w-72 md:h-72" strokeWidth={0.8} />
        </div>
        <div className="absolute -top-12 -right-12 opacity-[0.12] text-white rotate-12">
          <GraduationCap className="w-60 h-60 md:w-80 md:h-80" strokeWidth={0.8} />
        </div>
        <div className="absolute -bottom-16 -left-8 opacity-[0.10] text-white -rotate-12">
          <Trophy className="w-56 h-56 md:w-72 md:h-72" strokeWidth={0.8} />
        </div>
        <div className="absolute -bottom-14 -right-10 opacity-[0.12] text-white rotate-6">
          <Lightbulb className="w-56 h-56 md:w-72 md:h-72" strokeWidth={0.8} />
        </div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 opacity-[0.08] text-white">
          <Rocket className="w-44 h-44 md:w-56 md:h-56" strokeWidth={0.8} />
        </div>
        <div className="absolute top-10 right-1/3 opacity-[0.10] text-white">
          <Star className="w-32 h-32 md:w-40 md:h-40" strokeWidth={0.8} />
        </div>
        <div className="absolute bottom-8 right-1/4 opacity-[0.10] text-white">
          <Zap className="w-32 h-32 md:w-40 md:h-40" strokeWidth={0.8} />
        </div>
        <div className="absolute top-1/4 left-10 opacity-[0.08] text-white">
          <Cpu className="w-28 h-28 md:w-36 md:h-36" strokeWidth={0.8} />
        </div>
        <div className="absolute bottom-1/3 left-1/4 opacity-[0.08] text-white">
          <Target className="w-28 h-28 md:w-36 md:h-36" strokeWidth={0.8} />
        </div>
        <div className="absolute top-2/3 right-10 opacity-[0.10] text-white">
          <Award className="w-32 h-32 md:w-40 md:h-40" strokeWidth={0.8} />
        </div>
      </div>

      {/* ═══ БЛИКИ НА СТЕКЛЕ ═══ */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* ═══ ОСНОВНОЙ КОНТЕНТ ═══ */}
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-white/25 text-white px-4 py-2 rounded-full text-xs font-medium backdrop-blur-md border border-white/30">
          <Sparkles className="w-3.5 h-3.5" />
          {isLoggedIn ? "Добро пожаловать!" : "Начни учиться бесплатно"}
        </div>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight mt-5 text-white drop-shadow-lg">
          {isLoggedIn
            ? `Привет, ${name}! 👋`
            : "Твой путь к знаниям начинается здесь"}
        </h1>

        <p className="text-white/85 text-base md:text-lg leading-relaxed mt-4 max-w-xl drop-shadow">
          {isLoggedIn
            ? "Продолжай учиться, проходи тесты и получай сертификаты."
            : "Современные курсы, практические навыки и поддержка сообщества — всё в одном месте."}
        </p>

        <div className="flex flex-wrap gap-3 pt-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all"
          >
            {isLoggedIn ? "Мои курсы" : "Начать обучение"}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 bg-white/20 text-white border border-white/40 backdrop-blur-md px-6 py-3 rounded-2xl font-semibold hover:bg-white/30 transition-all"
          >
            Пройти тесты
          </Link>
        </div>
      </div>
    </div>
  );
}