"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import { getMyTeam } from "@/lib/api/teams";
import { getRacers } from "@/lib/api/racers";
import { getVehicles } from "@/lib/api/vehicles";
import pb from "@/lib/pb";

function StatCard({
  label,
  value,
  icon,
  href,
  color = "default",
}: {
  label: string;
  value: number | string;
  icon: string;
  href: string;
  color?: "default" | "red";
}) {
  return (
    <Link
      href={href}
      className={`relative overflow-hidden rounded-2xl p-6 border transition-all group hover:-translate-y-0.5 ${
        color === "red"
          ? "bg-[#b80014]/10 border-[#b80014]/20 hover:bg-[#b80014]/15 hover:border-[#b80014]/30"
          : "bg-white/5 border-white/8 hover:bg-white/8 hover:border-white/15"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            color === "red" ? "bg-[#b80014]/20" : "bg-white/8"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              color === "red" ? "text-[#b80014]" : "text-white/50"
            }`}
          >
            {icon}
          </span>
        </div>
        <span className="material-symbols-outlined text-white/15 text-[14px] group-hover:text-white/30 transition-colors">
          arrow_forward
        </span>
      </div>
      <p className="text-3xl font-headline font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </Link>
  );
}

export default function TeamDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setTeam } = useTeamStore();
  const [team, setTeamData] = useState<any>(null);
  const [counts, setCounts] = useState({ racers: 0, vehicles: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const t = await getMyTeam();
      if (!t) {
        router.replace("/dashboard/team/profile?setup=1");
        return;
      }
      setTeamData(t);
      setTeam(t.id, t.name);

      const [racers, vehicles, orders] = await Promise.all([
        getRacers(t.id).catch(() => []),
        getVehicles(t.id).catch(() => []),
        pb
          .collection("order")
          .getFullList({ filter: `user = "${pb.authStore.record?.id}"` })
          .catch(() => []),
      ]);
      setCounts({ racers: racers.length, vehicles: vehicles.length, orders: orders.length });
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const logoUrl = team?.logo ? pb.files.getURL(team, team.logo) : null;

  return (
    <div className="max-w-4xl">
      {/* Team Header Card */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={team.name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-white/30 text-[28px]">groups</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-headline font-bold text-white truncate">{team?.name}</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Entrant #{team?.entrant_number || "—"}
            {team?.manager_name ? ` · Manager: ${team.manager_name}` : ""}
          </p>
        </div>
        <Link
          href="/dashboard/team/profile"
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/50 border border-white/10 rounded-xl hover:border-white/20 hover:text-white transition-all flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Edit Profil
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Racer" value={counts.racers} icon="person" href="/dashboard/team/racers" />
        <StatCard label="Total Kendaraan" value={counts.vehicles} icon="directions_car" href="/dashboard/team/vehicles" />
        <StatCard label="Pit Didaftarkan" value={counts.orders} icon="garage" href="/dashboard/team/katalog-pit" color="red" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
          Tindakan Cepat
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/dashboard/team/racers/create"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/8 rounded-xl transition-colors border border-white/8 hover:border-white/15"
          >
            <span className="material-symbols-outlined text-[#b80014] text-[20px]">person_add</span>
            <span className="text-white text-sm font-medium">Tambah Racer</span>
          </Link>
          <Link
            href="/dashboard/team/vehicles/create"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/8 rounded-xl transition-colors border border-white/8 hover:border-white/15"
          >
            <span className="material-symbols-outlined text-[#b80014] text-[20px]">add_circle</span>
            <span className="text-white text-sm font-medium">Tambah Kendaraan</span>
          </Link>
          <Link
            href="/dashboard/team/katalog-pit"
            className="flex items-center gap-3 p-4 bg-[#b80014]/10 hover:bg-[#b80014]/15 rounded-xl transition-colors border border-[#b80014]/20"
          >
            <span className="material-symbols-outlined text-[#b80014] text-[20px]">add_shopping_cart</span>
            <span className="text-white text-sm font-semibold">Daftar ke Pit</span>
          </Link>
        </div>
      </div>

      {/* Manager Info */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
          Info Manager
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["Nama Manager", team?.manager_name],
            ["No. HP Manager", team?.manager_phone],
            ["No. Lisensi", team?.manager_license || "—"],
            ["No. KTA", team?.manager_kta || "—"],
          ].map(([label, val]) => (
            <div key={label as string}>
              <p className="text-white/30 text-xs mb-0.5">{label}</p>
              <p className="text-white">{val || "—"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
