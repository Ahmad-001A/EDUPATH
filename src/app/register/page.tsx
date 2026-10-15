"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, GraduationCap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, grade }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка регистрации");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="glass-card p-8 rounded-3xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-[#0f1c3f]">
          Регистрация
        </h1>
        <p className="text-[#8a95b8] text-center mb-8">
          Создайте аккаунт EduPath
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#4a5578]">
              Имя
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a95b8] w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 bg-white/60 text-[#0f1c3f]"
                placeholder="Ахмад"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#4a5578]">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a95b8] w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 bg-white/60 text-[#0f1c3f]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#4a5578]">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a95b8] w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 bg-white/60 text-[#0f1c3f]"
                placeholder="Минимум 6 символов"
              />
            </div>
          </div>

          {/* ВЫБОР КЛАССА */}
          <div>
            <label className="block text-sm font-medium mb-1 text-[#4a5578]">
              Ваш класс
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a95b8] w-5 h-5 pointer-events-none" />
              <select
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
                required
                className="w-full pl-10 pr-4 py-3 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6a7dff]/40 bg-white/60 text-[#0f1c3f] appearance-none cursor-pointer"
              >
                {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    {g} класс
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-[#8a95b8] mt-1">
              Вы будете видеть курсы и тесты только для своего класса
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#4f7cff] to-[#7c5cff] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Зарегистрироваться
          </button>
        </form>

        <p className="text-center text-sm text-[#8a95b8] mt-6">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="text-[#3561d4] font-semibold hover:underline"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
