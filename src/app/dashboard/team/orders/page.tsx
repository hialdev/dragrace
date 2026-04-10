"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyOrders, type Order } from "@/lib/api/orders";
import { statusBadge, lockBadge, formatCurrency } from "@/lib/orderUtils";

export default function OrdersPage() {
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      getMyOrders().then((data) => {
         setOrders(data);
         setLoading(false);
      });
   }, []);

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
         </div>
      );
   }

   return (
      <div className="p-8 max-w-4xl">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h1 className="text-2xl font-headline font-semibold text-white">
                  Pit Entries
               </h1>
               <p className="text-white/40 text-sm mt-1">
                  {orders.length} pit{" "}
                  {orders.length === 1 ? "entry" : "entries"}
               </p>
            </div>
            <Link
               href="/dashboard/team/orders/new"
               className="flex items-center gap-2 px-5 py-2.5 bg-[#b80014] hover:bg-[#e21b23] text-white font-semibold text-sm rounded-xl transition-colors"
            >
               <span className="material-symbols-outlined text-[18px]">
                  add
               </span>
               New Pit Entry
            </Link>
         </div>

         {orders.length === 0 ? (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center">
               <span className="material-symbols-outlined text-white/20 text-[48px] mb-4 block">
                  receipt_long
               </span>
               <p className="text-white/50 text-sm mb-4">No pit entries yet.</p>
               <Link
                  href="/dashboard/team/orders/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#b80014] hover:bg-[#e21b23] text-white font-semibold text-sm rounded-xl transition-colors"
               >
                  <span className="material-symbols-outlined text-[18px]">
                     add
                  </span>
                  Create First Pit Entry
               </Link>
            </div>
         ) : (
            <div className="space-y-3">
               {orders.map((order) => {
                  const pit = order.expand?.race_pit;
                  const status = statusBadge(order);
                  const lock = lockBadge(
                     order.is_locked,
                     order.unlock_requested,
                  );

                  return (
                     <div
                        key={order.id}
                        className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/8 transition-colors"
                     >
                        <div className="flex items-start justify-between gap-4">
                           {/* Pit Info */}
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                 <p className="text-white font-semibold text-sm">
                                    {pit?.name ?? "Race Pit"}
                                 </p>
                                 {pit?.expand?.race_category?.name && (
                                    <span className="text-[10px] bg-white/8 text-white/40 px-2 py-0.5 rounded font-medium">
                                       {pit.expand.race_category.name}
                                    </span>
                                 )}
                              </div>
                              <p className="text-white/30 text-xs font-mono">
                                 {order.code}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                 <span
                                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${status.cls}`}
                                 >
                                    {status.label}
                                 </span>
                                 <span
                                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${lock.cls}`}
                                 >
                                    <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">
                                       {order.is_locked ? "lock" : "lock_open"}
                                    </span>
                                    {lock.label}
                                 </span>
                              </div>
                           </div>

                           {/* Price + Actions */}
                           <div className="text-right flex-shrink-0">
                              <p className="text-white font-semibold text-sm">
                                 {order.bill_price > 0
                                    ? formatCurrency(order.bill_price)
                                    : "—"}
                              </p>
                              <p className="text-white/30 text-xs mt-0.5">
                                 {new Date(order.created).toLocaleDateString(
                                    "id-ID",
                                    {
                                       day: "numeric",
                                       month: "short",
                                       year: "numeric",
                                    },
                                 )}
                              </p>
                              <div className="flex items-center gap-2 mt-3 justify-end">
                                 {order.status === "waiting" && (
                                    <Link
                                       href={`/dashboard/team/orders/${order.id}/payment`}
                                       className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#b80014]/10 hover:bg-[#b80014]/20 text-[#b80014] border border-[#b80014]/20 rounded-lg transition-colors"
                                    >
                                       <span className="material-symbols-outlined text-[14px]">
                                          payments
                                       </span>
                                       Pay
                                    </Link>
                                 )}
                                 <Link
                                    href={`/dashboard/team/orders/${order.id}`}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                                 >
                                    <span className="material-symbols-outlined text-[14px]">
                                       open_in_new
                                    </span>
                                    Detail
                                 </Link>
                              </div>
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
