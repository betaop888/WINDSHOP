import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <div className="mx-auto w-full max-w-[1220px] px-4 pb-12 pt-6 md:px-6 md:pt-8">
        <Header />
        {children}
      </div>
    </div>
  );
}
