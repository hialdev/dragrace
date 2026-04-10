"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAvailablePits, createOrder } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/orderUtils";

export default function NewOrderPage() {
  const router = useRouter();
  const [pits, setPits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAvailablePits()
      .then((data) => { setPits(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const order = await createOrder(selected);
      router.push(`/dashboard/team/orders/${order.id}/payment`);
    } catch (err: any) {
      setError(err?.response?.message ?? err?.message ?? "Gagal membuat order. Coba lagi.");
      setSubmitting(false);
    }
  };

  const selectedPit = pits.find((p) => p.id === selected);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/team/orders"
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Pilih Race Pit</h1>
          <p className="text-white/40 text-sm mt-0.5">Pilih slot pit yang ingin Anda ikuti</p>
        </div>
      </div>

      {pits.length === 0 ? (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-white/20 text-[48px] mb-4 block">event_busy</span>
          <p className="text-white/50 text-sm">Belum ada race pit yang tersedia.</p>
        </div>
      ) : (
        <>
          {/* Pit grid */}
          <div className="space-y-3 mb-6">
            {pits.map((pit) => {
              const isSelected = selected === pit.id;
              const category = pit?.expand?.race_category?.name ?? pit?.expand?.race_category ?? "";

              return (
                <button
                  key={pit.id}
                  type="button"
                  onClick={() => setSelected(pit.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-[#b80014]/10 border-[#b80014]/40 ring-1 ring-[#b80014]/30"
                      : "bg-white/5 border-white/8 hover:bg-white/8 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-semibold text-sm">{pit.name}</p>
                        {category && (
                          <span className="text-[10px] bg-white/8 text-white/40 px-2 py-0.5 rounded">
                            {category}
                          </span>
                        )}
                      </div>
                      {pit.description && (
                        <p className="text-white/40 text-xs line-clamp-2">{pit.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pit.date && (
                          <span className="text-[11px] text-white/40 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                            {new Date(pit.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        )}
                        {pit.location && (
                          <span className="text-[11px] text-white/40 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            {pit.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {pit.price > 0 ? (
                        <p className="text-white font-bold text-lg">{formatCurrency(pit.price)}</p>
                      ) : (
                        <p className="text-white/30 text-sm">Gratis</p>
                      )}
                      <div className={`mt-2 w-5 h-5 rounded-full border-2 ml-auto flex items-center justify-center transition-colors ${
                        isSelected ? "border-[#b80014] bg-[#b80014]" : "border-white/20"
                      }`}>
                        {isSelected && (
                          <span className="material-symbols-outlined text-white text-[12px]">check</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Summary */}
          {selected && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-4">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Ringkasan Pesanan</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{selectedPit?.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">1 slot pit</p>
                </div>
                <p className="text-white font-bold">
                  {selectedPit?.price > 0 ? formatCurrency(selectedPit.price) : "Gratis"}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            id="btn-create-order"
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="w-full py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            )}
            {submitting ? "Memproses..." : "Daftar ke Pit Ini →"}
          </button>
        </>
      )}
    </div>
  );
}
