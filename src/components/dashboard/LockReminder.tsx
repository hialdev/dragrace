"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getOrdersToLock, lockOrder, Order } from "@/lib/api/orders";
import { formatCurrency, statusBadge } from "@/lib/orderUtils";
import Link from "next/link";
import pb from "@/lib/pb";

export default function LockReminder() {
  const [orders, setOrders] = useState<(Order & { assignments?: any[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<(Order & { assignments?: any[] }) | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await getOrdersToLock();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders to lock:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLock = async (id: string) => {
    setLockingId(id);
    try {
      await lockOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to lock order:", error);
      alert("Gagal mengunci data. Silakan coba lagi.");
    } finally {
      setLockingId(null);
    }
  };

  if (loading || orders.length === 0) return null;

  return (
    <div className="mb-8">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#b80014]/20 to-[#b80014]/5 border border-[#b80014]/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-[#b80014]/10"
        >
          {/* Background Decoration */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#b80014]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#b80014] flex items-center justify-center shrink-0 shadow-lg shadow-[#b80014]/30">
                <span className="material-symbols-outlined text-white text-[32px] animate-pulse">
                  lock_open
                </span>
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-white mb-1.5 flex items-center gap-2">
                  Lengkapi & Kunci Data Pendaftaran
                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#b80014] border border-[#b80014]/20">
                    Penting
                  </span>
                </h3>
                <p className="text-white/60 text-sm max-w-xl leading-relaxed">
                  Ada <span className="text-white font-bold">{orders.length} pesanan</span> yang telah divalidasi pembayarannya. Silakan kunci data Anda agar panitia dapat memproses pendaftaran Anda.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Link 
                href="/dashboard/team/katalog-pit"
                className="px-6 py-3 text-white/50 hover:text-white text-sm font-semibold transition-colors"
              >
                Lihat Semua
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-white/30 text-[20px]">
                      confirmation_number
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm group-hover:text-primary transition-colors">
                      {order.expand?.race_pit?.name || "Race Pit"}
                    </p>
                    <p className="text-white/30 text-[10px] font-mono mt-0.5 uppercase">
                      {order.code} • {order.expand?.race_pit?.expand?.race_category?.name || "Category"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b80014] hover:bg-[#e21b23] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#b80014]/20 hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  Kunci Data
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#161819] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-white mb-1">Preview Pendaftaran</h2>
                    <p className="text-white/40 text-sm font-mono uppercase">{selectedOrder.code}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/8">
                    <span className="text-white/40 text-sm">Status Pembayaran</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${statusBadge(selectedOrder).cls}`}>
                      {statusBadge(selectedOrder).label}
                    </span>
                  </div>

                  {/* Pit Detail */}
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/8">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Detail Pit / Kelas</p>
                    <p className="text-white font-bold text-lg">{selectedOrder.expand?.race_pit?.name}</p>
                    <p className="text-white/40 text-sm mt-1">
                      {selectedOrder.expand?.race_pit?.expand?.race_category?.expand?.race_class?.name} 
                      {" > "} 
                      {selectedOrder.expand?.race_pit?.expand?.race_category?.name}
                    </p>
                    <p className="text-primary font-bold mt-2">{formatCurrency(selectedOrder.bill_price)}</p>
                  </div>

                  {/* Assignment Detail */}
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/8">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Pembalap & Kendaraan</p>
                    {selectedOrder.assignments && selectedOrder.assignments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedOrder.assignments.map((a, idx) => {
                          const racer = a.expand?.racer;
                          const vehicle = a.expand?.vehicle;
                          return (
                            <div key={a.id} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white/20">person</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-semibold text-sm">{racer?.name || "Racer Name"}</p>
                                <p className="text-white/30 text-[10px]">
                                  {vehicle?.brand} {vehicle?.model} • {vehicle?.plate_number}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-2 px-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <p className="text-yellow-500 text-xs font-semibold">Belum ada pembalap yang di-assign</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="mt-10 flex flex-col gap-3">
                  <button
                    onClick={() => handleLock(selectedOrder.id)}
                    disabled={lockingId === selectedOrder.id}
                    className="w-full py-4 bg-[#b80014] hover:bg-[#e21b23] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#b80014]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {lockingId === selectedOrder.id ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Mengunci Pendaftaran...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">lock</span>
                        Kunci & Kirim Sekarang
                      </>
                    )}
                  </button>
                  
                  <Link
                    href={`/dashboard/team/orders/${selectedOrder.id}`}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                    Edit / Lengkapi Detail
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
