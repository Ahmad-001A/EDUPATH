"use client";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print glass px-6 py-3 rounded-xl border border-white/40 text-sm font-medium hover:bg-white/60 transition flex items-center gap-2 mx-auto"
    >
      <Printer className="w-4 h-4" /> Сохранить как PDF / Распечатать
    </button>
  );
}