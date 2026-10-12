"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  GraduationCap,
  Menu,
  X,
  Award,
  BookOpen,
  ClipboardList,
  Users,
  ChevronDown,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";

type Notif = {
  id: string;
  type: string;
  title: string;
  text: string;
  href: string;
};

export default function Header({ siteName = "EduPath" }: { siteName?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (session?.user) {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => setNotifs(Array.isArray(d) ? d : []))
        .catch(() => setNotifs([]));
    }
  }, [session]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const navItems = [
    { href: "/courses", label: "Курсы", icon: BookOpen },
    { href: "/library", label: "Библиотека", icon: BookOpen },
    { href: "/tests", label: "Тесты", icon: ClipboardList },
    { href: "/community", label: "Сообщество", icon: Users },
  ];

  return (
    <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4">
      <div className="glass rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between gap-4 shadow-lg">
        {/* Лого */}
        <Link
          href="/"
          className="text-lg md:text-xl font-bold flex items-center gap-2 shrink-0"
        >
          <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-md">
            <GraduationCap className="w-5 h-5" />
          </span>
          <span className="text-slate-900">{siteName}</span>
        </Link>

        {/* Навигация */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
                isActive(item.href)
                  ? "active text-slate-900 border-b-2 border-blue-500"
                  : "text-slate-600"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-2 md:gap-3">
          <SearchBar />

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-white/50 rounded-full"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Уведомления */}
          {session && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setMenuOpen(false);
                }}
                className="p-2 text-slate-600 hover:bg-white/50 rounded-full relative"
              >
                <Bell className="w-5 h-5" />
                {notifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-xl p-2 animate-scaleIn z-50">
                  <p className="px-3 py-2 font-bold text-sm border-b border-white/40 mb-1 text-slate-900">
                    Уведомления
                  </p>
                  {notifs.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">
                      Нет новых уведомлений
                    </p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifs.map((n) => (
                        <Link
                          key={n.id}
                          href={n.href}
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 transition"
                        >
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500">{n.text}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Профиль */}
          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  setMenuOpen(!menuOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-1.5 hover:opacity-90 transition"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-md text-sm">
                  {session.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 glass rounded-2xl shadow-xl p-2 animate-scaleIn z-50">
                  <div className="px-3 py-2 border-b border-white/40 mb-1">
                    <p className="font-medium text-sm text-slate-900">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {session.user?.email}
                    </p>
                    <span
                      className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : role === "TEACHER"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {role}
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-white/60 rounded-lg"
                  >
                    <User className="w-4 h-4" /> Профиль
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-white/60 rounded-lg"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Мой кабинет
                  </Link>
                  {role === "TEACHER" && (
                    <Link
                      href="/teacher"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <GraduationCap className="w-4 h-4" /> Учительская
                    </Link>
                  )}
                  {role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      <Shield className="w-4 h-4" /> Админ-панель
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition shadow-md"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div className="lg:hidden glass mt-2 rounded-2xl px-4 py-3 space-y-1 animate-fadeIn shadow-lg">
          {/* Поиск на мобильном */}
          <div className="pb-2 border-b border-white/40 mb-2">
            <SearchBar />
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-white/50"
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}