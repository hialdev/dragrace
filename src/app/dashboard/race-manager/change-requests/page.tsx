"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPendingChangeRequests, approveChangeRequest, rejectChangeRequest } from "@/lib/api/admin";

export default function ChangeRequestsPage() {
  const [crs, setCrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, "approved" | "rejected">>({});

  useEffect(() => {
    getPendingChangeRequests()
      .then((data) => { setCrs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handle = async (crId: string, orderId: string, action: "approve" | "reject") => {
    const note = notes[crId] ?? "";
    if (action === "reject" && !note.trim()) {
      alert("Isi catatan/alasan penolakan terlebih dahulu."); return;
    }
    setActing(crId);
    try {
      if (action === "approve") {
        await approveChangeRequest(crId, orderId, note);
        setDone((prev) => ({ ...prev, [crId]: "approved" }));
      } else {
        await rejectChangeRequest(crId, note);
        setDone((prev) => ({ ...prev, [crId]: "rejected" }));
      }
    } catch { alert("Gagal memproses."); }
    finally { setActing(null); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-headline font-semibold text-white">Permintaan Buka Kunci</h1>
        <p className="text-white/40 text-sm mt-1">{crs.length} permintaan pending</p>
      </div>

      {crs.length === 0 ? (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-white/20 text-[48px] mb-4 block">lock_open</span>
          <p className="text-white/50 text-sm">Tidak ada permintaan pending saat ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {crs.map((cr) => {
            const orderId = typeof cr.order === "string" ? cr.order : cr.expand?.order?.id;
            const pit = cr.expand?.order?.expand?.race_pit?.name;
            const isDone = !!done[cr.id];

            return (
              <div key={cr.id} className={`bg-white/5 border rounded-2xl p-5 transition-all ${isDone ? "border-white/5 opacity-60" : "border-white/8"}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {cr.expand?.requested_by?.full_name ?? "—"}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {pit ? `Pit: ${pit} · ` : ""}
                      {new Date(cr.created).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {isDone && (
                    <span className={`text-xs px-3 py-1 rounded-xl font-semibold ${
                      done[cr.id] === "approved"
                        ? "bg-green-500/15 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {done[cr.id] === "approved" ? "✓ Disetujui" : "✗ Ditolak"}
                    </span>
                  )}
                </div>

                {/* Reason */}
                <div className="bg-white/5 rounded-xl px-4 py-3 mb-4">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Alasan Perubahan</p>
                  <p className="text-white text-sm">{cr.reason}</p>
                </div>

                {/* Note input + actions */}
                {!isDone && (
                  <>
                    <div className="mb-3">
                      <label className="block text-xs text-white/40 mb-1.5">
                        Catatan untuk peserta (wajib jika menolak)
                      </label>
                      <input
                        type="text"
                        value={notes[cr.id] ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [cr.id]: e.target.value }))}
                        placeholder="Catatan opsional..."
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-[#b80014]/40"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handle(cr.id, orderId, "approve")} disabled={acting === cr.id}
                        className="flex-1 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                        {acting === cr.id && <span className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />}
                        <span className="material-symbols-outlined text-[16px]">lock_open</span>
                        Buka Kunci
                      </button>
                      <button onClick={() => handle(cr.id, orderId, "reject")} disabled={acting === cr.id}
                        className="flex-1 py-2.5 bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 text-red-400 font-semibold text-sm rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-[16px] align-middle mr-1">block</span>
                        Tolak
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
