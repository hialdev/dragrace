"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAdminList, getFileUrl } from "@/lib/api/content-admin";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        if (logoRecord?.image) {
          setSiteLogoUrl(getFileUrl(logoRecord, logoRecord.image));
        }
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

  const navGroups = [
    {
      title: "RACE STRUCTURE",
      items: [
        { name: "Race Class", href: "/dashboard/content/race-class", icon: "category" },
        { name: "Race Category", href: "/dashboard/content/race-category", icon: "sports_motorsports" },
        { name: "Race Pit", href: "/dashboard/content/race-pit", icon: "garage" },
      ]
    },
    {
      title: "KONTEN WEBSITE",
      items: [
        { name: "Star Guest", href: "/dashboard/content/star-guest", icon: "star" },
        { name: "Partner", href: "/dashboard/content/partner", icon: "handshake" },
        { name: "Timeline", href: "/dashboard/content/timeline", icon: "calendar_month" },
        { name: "Values", href: "/dashboard/content/values", icon: "diamond" },
        { name: "Prize Category", href: "/dashboard/content/prize-category", icon: "emoji_events" },
        { name: "Prize Winner", href: "/dashboard/content/prize-winner", icon: "military_tech" },
      ]
    },
    {
      title: "PENGATURAN",
      items: [
        { name: "Payments", href: "/dashboard/content/payments", icon: "payments" },
        { name: "Single Content", href: "/dashboard/content/single-content", icon: "edit_document" },
      ]
    }
  ];

  return (
    <div className="flex h-screen w-full bg-[#0f1011] overflow-hidden">
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0b0c] border-r border-white/8 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-white/8 shrink-0 flex items-center justify-between">
          <Link href="/dashboard/content" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            {siteLogoUrl ? (
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image src={siteLogoUrl} alt="Logo" fill className="object-contain" />
              </div>
            ) : (
              <div className="w-8 h-8 shrink-0 bg-[#b80014] rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs flex-shrink-0">DR</span>
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-white font-headline font-semibold text-sm hover:text-[#b80014] transition-colors truncate" title={siteName}>
                {siteName}
              </p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Content Manager</p>
            </div>
          </Link>
          <button 
            className="md:hidden text-white/50 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
             <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto w-full py-4 space-y-6">
          <div className="px-4">
            <Link 
              href="/dashboard/content"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                pathname === "/dashboard/content" 
                  ? "bg-[#b80014]/10 text-[#b80014] font-medium" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span className="text-sm">Overview</span>
            </Link>
          </div>

          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <p className="px-8 mb-2 text-[10px] font-bold tracking-widest text-white/30 uppercase">
                {group.title}
              </p>
              <nav className="flex flex-col gap-1 px-4">
                {group.items.map((item, iIdx) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                        isActive
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/8 shrink-0 mt-auto bg-[#0a0b0c]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 text-sm font-medium rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Keluar Akun
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* Topbar inside main area */}
        <header className="h-16 shrink-0 border-b border-white/8 bg-[#0f1011] flex items-center justify-between px-4 md:px-8 z-10 relative">
          <div className="flex items-center gap-3">
             <button 
               className="md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
               onClick={() => setIsMobileMenuOpen(true)}
             >
                <span className="material-symbols-outlined">menu</span>
             </button>
             <div className="hidden md:flex items-center gap-2 text-white/40 text-sm">
               <span>Welcome back,</span>
               <span className="text-white font-medium">{user?.full_name}</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#b80014] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/10">
                {user?.full_name?.charAt(0).toUpperCase() || "A"}
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
