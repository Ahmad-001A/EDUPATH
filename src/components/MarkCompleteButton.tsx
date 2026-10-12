"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, X } from "lucide-react";

export default function MarkCompleteButton({
  lessonId,
  initialCompleted,
}: {
  lessonId: string;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: !completed }),
    });
    if (res.ok) {
      setCompleted(!completed);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 ${
        completed
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : completed ? (
        <X className="w-5 h-5" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}
      {completed ? "Отменить прохождение" : "Отметить как пройденное"}
    </button>
  );
}