"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats } from "@/lib/api/admin";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/orderUtils";

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
      <span className={`material-symbols-outlined text-[22px] ${color} mb-3 block`}>{icon}</span>
      <p className={`text-3xl font-headline font-bold text-white mb-0.5`}>{value}</p>
      <p className="text-white/40 text-sm">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((s) => { setStats(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1011]">
      {/* Simple sidebar */}
      <aside className="w-64 min-h-screen bg-[#0a0b0c] border-r border-white/8 flex flex-col">
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#b80014] rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">DR</span>
            </div>
            <div>
              <p className="text-white font-headline font-semibold text-sm">STAR DRAG RACE</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Superadmin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/dashboard/admin", label: "Overview", icon: "dashboard" },
            { href: "/dashboard/admin/users", label: "Pengguna", icon: "manage_accounts" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/8">
          <button onClick={() => logout().then(() => window.location.href = "/login")}
            className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-red-400 text-sm rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[16px]">logout</span>Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-headline font-semibold text-white">Admin Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Selamat datang, {user?.full_name}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <StatCard label="Total User" value={stats.totalUsers} icon="people" color="text-white/60" />
              <StatCard label="Total Tim" value={stats.totalTeams} icon="groups" color="text-blue-400" />
              <StatCard label="Total Order" value={stats.totalOrders} icon="receipt_long" color="text-white/60" />
              <StatCard label="Total Racer" value={stats.totalRacers} icon="person" color="text-[#b80014]" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <StatCard label="Order Lunas" value={stats.paidOrders} icon="check_circle" color="text-green-400" />
              <StatCard label="Menunggu Bayar" value={stats.pendingOrders} icon="schedule" color="text-yellow-400" />
              <StatCard label="Data Terkunci" value={stats.lockedOrders} icon="lock" color="text-blue-400" />
            </div>
          </>
        )}

        {/* Quick links to PB Admin */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Admin Tools</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="http://127.0.0.1:8090/_/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-xl transition-all">
              <span className="material-symbols-outlined text-white/50 text-[20px]">admin_panel_settings</span>
              <div>
                <p className="text-white text-sm font-medium">PocketBase Admin</p>
                <p className="text-white/30 text-xs">Buka panel admin PB</p>
              </div>
            </a>
            <Link href="/dashboard/race-manager"
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-xl transition-all">
              <span className="material-symbols-outlined text-[#b80014] text-[20px]">flag</span>
              <div>
                <p className="text-white text-sm font-medium">Race Manager View</p>
                <p className="text-white/30 text-xs">Buka dashboard RM</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
