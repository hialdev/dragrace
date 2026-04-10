"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";

const navItems = [
  { href: "/dashboard/team", label: "Dashboard", icon: "home", exact: true },
  { href: "/dashboard/team/katalog-pit", label: "Katalog Pit", icon: "garage", exact: false },
  { href: "/dashboard/team/racers", label: "Racers", icon: "person", exact: false },
  { href: "/dashboard/team/vehicles", label: "Kendaraan", icon: "directions_car", exact: false },
];

export default function TeamTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { teamName } = useTeamStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0b0c]/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 h-16">
          {/* Brand */}
          <Link href="/dashboard/team" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 bg-[#b80014] rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">DR</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-headline font-semibold text-sm leading-tight">
                STAR DRAG RACE
              </p>
              <p className="text-white/30 text-[9px] uppercase tracking-wider -mt-0.5">
                {teamName ?? "Team Portal"}
              </p>
            </div>
          </Link>

          {/* Horizontal Tab Nav */}
          <nav className="flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
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
              <div className="w-7 h-7 rounded-full bg-[#b80014]/20 border border-[#b80014]/30 flex items-center justify-center">
                <span className="text-[#b80014] text-xs font-bold">
                  {user?.full_name?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="hidden lg:block">
                <p className="text-white text-xs font-medium leading-tight truncate max-w-[120px]">
                  {user?.full_name}
                </p>
                <p className="text-white/30 text-[10px] truncate max-w-[120px]">{user?.email}</p>
              </div>
            </div>
            <Link
              href="/dashboard/team/profile"
              title="Profil Tim"
              className="p-2 text-white/40 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            </Link>
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
