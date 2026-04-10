"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getOrder, type Order } from "@/lib/api/orders";
import { getRacers } from "@/lib/api/racers";
import { getVehicles } from "@/lib/api/vehicles";
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
  type Assignment,
} from "@/lib/api/assignments";
import { useTeamStore } from "@/store/teamStore";
import { getMyTeam } from "@/lib/api/teams";
import { assignmentSchema, type AssignmentForm } from "@/schemas/assignment.schema";

function selectClass(hasError?: boolean) {
  return `w-full px-3 py-2.5 rounded-xl bg-white/5 border text-white text-sm outline-none transition-all focus:ring-2 focus:ring-[#b80014]/40 ${hasError ? "border-red-500/50" : "border-white/10"}`;
}

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { teamId, setTeam } = useTeamStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [racers, setRacers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssignmentForm>({
    resolver: zodResolver(assignmentSchema),
  });

  useEffect(() => {
    const init = async () => {
      const data = await getOrder(orderId).catch(() => null);
      if (!data) { router.replace("/dashboard/team/orders"); return; }
      if (data.status !== "paid") { router.replace(`/dashboard/team/orders/${orderId}/payment`); return; }
      if (data.is_locked) { router.replace(`/dashboard/team/orders/${orderId}/lock`); return; }
      setOrder(data);

      let tid = teamId;
      if (!tid) {
        const team = await getMyTeam();
        if (!team) { router.replace("/dashboard/team/profile?setup=1"); return; }
        setTeam(team.id, team.name);
        tid = team.id;
      }

      const [assigns, racerList, vehicleList] = await Promise.all([
        getAssignments(orderId),
        getRacers(tid),
        getVehicles(tid),
      ]);

      setAssignments(assigns);
      setRacers(racerList);
      setVehicles(vehicleList);
      setLoading(false);
    };
    init();
  }, [orderId]);

  const assignedRacerIds = new Set(assignments.map((a) => a.racer));

  const onSubmit = async (data: AssignmentForm) => {
    setAdding(true);
    try {
      const created = await createAssignment(
        orderId,
        data.racer,
        data.vehicle || undefined,
        undefined,
        data.notes || undefined
      );
      // Re-load with expand
      const fresh = await getAssignments(orderId);
      setAssignments(fresh);
      reset();
      setShowForm(false);
    } catch (err: any) {
      alert(err?.response?.message ?? "Gagal menambah assignment.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus assignment ini?")) return;
    setDeleting(id);
    await deleteAssignment(id).catch(() => null);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const availableRacers = racers.filter((r) => !assignedRacerIds.has(r.id));

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/dashboard/team/orders/${orderId}`}
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Assign Racer ke Pit</h1>
          <p className="text-white/40 text-sm mt-0.5">{order?.expand?.race_pit?.name}</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-500/8 border border-blue-500/15 rounded-xl px-4 py-3 mb-6 mt-4">
        <span className="material-symbols-outlined text-blue-400 text-[18px] mt-px">info</span>
        <p className="text-blue-300/80 text-xs leading-relaxed">
          Pilih racer dan kendaraan dari roster tim Anda untuk diturunkan di pit ini. Setiap racer hanya bisa di-assign 1 kali per pit.
          Setelah selesai, kunci data via halaman <strong>Kunci &amp; Kirim</strong>.
        </p>
      </div>

      {/* Assignment list */}
      {assignments.length > 0 && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Racer Terdaftar ({assignments.length})
          </h2>
          <div className="space-y-2">
            {assignments.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-[#b80014]/15 border border-[#b80014]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#b80014] text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{a.expand?.racer?.name ?? "—"}</p>
                  <p className="text-white/40 text-xs">
                    {a.expand?.vehicle ? `${a.expand.vehicle.brand} ${a.expand.vehicle.model}` : "Tanpa kendaraan"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                  className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/8 rounded-lg transition-colors disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[16px]">remove_circle</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add assignment */}
      {availableRacers.length > 0 && (
        <>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-white/10 hover:border-[#b80014]/40 rounded-2xl text-white/40 hover:text-white transition-all text-sm flex items-center justify-center gap-2 mb-4"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Tambah Racer ke Pit Ini
            </button>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-4 space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-white">Tambah Racer</h2>
                <button type="button" onClick={() => { setShowForm(false); reset(); }}
                  className="text-white/30 hover:text-white/60 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Racer select */}
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Racer *</label>
                <select className={selectClass(!!errors.racer)} {...register("racer")}>
                  <option value="">— Pilih Racer —</option>
                  {availableRacers.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                {errors.racer && <p className="mt-1 text-xs text-red-400">{errors.racer.message}</p>}
              </div>

              {/* Vehicle select */}
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Kendaraan (opsional)</label>
                <select className={selectClass()} {...register("vehicle")}>
                  <option value="">— Tanpa Kendaraan —</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} {v.plate_number ? `(${v.plate_number})` : ""}</option>
                  ))}
                </select>
              </div>



              {/* Notes */}
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Catatan</label>
                <input className={selectClass()} placeholder="Opsional" {...register("notes")} />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 py-2.5 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {adding && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {adding ? "Menambahkan..." : "Tambah ke Pit"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); reset(); }}
                  className="px-4 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm hover:text-white transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {availableRacers.length === 0 && assignments.length > 0 && (
        <div className="text-center py-4">
          <p className="text-white/30 text-sm">✓ Semua racer sudah di-assign ke pit ini.</p>
        </div>
      )}

      {racers.length === 0 && (
        <div className="bg-yellow-500/8 border border-yellow-500/15 rounded-xl px-4 py-3 mb-4">
          <p className="text-yellow-300/80 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Belum ada racer di tim Anda.{" "}
            <Link href="/dashboard/team/racers/create" className="underline hover:text-yellow-300 transition-colors">
              Tambah racer dulu
            </Link>
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      {assignments.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <Link
            href={`/dashboard/team/orders/${orderId}/lock`}
            className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Lanjut: Kunci &amp; Kirim Data
          </Link>
          <Link
            href={`/dashboard/team/orders/${orderId}`}
            className="px-5 py-3 border border-white/10 text-white/50 rounded-xl text-sm hover:text-white transition-colors"
          >
            Simpan Nanti
          </Link>
        </div>
      )}
    </div>
  );
}
