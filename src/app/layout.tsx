import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "@/components/Providers";
import ThemeApplier from "@/components/ThemeApplier";
import ThemeLoader from "@/components/ThemeLoader";
import PageTransition from "@/components/PageTransition";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduPath - Ваш путь к знаниям",
  description: "Современная образовательная платформа",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let theme = "blue";
  let siteName = "EduPath";
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "main" },
    });
    if (settings?.theme) theme = settings.theme;
    if (settings?.siteName) siteName = settings.siteName;
  } catch {}

  return (
    <html lang="ru" data-theme={theme} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeLoader />
          <ThemeApplier />
          <Header siteName={siteName} />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </Providers>
      </body>
    </html>
  );
}