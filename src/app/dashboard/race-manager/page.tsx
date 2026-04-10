"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllOrders, getPendingChangeRequests } from "@/lib/api/admin";
import { statusBadge, lockBadge, formatCurrency } from "@/lib/orderUtils";

function StatCard({ label, value, icon, color, href }: {
  label: string; value: number; icon: string; color: string; href?: string;
}) {
  const inner = (
    <div className={`bg-white/5 border border-white/8 rounded-2xl p-5 ${href ? "hover:bg-white/8 hover:border-white/15 transition-all group cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`material-symbols-outlined text-[22px] ${color}`}>{icon}</span>
        {href && <span className="material-symbols-outlined text-white/15 text-[14px] group-hover:text-white/30 transition-colors">arrow_forward</span>}
      </div>
      <p className={`text-3xl font-headline font-bold ${color} mb-0.5`}>{value}</p>
      <p className="text-white/40 text-sm">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}

export default function RaceManagerOverview() {
  const [orders, setOrders] = useState<any[]>([]);
  const [pendingCRs, setPendingCRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllOrders().catch(() => []),
      getPendingChangeRequests().catch(() => []),
    ]).then(([ords, crs]) => {
      setOrders(ords);
      setPendingCRs(crs);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  const paidOrders   = orders.filter((o) => o.status === "paid");
  const waitingOrders = orders.filter((o) => o.status === "waiting" && o.is_manual_payment);
  const lockedOrders  = orders.filter((o) => o.is_locked && o.status === "paid");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-headline font-semibold text-white">Race Manager Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Ringkasan registrasi dan kegiatan peserta</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Order" value={orders.length} icon="receipt_long" color="text-white" href="/dashboard/race-manager/orders" />
        <StatCard label="Lunas" value={paidOrders.length} icon="check_circle" color="text-green-400" href="/dashboard/race-manager/orders?status=paid" />
        <StatCard label="Menunggu Verif" value={waitingOrders.length} icon="hourglass_empty" color="text-yellow-400" href="/dashboard/race-manager/orders?status=waiting" />
        <StatCard label="Data Terkunci" value={lockedOrders.length} icon="lock" color="text-blue-400" href="/dashboard/race-manager/participants" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pending change requests */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Permintaan Buka Kunci</h2>
            <Link href="/dashboard/race-manager/change-requests"
              className="text-xs text-[#b80014] hover:text-[#e21b23] transition-colors">Lihat semua</Link>
          </div>
          {pendingCRs.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">Tidak ada permintaan pending.</p>
          ) : (
            <div className="space-y-3">
              {pendingCRs.slice(0, 3).map((cr) => (
                <div key={cr.id} className="flex items-start gap-3 p-3 bg-orange-500/5 border border-orange-500/15 rounded-xl">
                  <span className="material-symbols-outlined text-orange-400 text-[18px] mt-0.5">lock_open</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {cr.expand?.requested_by?.full_name ?? "—"}
                    </p>
                    <p className="text-white/40 text-xs truncate">{cr.reason}</p>
                    <Link href={`/dashboard/race-manager/change-requests`}
                      className="text-[10px] text-orange-400 hover:text-orange-300 mt-1 inline-block">Tinjau</Link>
                  </div>
                </div>
              ))}
              {pendingCRs.length > 3 && (
                <p className="text-white/30 text-xs text-center">+{pendingCRs.length - 3} lainnya</p>
              )}
            </div>
          )}
        </div>

        {/* Recent manual payments to verify */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Bukti Transfer Masuk</h2>
            <Link href="/dashboard/race-manager/orders?status=waiting"
              className="text-xs text-[#b80014] hover:text-[#e21b23] transition-colors">Lihat semua</Link>
          </div>
          {waitingOrders.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">Tidak ada bukti transfer baru.</p>
          ) : (
            <div className="space-y-3">
              {waitingOrders.slice(0, 3).map((o) => (
                <Link key={o.id} href={`/dashboard/race-manager/orders/${o.id}`}
                  className="flex items-center gap-3 p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl hover:bg-yellow-500/8 transition-colors">
                  <span className="material-symbols-outlined text-yellow-400 text-[18px]">receipt</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {o.expand?.user?.full_name ?? o.code ?? "—"}
                    </p>
                    <p className="text-white/40 text-xs">{o.expand?.race_pit?.name ?? "—"} &middot; {formatCurrency(o.bill_price)}</p>
                  </div>
                  <span className="material-symbols-outlined text-white/20 text-[16px]">chevron_right</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
