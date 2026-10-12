"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [savedTheme, setSavedTheme] = useState("blue");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("userTheme") || "blue";
    setSavedTheme(stored);
    setIsDark(stored === "dark");
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    if (isDark) {
      html.setAttribute("data-theme", savedTheme);
      localStorage.setItem("userThemeDark", "false");
      setIsDark(false);
    } else {
      const current = html.getAttribute("data-theme") || "blue";
      if (current !== "dark") {
        localStorage.setItem("userTheme", current);
        setSavedTheme(current);
      }
      html.setAttribute("data-theme", "dark");
      localStorage.setItem("userThemeDark", "true");
      setIsDark(true);
    }
  };

  if (!mounted) {
    return (
      <button className="p-2 text-gray-500 rounded-full w-9 h-9" disabled>
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="p-2 text-gray-500 hover:bg-white/50 rounded-full transition relative"
      title={isDark ? "Светлая тема" : "Тёмная тема"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}