"use client";
import { useEffect, useState } from "react";
import { Award, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";

export default function CertRequestButton({ courseId }: { courseId: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchStatus = async () => {
    const res = await fetch("/api/cert-requests", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const mine = data.find((r: any) => r.courseId === courseId);
      setStatus(mine?.status || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, [courseId]);

  const request = async () => {
    setSending(true);
    const res = await fetch("/api/cert-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, message: "Прошу выдать сертификат" }),
    });
    if (res.ok) {
      setStatus("PENDING");
    } else {
      const data = await res.json();
      alert(data.error || "Ошибка");
    }
    setSending(false);
  };

  if (loading) return <div className="h-12 bg-white/40 rounded-xl animate-pulse" />;

  if (status === "APPROVED") {
    return (
      <Link
        href={`/certificate/${courseId}`}
        className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
      >
        <Award className="w-5 h-5" /> Сертификат выдан — открыть
      </Link>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="mt-4 w-full bg-yellow-100 text-yellow-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2">
        <Clock className="w-5 h-5" /> Заявка на рассмотрении
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="mt-4 space-y-2">
        <div className="w-full bg-red-100 text-red-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2">
          <XCircle className="w-5 h-5" /> Заявка отклонена
        </div>
        <button
          onClick={request}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Отправить повторно
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={request}
      disabled={sending}
      className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Award className="w-5 h-5" />}
      Запросить сертификат
    </button>
  );
}