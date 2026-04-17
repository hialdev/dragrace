"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const navItems = [
   { href: "/dashboard/team", label: "Overview", icon: "home" },
   { href: "/dashboard/team/profile", label: "Profil Tim", icon: "groups" },
   { href: "/dashboard/team/racers", label: "Data Pembalap", icon: "person" },
   {
      href: "/dashboard/team/vehicles",
      label: "Kendaraan",
      icon: "directions_car",
   },
   {
      href: "/dashboard/team/katalog-pit",
      label: "Pesan Kelas Balap / Pit",
      icon: "garage",
   },
   {
      href: "/dashboard/team/orders",
      label: "Pesanan Saya",
      icon: "receipt_long",
   },
];

export default function TeamSidebar() {
   const pathname = usePathname();
   const router = useRouter();
   const { user, logout } = useAuthStore();

   const handleLogout = async () => {
      await logout();
      router.push("/login");
   };

   return (
      <aside className="w-64 min-h-screen bg-[#0a0b0c] border-r border-white/8 flex flex-col">
         {/* Brand */}
         <div className="p-6 border-b border-white/8">
            <div className="flex items-center gap-2">
               <div className="w-7 h-7 bg-[#b80014] rounded-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">DR</span>
               </div>
               <div>
                  <p className="text-white font-headline font-semibold text-sm leading-tight">
                     STAR DRAG RACE
                  </p>
                  <p className="text-white/30 text-[10px] uppercase tracking-wider">
                     Team Portal
                  </p>
               </div>
            </div>
         </div>

         {/* Nav */}
         <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
               const isActive =
                  item.href === "/dashboard/team"
                     ? pathname === item.href
                     : pathname.startsWith(item.href);

               return (
                  <Link
                     key={item.href}
                     href={item.href}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                           ? "bg-[#b80014]/15 text-[#b80014] border border-[#b80014]/20"
                           : "text-white/50 hover:text-white hover:bg-white/5"
                     }`}
                  >
                     <span className="material-symbols-outlined text-[18px]">
                        {item.icon}
                     </span>
                     {item.label}
                  </Link>
               );
            })}
         </nav>

         {/* User info */}
         <div className="p-4 border-t border-white/8">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
               <div className="w-8 h-8 rounded-full bg-[#b80014]/20 border border-[#b80014]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#b80014] text-sm font-semibold">
                     {user?.full_name?.[0]?.toUpperCase() ?? "U"}
                  </span>
               </div>
               <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                     {user?.full_name}
                  </p>
                  <p className="text-white/30 text-xs truncate">
                     {user?.email}
                  </p>
               </div>
            </div>
            <button
               onClick={handleLogout}
               className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-red-400 text-sm rounded-lg hover:bg-red-500/5 transition-colors"
            >
               <span className="material-symbols-outlined text-[16px]">
                  logout
               </span>
               Keluar
            </button>
         </div>
      </aside>
   );
}
