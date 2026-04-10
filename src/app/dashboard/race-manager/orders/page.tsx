"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getOrdersPage } from "@/lib/api/admin";
import { statusBadge, lockBadge, formatCurrency } from "@/lib/orderUtils";
import pb from "@/lib/pb";

function OrdersContent() {
  const params = useSearchParams();
  const filterStatus = params.get("status") ?? "";

  const [orders, setOrders] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async (p = 1) => {
    setLoading(true);
    const filter = [
      filterStatus ? `status = "${filterStatus}"` : "",
      search ? `(code ~ "${search}" || expand.user.full_name ~ "${search}")` : "",
    ].filter(Boolean).join(" && ");

    const res = await getOrdersPage(p, 20, filter).catch(() => null);
    if (res) {
      setOrders(res.items);
      setTotalItems(res.totalItems);
    }
    setLoading(false);
  };

  useEffect(() => { load(1); }, [filterStatus, search]);

  const tabs = [
    { label: "Semua", val: "" },
    { label: "Menunggu", val: "waiting" },
    { label: "Lunas", val: "paid" },
    { label: "Dibatalkan", val: "canceled" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Semua Order</h1>
          <p className="text-white/40 text-sm mt-0.5">{totalItems} total pendaftaran</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {tabs.map((t) => (
          <Link key={t.val} href={t.val ? `?status=${t.val}` : "?"}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterStatus === t.val
                ? "bg-[#b80014]/15 text-[#b80014] border border-[#b80014]/20"
                : "text-white/40 hover:text-white border border-white/8 hover:border-white/15"
            }`}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Orders table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-white/20 text-[48px] mb-4 block">receipt_long</span>
          <p className="text-white/50 text-sm">Tidak ada order ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const status = statusBadge(o);
            const lock = lockBadge(o.is_locked, o.unlock_requested);
            const user = o.expand?.user;
            const pit = o.expand?.race_pit;
            const team = o.expand?.team;
            const teamLogo = team?.logo ? pb.files.getURL(team, team.logo) : null;

            return (
              <Link key={o.id} href={`/dashboard/race-manager/orders/${o.id}`}
                className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-xl p-4 hover:bg-white/8 hover:border-white/15 transition-all">
                
                {/* Team Logo */}
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {teamLogo ? (
                    <img src={teamLogo} alt={team?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-white/20 text-[20px]">groups</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-bold text-sm truncate uppercase tracking-tight">
                      {team?.name ?? user?.full_name ?? "—"}
                    </p>
                    <span className="text-white/20 text-xs">·</span>
                    <p className="text-white/40 text-xs truncate">{pit?.name ?? "—"}</p>
                  </div>
                  <p className="text-white/25 text-xs font-mono">{o.code}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {o.is_manual_payment && o.status === "waiting" && o.proof_payment && (
                    <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">
                      Cek Bukti
                    </span>
                  )}
                  <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-tighter ${status.cls}`}>
                    {status.label}
                  </span>
                  <p className="text-white font-bold text-sm w-24 text-right ml-2">{o.bill_price > 0 ? formatCurrency(o.bill_price) : "—"}</p>
                  <span className="material-symbols-outlined text-white/20 text-[16px]">chevron_right</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RMOrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
      <OrdersContent />
    </Suspense>
  );
}
