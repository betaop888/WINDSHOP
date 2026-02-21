"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ClipboardList, House, LogOut, UserRound } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";

const navItems = [
  { href: "/", label: "Market", icon: House },
  { href: "/requests", label: "Active Requests", icon: ClipboardList },
  { href: "/login", label: "Auth", icon: UserRound }
];

function navClass(isActive: boolean) {
  return [
    "grid h-9 w-9 place-items-center rounded-lg border transition",
    isActive
      ? "border-accent/50 bg-accent/15 text-accent"
      : "border-transparent text-slate-200 hover:bg-white/5"
  ].join(" ");
}

export function Header() {
  const pathname = usePathname();
  const { currentUser, logout } = useAppState();

  return (
    <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-9 w-16 rounded-sm bg-slate-300" />
        <div>
          <p className="font-display text-sm tracking-[0.14em] text-white md:text-base">WIND SHOP</p>
          <p className="text-xs text-muted">Currency: AR (Diamond Ore)</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <nav className="flex items-center gap-1 rounded-xl border border-line bg-panel/90 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} title={item.label} className={navClass(isActive)}>
                <Icon size={17} strokeWidth={1.9} />
              </Link>
            );
          })}

          {currentUser ? (
            <Link
              href={`/profile/${encodeURIComponent(currentUser.username)}`}
              title="Profile"
              className={navClass(pathname.startsWith("/profile/"))}
            >
              <UserRound size={17} strokeWidth={1.9} />
            </Link>
          ) : null}

          <button
            type="button"
            title="Notifications"
            className="grid h-9 w-9 place-items-center rounded-lg border border-transparent text-slate-200 hover:bg-white/5"
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={1.9} />
          </button>
        </nav>

        <p className="text-xs text-muted">
          Player: <span className="font-semibold text-slate-100">{currentUser?.username ?? "Guest"}</span>
          {currentUser ? (
            <>
              <Link
                href={`/profile/${encodeURIComponent(currentUser.username)}`}
                className="ml-2 rounded-full border border-line px-2 py-0.5 text-[11px] text-slate-200 hover:border-slate-500"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="ml-2 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] text-slate-200 hover:border-slate-500"
              >
                <LogOut size={12} />
                Logout
              </button>
            </>
          ) : null}
        </p>
      </div>
    </header>
  );
}
