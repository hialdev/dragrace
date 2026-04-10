"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getVehicles, deleteVehicle, vehicleImageUrl } from "@/lib/api/vehicles";
import { useTeamStore } from "@/store/teamStore";
import { getMyTeam } from "@/lib/api/teams";

export default function VehiclesListPage() {
  const router = useRouter();
  const { teamId, setTeam } = useTeamStore();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    let tid = teamId;
    if (!tid) {
      const team = await getMyTeam();
      if (!team) {
        router.replace("/dashboard/team/profile?setup=1");
        return;
      }
      setTeam(team.id, team.name);
      tid = team.id;
    }
    const data = await getVehicles(tid).catch(() => []);
    setVehicles(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Hapus kendaraan "${label}"?`)) return;
    setDeleting(id);
    await deleteVehicle(id).catch(() => null);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Data Kendaraan</h1>
          <p className="text-white/40 text-sm mt-0.5">{vehicles.length} kendaraan terdaftar</p>
        </div>
        <Link
          href="/dashboard/team/vehicles/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#b80014] hover:bg-[#e21b23] text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Kendaraan
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-white/15 text-[48px] mb-4 block">
            no_crash
          </span>
          <p className="text-white/50 text-sm">Belum ada kendaraan. Tambahkan kendaraan tim.</p>
          <Link
            href="/dashboard/team/vehicles/create"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#b80014] text-white text-sm font-medium rounded-xl hover:bg-[#e21b23] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Kendaraan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            const imgUrl = vehicleImageUrl(v);
            const label = `${v.brand ?? ""} ${v.model ?? ""}`.trim();

            return (
              <div
                key={v.id}
                className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 hover:bg-white/[0.07] transition-all group"
              >
                {/* Image */}
                <div className="h-36 bg-white/5 flex items-center justify-center overflow-hidden relative">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-white/10 text-[52px]">
                      directions_car
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-white font-semibold text-sm">
                    {v.brand} {v.model}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {v.cc && (
                      <span className="text-[10px] bg-white/8 text-white/50 px-2 py-0.5 rounded border border-white/8">
                        {v.cc} cc
                      </span>
                    )}
                    {v.year && (
                      <span className="text-[10px] bg-white/8 text-white/50 px-2 py-0.5 rounded border border-white/8">
                        {v.year}
                      </span>
                    )}
                    {v.color && (
                      <span className="text-[10px] bg-white/8 text-white/50 px-2 py-0.5 rounded border border-white/8">
                        {v.color}
                      </span>
                    )}
                    {v.plate_number && (
                      <span className="text-[10px] bg-white/8 text-white/50 px-2 py-0.5 rounded border border-white/8 font-mono">
                        {v.plate_number}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/8">
                    <Link
                      href={`/dashboard/team/vehicles/${v.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(v.id, label)}
                      disabled={deleting === v.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {deleting === v.id ? (
                        <span className="w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      )}
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
