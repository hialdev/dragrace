"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrder, subscribeOrder, type Order } from "@/lib/api/orders";
import { statusBadge, lockBadge, formatCurrency } from "@/lib/orderUtils";
import pb from "@/lib/pb";

function InfoRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-white/30 text-xs mb-0.5">{label}</p>
      <p className="text-white text-sm">{value || "—"}</p>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const init = async () => {
      const data = await getOrder(orderId).catch(() => null);
      if (!data) { router.replace("/dashboard/team/orders"); return; }
      setOrder(data);
      setLoading(false);

      // Load assignments
      const assigns = await pb.collection("order_racer_assignment").getFullList({
        filter: `order = "${orderId}"`,
        expand: "racer,vehicle,race_class",
      }).catch(() => []);
      setAssignments(assigns);

      // SSE — live update when order status/lock changes
      unsub = subscribeOrder(orderId, (updated) => setOrder(updated));
    };
    init();
    return () => unsub?.();
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const pit = order.expand?.race_pit;
  const status = statusBadge(order);
  const lock = lockBadge(order.is_locked, order.unlock_requested);
  const proofUrl = order.proof_payment
    ? pb.files.getURL(order as any, order.proof_payment)
    : null;

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/team/orders"
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">{pit?.name ?? "Detail Order"}</h1>
          <p className="text-white/30 text-xs font-mono mt-0.5">{order.code}</p>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className={`text-xs px-3 py-1.5 rounded-xl font-semibold ${status.cls}`}>{status.label}</span>
        <span className={`text-xs px-3 py-1.5 rounded-xl font-semibold ${lock.cls}`}>
          <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">
            {order.is_locked ? "lock" : "lock_open"}
          </span>
          {lock.label}
        </span>
        {order.is_manual_payment && (
          <span className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Transfer Manual
          </span>
        )}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {order.status === "waiting" && (
          <Link href={`/dashboard/team/orders/${orderId}/payment`}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#b80014] hover:bg-[#e21b23] text-white font-semibold text-sm rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Lanjutkan Pembayaran
          </Link>
        )}
        {order.status === "paid" && !order.is_locked && (
          <Link href={`/dashboard/team/orders/${orderId}/assignment`}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/8 hover:bg-white/12 text-white font-semibold text-sm rounded-xl border border-white/15 transition-colors">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Assign Racer ke Pit
          </Link>
        )}
        {order.status === "paid" && !order.is_locked && assignments.length > 0 && (
          <Link href={`/dashboard/team/orders/${orderId}/lock`}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 font-semibold text-sm rounded-xl border border-blue-500/20 transition-colors">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Kunci & Kirim Data
          </Link>
        )}
        {order.is_locked && !order.unlock_requested && (
          <Link href={`/dashboard/team/orders/${orderId}/lock`}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500/10 text-orange-400 font-semibold text-sm rounded-xl border border-orange-500/20 hover:bg-orange-500/15 transition-colors">
            <span className="material-symbols-outlined text-[18px]">lock_open</span>
            Minta Buka Kunci
          </Link>
        )}
      </div>

      {/* Pit Details */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Info Pit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Nama Pit" value={pit?.name} />
          <InfoRow label="Kategori" value={pit?.expand?.race_category?.name ?? pit?.race_category} />
          <InfoRow label="Harga" value={order.bill_price > 0 ? formatCurrency(order.bill_price) : "Gratis"} />
          <InfoRow label="Tanggal Daftar" value={new Date(order.created).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
        </div>
      </div>

      {/* Payment Details */}
      {(order.payment_link_url || order.proof_payment) && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Info Pembayaran</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.payment_ref && <InfoRow label="Ref. Flip" value={order.payment_ref} />}
            {order.payment_expired_at && (
              <InfoRow label="Berlaku Hingga"
                value={new Date(order.payment_expired_at).toLocaleString("id-ID")} />
            )}
          </div>
          {order.payment_link_url && order.status === "waiting" && (
            <a href={order.payment_link_url} target="_blank" rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-[#b80014]/10 hover:bg-[#b80014]/20 text-[#b80014] font-medium text-sm rounded-xl border border-[#b80014]/20 transition-colors">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Buka Halaman Pembayaran Flip
            </a>
          )}
          {proofUrl && (
            <div className="mt-4">
              <p className="text-white/40 text-xs mb-2">Bukti Transfer</p>
              <a href={proofUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-[#b80014] hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">attach_file</span>
                Lihat Bukti Transfer
              </a>
            </div>
          )}
        </div>
      )}

      {/* Assignments */}
      {assignments.length > 0 && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Racer di Pit Ini</h2>
            {!order.is_locked && (
              <Link href={`/dashboard/team/orders/${orderId}/assignment`}
                className="text-xs text-[#b80014] hover:text-[#e21b23] transition-colors">
                Edit Assignment
              </Link>
            )}
          </div>
          <div className="space-y-2">
              {assignments.map((a) => {
                const vehiclePhoto = a.expand?.vehicle?.file_image_vehicle 
                  ? pb.files.getURL(a.expand.vehicle, a.expand.vehicle.file_image_vehicle)
                  : null;

                return (
                  <div key={a.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-white/30 text-[18px]">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold">{a.expand?.racer?.name ?? "—"}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        {a.expand?.vehicle && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-white/40 text-xs">{a.expand.vehicle.brand} {a.expand.vehicle.model}</span>
                            <span className="text-[#b80014] text-[10px] font-bold tracking-wider px-1.5 py-0.5 bg-[#b80014]/10 rounded-md border border-[#b80014]/20">
                              {a.expand.vehicle.plate_number || "NO PLATE"}
                            </span>
                          </div>
                        )}
                        {a.expand?.race_class && (
                          <span className="text-white/20 text-xs">· {a.expand.race_class.name}</span>
                        )}
                      </div>
                    </div>
                    {vehiclePhoto && (
                      <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden shrink-0">
                        <img src={vehiclePhoto} alt="Vehicle" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
