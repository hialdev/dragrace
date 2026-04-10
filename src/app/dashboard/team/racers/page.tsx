"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRacers, deleteRacer, racerFileUrl } from "@/lib/api/racers";
import { useTeamStore } from "@/store/teamStore";
import { getMyTeam } from "@/lib/api/teams";

export default function RacersListPage() {
  const router = useRouter();
  const { teamId, setTeam } = useTeamStore();
  const [racers, setRacers] = useState<any[]>([]);
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
    const data = await getRacers(tid).catch(() => []);
    setRacers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus racer "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeleting(id);
    await deleteRacer(id).catch(() => null);
    setRacers((prev) => prev.filter((r) => r.id !== id));
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
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Data Racer</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {racers.length} racer terdaftar di tim Anda
          </p>
        </div>
        <Link
          href="/dashboard/team/racers/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#b80014] hover:bg-[#e21b23] text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Tambah Racer
        </Link>
      </div>

      {racers.length === 0 ? (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-white/15 text-[48px] mb-4 block">
            person_off
          </span>
          <p className="text-white/50 text-sm">Belum ada racer. Tambahkan racer tim Anda.</p>
          <Link
            href="/dashboard/team/racers/create"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] text-white text-sm font-medium rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Racer Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {racers.map((r) => {
            const photoUrl = racerFileUrl(r, "photo");
            const initials = r.name
              ?.split(" ")
              .slice(0, 2)
              .map((w: string) => w[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={r.id}
                className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-2xl p-4 hover:bg-white/[0.07] hover:border-white/12 transition-all"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white/40 font-bold text-sm">{initials || "?"}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{r.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {r.phone && (
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">phone</span>
                        {r.phone}
                      </span>
                    )}
                    {r.birth_date && (
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">cake</span>
                        {new Date(r.birth_date).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Document badges */}
                <div className="flex items-center gap-1">
                  {[
                    { key: "kta", label: "KTA" },
                    { key: "sim", label: "SIM" },
                    { key: "kis", label: "KIS" },
                  ].map((doc) => (
                    <span
                      key={doc.key}
                      title={doc.label}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        r[doc.key]
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : "bg-white/5 text-white/20 border border-white/8"
                      }`}
                    >
                      {doc.label}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/dashboard/team/racers/${r.id}/edit`}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id, r.name)}
                    disabled={deleting === r.id}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === r.id ? (
                      <span className="w-4 h-4 border border-red-400/50 border-t-red-400 rounded-full animate-spin block" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
