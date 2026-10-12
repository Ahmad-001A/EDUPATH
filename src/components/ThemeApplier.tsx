"use client";
import { useEffect } from "react";

export default function ThemeApplier() {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          document.documentElement.setAttribute("data-theme", data.theme || "blue");
        }
      } catch {}
    };
    fetchTheme();
  }, []);
  return null;
}