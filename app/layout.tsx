import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { MainLayout } from "@/components/layout/MainLayout";
import { AppStateProvider } from "@/components/providers/AppStateProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope"
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded"
});

export const metadata: Metadata = {
  title: "Wind Shop Marketplace",
  description:
    "Маркетплейс Minecraft предметов за валюту Ары: баннеры, книги, алмазные и незеритовые вещи."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${unbounded.variable} font-sans antialiased`}>
        <AppStateProvider>
          <MainLayout>{children}</MainLayout>
        </AppStateProvider>
      </body>
    </html>
  );
}
