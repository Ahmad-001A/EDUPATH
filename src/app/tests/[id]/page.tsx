"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Award,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Lock,
} from "lucide-react";

type Option = { id: string; text: string };
type Question = { id: string; text: string; points: number; options: Option[] };
type Test = {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number;
  passScore: number;
  course: { id: string; title: string };
  questions: Question[];
};
type MyResult = {
  id: string;
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  createdAt: string;
} | null;

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [test, setTest] = useState<Test | null>(null);
  const [myResult, setMyResult] = useState<MyResult>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch(`/api/tests/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTest(data.test);
        setMyResult(data.myResult);
        if (data.test?.timeLimit > 0) {
          setTimeLeft(data.test.timeLimit * 60);
        }
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 || result || myResult) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, result, myResult]);

  const toggleOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((i) => i !== optionId) };
      }
      return { ...prev, [questionId]: [...current, optionId] };
    });
  };

  const handleSubmit = async () => {
    if (submitting || result) return;
    setSubmitting(true);
    const res = await fetch(`/api/tests/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    } else {
      const data = await res.json();
      if (data.result) {
        setMyResult(data.result);
        alert(data.error);
      }
    }
    setSubmitting(false);
    setShowConfirm(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const answeredCount = Object.values(answers).filter(
    (a) => a.length > 0
  ).length;
  const progress =
    test && test.questions.length > 0
      ? Math.round((answeredCount / test.questions.length) * 100)
      : 0;

  if (loading) return <p className="text-gray-500">Загрузка...</p>;
  if (!test) return <p className="text-gray-500">Тест не найден</p>;

  // ============ ЭКРАН "УЖЕ ПРОЙДЕН" (БЛОКИРОВКА) ============
  if (myResult && !result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" /> К списку тестов
        </Link>

        <div className="glass p-10 rounded-3xl border border-white/50 text-center animate-scaleIn">
          <div
            className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl relative ${
              myResult.passed
                ? "bg-gradient-to-br from-green-400 to-emerald-500"
                : "bg-gradient-to-br from-red-400 to-rose-500"
            }`}
          >
            <div className="absolute inset-2 rounded-full border-4 border-white/40" />
            {myResult.passed ? (
              <CheckCircle className="w-14 h-14 text-white relative" />
            ) : (
              <XCircle className="w-14 h-14 text-white relative" />
            )}
          </div>

          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-xs font-medium mb-4">
            <Lock className="w-3 h-3" /> Тест уже пройден
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {myResult.passed ? "Тест сдан" : "Тест не сдан"}
          </h1>
          <p className="text-gray-500 mb-8">
            {myResult.passed
              ? `Вы успешно прошли тест «${test.title}»`
              : `К сожалению, вы не набрали достаточно баллов`}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            <div className="glass p-4 rounded-2xl border border-white/40">
              <p className="text-xs text-gray-500 mb-1">Правильно</p>
              <p className="text-2xl font-bold">
                {myResult.score}/{myResult.maxScore}
              </p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/40">
              <p className="text-xs text-gray-500 mb-1">Процент</p>
              <p className="text-2xl font-bold">{myResult.percent}%</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/40">
              <p className="text-xs text-gray-500 mb-1">Дата</p>
              <p className="text-sm font-bold">
                {new Date(myResult.createdAt).toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            Повторная сдача этого теста невозможна
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() =>
                router.push(`/tests/${id}/result/${myResult.id}`)
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition shadow-lg"
            >
              Разбор ответов
            </button>
            <button
              onClick={() => router.push("/tests")}
              className="glass px-6 py-3 rounded-xl border border-white/40 font-medium hover:bg-white/60 transition"
            >
              К списку тестов
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ ЭКРАН РЕЗУЛЬТАТА (после сдачи) ============
  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" /> К списку тестов
        </Link>

        <div className="glass p-10 rounded-3xl border border-white/50 text-center animate-scaleIn">
          <div
            className={`w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl relative ${
              result.passed
                ? "bg-gradient-to-br from-green-400 to-emerald-500"
                : "bg-gradient-to-br from-red-400 to-rose-500"
            }`}
          >
            <div className="absolute inset-2 rounded-full border-4 border-white/40" />
            {result.passed ? (
              <CheckCircle className="w-16 h-16 text-white relative" />
            ) : (
              <XCircle className="w-16 h-16 text-white relative" />
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {result.passed ? "Поздравляем! 🎉" : "Тест не сдан"}
          </h1>
          <p className="text-gray-500 mb-8">
            {result.passed
              ? `Вы успешно прошли тест «${test.title}»`
              : `Попробуйте лучше в следующем тесте`}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            <div className="glass p-4 rounded-2xl border border-white/40">
              <p className="text-xs text-gray-500 mb-1">Правильно</p>
              <p className="text-2xl font-bold">
                {result.score}/{result.maxScore}
              </p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/40">
              <p className="text-xs text-gray-500 mb-1">Процент</p>
              <p className="text-2xl font-bold">{result.percent}%</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/40">
              <p className="text-xs text-gray-500 mb-1">Порог</p>
              <p className="text-2xl font-bold">{test.passScore}%</p>
            </div>
          </div>

          <div className="glass p-3 rounded-xl border border-yellow-200 bg-yellow-50/50 mb-6 inline-flex items-center gap-2 text-sm text-yellow-800">
            <Lock className="w-4 h-4" /> Повторная сдача невозможна
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            {result?.id && (
              <button
                onClick={() => router.push(`/tests/${id}/result/${result.id}`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition shadow-lg"
              >
                Разбор ответов
              </button>
            )}
            <button
              onClick={() => router.push("/tests")}
              className="glass px-6 py-3 rounded-xl border border-white/40 font-medium hover:bg-white/60 transition"
            >
              К списку тестов
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ ЭКРАН ПРОХОЖДЕНИЯ ============
  const q = test.questions[currentQ];
  const isFirst = currentQ === 0;
  const isLast = currentQ === test.questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="glass rounded-2xl border border-white/40 overflow-hidden sticky top-16 z-40">
        <div className="p-4 md:p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/tests"
              className="p-2 rounded-lg hover:bg-white/50"
              title="Выйти"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-sm md:text-base line-clamp-1">
                {test.title}
              </h1>
              <p className="text-xs text-gray-500">{test.course.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              <span className="font-bold text-gray-900">{answeredCount}</span>/
              {test.questions.length} отвечено
            </div>
            {test.timeLimit > 0 && (
              <div
                className={`glass px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                  timeLeft < 60
                    ? "border-red-300 bg-red-50/50 animate-pulse"
                    : "border-white/40"
                }`}
              >
                <Clock
                  className={`w-4 h-4 ${
                    timeLeft < 60 ? "text-red-500" : "text-orange-500"
                  }`}
                />
                <span
                  className={`font-bold text-sm ${
                    timeLeft < 60 ? "text-red-600" : ""
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="h-1 bg-white/40">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="glass rounded-2xl border border-white/40 p-4 sticky top-40">
            <p className="text-xs font-bold mb-3 text-gray-500 uppercase tracking-wider">
              Вопросы
            </p>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
              {test.questions.map((question, i) => {
                const answered = answers[question.id]?.length > 0;
                const isCurrent = i === currentQ;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                      isCurrent
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110"
                        : answered
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-white/60 text-gray-500 hover:bg-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/40 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100" />
                <span className="text-gray-500">Отвечено</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-white/60 border border-gray-200" />
                <span className="text-gray-500">Не отвечено</span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium py-2.5 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg text-sm"
            >
              <Send className="w-4 h-4" /> Завершить тест
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
          <div className="glass rounded-3xl border-2 border-white/50 p-6 md:p-8 animate-fadeInUp shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {currentQ + 1}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Вопрос {currentQ + 1} из {test.questions.length}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {q.points} {q.points === 1 ? "балл" : "балла"}
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <Flag className="w-6 h-6" />
              </div>
            </div>

            <h2 className="text-lg md:text-xl font-bold mb-6 leading-relaxed">
              {q.text}
            </h2>

            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id]?.includes(opt.id);
                const letters = ["A", "B", "C", "D", "E", "F"];
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl cursor-pointer transition-all border-2 group ${
                      selected
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-400 shadow-lg"
                        : "bg-white/40 border-white/40 hover:border-blue-200 hover:bg-white/60"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shrink-0 ${
                        selected
                          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110"
                          : "bg-white/60 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}
                    >
                      {letters[idx]}
                    </div>
                    <span className="flex-1 font-medium">{opt.text}</span>
                    <input
                      type="checkbox"
                      checked={selected || false}
                      onChange={() => toggleOption(q.id, opt.id)}
                      className="hidden"
                    />
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
              disabled={isFirst}
              className="glass px-5 py-3 rounded-xl border border-white/40 font-medium hover:bg-white/60 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" /> Назад
            </button>

            <div className="text-sm text-gray-500">
              {currentQ + 1} / {test.questions.length}
            </div>

            {!isLast ? (
              <button
                onClick={() => setCurrentQ((c) => c + 1)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 transition flex items-center gap-2 shadow-lg"
              >
                Далее <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 transition flex items-center gap-2 shadow-lg"
              >
                Завершить <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-3xl max-w-md w-full border border-white/40 modal-animate text-center">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Завершить тест?</h3>
            <p className="text-gray-500 mb-2">
              Вы ответили на <b>{answeredCount}</b> из{" "}
              <b>{test.questions.length}</b> вопросов.
            </p>
            <div className="glass p-3 rounded-xl border border-red-200 bg-red-50/50 mb-6 text-sm text-red-700 font-medium">
              ⚠️ Внимание! После отправки тест нельзя будет пройти снова.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}