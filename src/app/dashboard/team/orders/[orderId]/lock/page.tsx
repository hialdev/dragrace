"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getOrder, lockOrder, requestUnlock, subscribeOrder, type Order } from "@/lib/api/orders";
import { getAssignments, getChangeRequests, type Assignment } from "@/lib/api/assignments";
import { lockBadge } from "@/lib/orderUtils";
import { unlockRequestSchema, type UnlockRequestForm } from "@/schemas/assignment.schema";

function ChangeRequestItem({ cr }: { cr: any }) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    pending:  { label: "Menunggu", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    approved: { label: "Disetujui", cls: "text-green-400 bg-green-500/10 border-green-500/20" },
    rejected: { label: "Ditolak",   cls: "text-red-400 bg-red-500/10 border-red-500/20" },
  };
  const s = statusMap[cr.status] ?? statusMap.pending;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-white/70 text-sm">{cr.reason}</p>
        {cr.review_note && <p className="text-white/40 text-xs mt-1">Catatan RM: {cr.review_note}</p>}
        <p className="text-white/25 text-xs mt-1">
          {new Date(cr.created).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border flex-shrink-0 ${s.cls}`}>
        {s.label}
      </span>
    </div>
  );
}

export default function LockPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lock state
  const [locking, setLocking] = useState(false);
  const [lockConfirm, setLockConfirm] = useState(false);

  // Unlock request state
  const [showUnlockForm, setShowUnlockForm] = useState(false);
  const [requestingUnlock, setRequestingUnlock] = useState(false);
  const [unlockDone, setUnlockDone] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnlockRequestForm>({
    resolver: zodResolver(unlockRequestSchema),
  });

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const init = async () => {
      const data = await getOrder(orderId).catch(() => null);
      if (!data) { router.replace("/dashboard/team/orders"); return; }
      setOrder(data);

      const [assigns, crs] = await Promise.all([
        getAssignments(orderId),
        getChangeRequests(orderId),
      ]);
      setAssignments(assigns);
      setChangeRequests(crs);
      setLoading(false);

      unsub = subscribeOrder(orderId, (updated) => setOrder(updated));
    };
    init();
    return () => unsub?.();
  }, [orderId]);

  const handleLock = async () => {
    setLocking(true);
    try {
      const updated = await lockOrder(orderId);
      setOrder(updated);
      setLockConfirm(false);
    } catch (err: any) {
      alert(err?.response?.message ?? "Gagal mengunci data.");
    } finally {
      setLocking(false);
    }
  };

  const handleUnlockRequest = async (data: UnlockRequestForm) => {
    setRequestingUnlock(true);
    try {
      await requestUnlock(orderId, data.reason);
      setUnlockDone(true);
      reset();
      setShowUnlockForm(false);
      // Refresh change requests
      const crs = await getChangeRequests(orderId);
      setChangeRequests(crs);
      // Refresh order
      const updated = await getOrder(orderId);
      setOrder(updated);
    } catch (err: any) {
      alert(err?.response?.message ?? "Gagal mengirim permintaan.");
    } finally {
      setRequestingUnlock(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const lock = lockBadge(order.is_locked, order.unlock_requested);
  const pit = order.expand?.race_pit;
  const canLock = !order.is_locked && assignments.length > 0 && order.status === "paid";
  const canRequestUnlock = order.is_locked && !order.unlock_requested;

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/team/orders/${orderId}`}
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Kunci & Kirim Data</h1>
          <p className="text-white/40 text-sm mt-0.5">{pit?.name}</p>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`text-xs px-3 py-1.5 rounded-xl font-semibold border ${lock.cls}`}>
          <span className="material-symbols-outlined text-[12px] align-middle mr-1">
            {order.is_locked ? "lock" : "lock_open"}
          </span>
          {lock.label}
        </span>
      </div>

      {/* Assignment Summary */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Racer di Pit Ini ({assignments.length})
          </h2>
          {!order.is_locked && (
            <Link href={`/dashboard/team/orders/${orderId}/assignment`}
              className="text-xs text-[#b80014] hover:text-[#e21b23] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit
            </Link>
          )}
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white/30 text-sm">Belum ada racer yang di-assign.</p>
            <Link href={`/dashboard/team/orders/${orderId}/assignment`}
              className="mt-2 inline-flex items-center gap-1 text-sm text-[#b80014] hover:text-[#e21b23] transition-colors">
              <span className="material-symbols-outlined text-[14px]">person_add</span>
              Assign racer dulu
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {assignments.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                  <span className="text-white/40 text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{a.expand?.racer?.name ?? "—"}</p>
                  <p className="text-white/40 text-xs">
                    {a.expand?.vehicle ? `${a.expand.vehicle.brand} ${a.expand.vehicle.model}` : "Tanpa kendaraan"}
                    {a.expand?.race_class ? ` · ${a.expand.race_class.name}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOCK SECTION */}
      {canLock && !lockConfirm && (
        <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-400 text-[24px] mt-0.5">lock</span>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Siap untuk dikunci?</p>
              <p className="text-white/50 text-xs leading-relaxed">
                Setelah dikunci, data racer &amp; kendaraan tidak bisa diubah oleh Anda. Perubahan hanya bisa dilakukan setelah Race Manager membuka kunci.
              </p>
            </div>
          </div>
          <button
            id="btn-confirm-lock"
            onClick={() => setLockConfirm(true)}
            disabled={!canLock}
            className="mt-4 w-full py-3 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Kunci &amp; Kirim Data ke Race Manager
          </button>
        </div>
      )}

      {/* Lock confirm dialog */}
      {lockConfirm && (
        <div className="bg-white/5 border border-white/15 rounded-2xl p-6 mb-5">
          <p className="text-white font-semibold text-sm mb-2">Konfirmasi Penguncian</p>
          <p className="text-white/50 text-xs mb-4">
            Data {assignments.length} racer di pit <strong className="text-white">{pit?.name}</strong> akan dikunci dan dikirim ke Race Manager.
            Anda tidak dapat mengubah data ini setelahnya tanpa persetujuan Race Manager.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleLock}
              disabled={locking}
              className="flex-1 py-2.5 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {locking && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {locking ? "Mengunci..." : "Ya, Kunci Sekarang"}
            </button>
            <button
              onClick={() => setLockConfirm(false)}
              className="px-4 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm hover:text-white transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Locked state */}
      {order.is_locked && !order.unlock_requested && (
        <div className="bg-green-500/8 border border-green-500/20 rounded-2xl p-5 mb-5 flex items-start gap-3">
          <span className="material-symbols-outlined text-green-400 text-[24px]">check_circle</span>
          <div>
            <p className="text-white font-semibold text-sm">Data berhasil dikunci</p>
            <p className="text-white/50 text-xs mt-0.5">
              Race Manager sedang atau akan meninjau data Anda. Untuk mengubah data, Anda perlu meminta buka kunci.
            </p>
          </div>
        </div>
      )}

      {/* Unlock requested state */}
      {order.unlock_requested && (
        <div className="bg-orange-500/8 border border-orange-500/20 rounded-2xl p-5 mb-5 flex items-start gap-3">
          <span className="material-symbols-outlined text-orange-400 text-[24px]">hourglass_empty</span>
          <div>
            <p className="text-white font-semibold text-sm">Permintaan buka kunci sedang diproses</p>
            <p className="text-white/50 text-xs mt-0.5">
              Race Manager akan memproses permintaan Anda. Anda akan mendapat notifikasi jika sudah disetujui.
            </p>
          </div>
        </div>
      )}

      {/* REQUEST UNLOCK SECTION */}
      {canRequestUnlock && (
        <>
          {!showUnlockForm ? (
            <button
              onClick={() => setShowUnlockForm(true)}
              className="w-full py-3 border border-orange-500/20 bg-orange-500/8 hover:bg-orange-500/12 text-orange-400 font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              Minta Buka Kunci Data
            </button>
          ) : (
            <form
              onSubmit={handleSubmit(handleUnlockRequest)}
              className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Permintaan Buka Kunci</h2>
                <button type="button" onClick={() => { setShowUnlockForm(false); reset(); }}
                  className="text-white/30 hover:text-white/60 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Alasan perubahan *</label>
                <textarea
                  rows={3}
                  className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/20 text-sm outline-none transition-all focus:ring-2 focus:ring-[#b80014]/40 resize-none ${errors.reason ? "border-red-500/50" : "border-white/10"}`}
                  placeholder="Jelaskan data apa yang perlu diubah dan alasannya..."
                  {...register("reason")}
                />
                {errors.reason && <p className="mt-1 text-xs text-red-400">{errors.reason.message}</p>}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={requestingUnlock}
                  className="flex-1 py-2.5 bg-orange-600/30 hover:bg-orange-600/40 border border-orange-500/40 text-orange-300 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                  {requestingUnlock && <span className="w-4 h-4 border-2 border-orange-300/30 border-t-orange-300 rounded-full animate-spin" />}
                  Kirim Permintaan
                </button>
                <button type="button" onClick={() => { setShowUnlockForm(false); reset(); }}
                  className="px-4 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm hover:text-white transition-colors">
                  Batal
                </button>
              </div>
            </form>
          )}
          {unlockDone && (
            <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 mb-4">
              <p className="text-sm text-green-400">✓ Permintaan buka kunci terkirim ke Race Manager.</p>
            </div>
          )}
        </>
      )}

      {/* Change request history */}
      {changeRequests.length > 0 && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Riwayat Permintaan Perubahan
          </h2>
          {changeRequests.map((cr) => <ChangeRequestItem key={cr.id} cr={cr} />)}
        </div>
      )}
    </div>
  );
}
