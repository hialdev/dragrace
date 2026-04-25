"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getAdminList, getFileUrl } from "@/lib/api/content-admin";

const navItems = [
  { href: "/dashboard/collector/participants", label: "Peserta Pit", icon: "groups", exact: false },
];

export default function CollectorTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [siteName, setSiteName] = useState("STAR DRAG RACE");
  const [siteLogoUrl, setSiteLogoUrl] = useState("");

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const records = await getAdminList("single_content", { filter: 'key="site_name" || key="site_logo"' });
        // @ts-ignore
        const nameRecord = records.find((r) => r.key === "site_name");
        // @ts-ignore
        const logoRecord = records.find((r) => r.key === "site_logo");

        if (nameRecord?.content) setSiteName(nameRecord.content);
        if (logoRecord?.image) setSiteLogoUrl(getFileUrl(logoRecord, logoRecord.image));
      } catch (error) {
        console.error("Failed to load site settings", error);
      }
    };
    fetchSiteSettings();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0b0c]/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 h-16">
          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {siteLogoUrl ? (
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image src={siteLogoUrl} alt="Logo" fill className="object-contain" />
              </div>
            ) : (
              <div className="w-7 h-7 bg-[#b80014] rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs flex-shrink-0">DR</span>
              </div>
            )}
            <div className="hidden sm:block overflow-hidden">
              <p className="text-white font-headline font-semibold text-sm leading-tight truncate max-w-[150px]" title={siteName}>
                {siteName}
              </p>
              <p className="text-white/30 text-[9px] uppercase tracking-wider -mt-0.5 truncate max-w-[150px]">
                Data Collector
              </p>
            </div>
          </div>

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
