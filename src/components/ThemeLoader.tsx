"use client";
import { useEffect } from "react";

export default function ThemeLoader() {
  useEffect(() => {
    const html = document.documentElement;
    const isDark = localStorage.getItem("userThemeDark") === "true";
    const savedLight = localStorage.getItem("userTheme") || "blue";

    if (isDark) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.setAttribute("data-theme", savedLight);
    }
  }, []);

  return null;
}