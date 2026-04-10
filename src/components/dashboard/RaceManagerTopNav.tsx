"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { href: "/dashboard/race-manager", label: "Overview", icon: "dashboard", exact: true },
  { href: "/dashboard/race-manager/orders", label: "Semua Order", icon: "receipt_long", exact: false },
  { href: "/dashboard/race-manager/participants", label: "Peserta Pit", icon: "groups", exact: false },
  { href: "/dashboard/race-manager/change-requests", label: "Buka Kunci", icon: "lock_open", exact: false },
];

export default function RaceManagerTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0b0c]/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 h-16">
          {/* Brand */}
          <Link href="/dashboard/race-manager" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 bg-[#b80014] rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">DR</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-headline font-semibold text-sm leading-tight">
                STAR DRAG RACE
              </p>
              <p className="text-white/30 text-[9px] uppercase tracking-wider -mt-0.5">
                Race Manager
              </p>
            </div>
          </Link>

          {/* Horizontal Tab Nav */}
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                    isActive
                      ? "text-white bg-white/8"
                      : "text-white/40 hover:text-white/70 hover:bg-white/4"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  <span className="hidden md:block">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#b80014] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-blue-400 text-xs font-bold">
                  {user?.full_name?.[0]?.toUpperCase() ?? "R"}
                </span>
              </div>
              <div className="hidden lg:block">
                <p className="text-white text-xs font-medium leading-tight truncate max-w-[120px]">
                  {user?.full_name}
                </p>
                <p className="text-white/30 text-[10px] truncate max-w-[120px]">Race Manager</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
