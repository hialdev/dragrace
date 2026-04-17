"use client";

import { useState } from "react";
import { createOrder } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/orderUtils";
import pb from "@/lib/pb";

interface Props {
  team: any;
  pit: any;
  racer: any;
  vehicle: any;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

export default function Step5Review({ team, pit, racer, vehicle, onBack, onSuccess }: Props) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const raceCat = pit.expand?.race_category;
  const raceClass = raceCat?.expand?.race_class;

  const logoUrl = team?.logo ? pb.files.getURL(team, team.logo) : null;
  const vehicleImgUrl = vehicle?.file_image_vehicle
    ? pb.files.getURL(vehicle, vehicle.file_image_vehicle)
    : null;

  const handleProcess = async () => {
    setProcessing(true);
    setError("");
    try {
      const order = await createOrder(pit.id);
      onSuccess(order.id);
    } catch (err: any) {
      setError(err?.response?.message ?? "Gagal membuat pesanan. Coba lagi.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-white/50 text-sm">
        Periksa kembali detail pendaftaran Anda sebelum diproses.
      </p>

      {/* Team */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Data Tim</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white/30 text-[22px]">groups</span>
            )}
          </div>
          <div>
            <p className="text-white font-bold">{team.name}</p>
            <p className="text-white/40 text-xs mt-0.5">
              Manager: {team.manager_name || "—"}
              {team.entrant_number ? ` · Entrant #${team.entrant_number}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Pit */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Kelas Balap / Pit</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            {/* Breadcrumb */}
            {(raceClass || raceCat) && (
              <div className="flex items-center gap-1 text-[10px] text-white/30 mb-1.5">
                {raceClass && <span>{raceClass.name}</span>}
                {raceClass && raceCat && (
                  <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                )}
                {raceCat && <span>{raceCat.name}</span>}
              </div>
            )}
            <p className="text-white font-bold">{pit.name}</p>
            {pit.description && <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{pit.description}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            {pit.price > 0 ? (
              <p className="text-[#b80014] font-bold text-lg">{formatCurrency(pit.price)}</p>
            ) : (
              <p className="text-green-400 font-bold">Gratis</p>
            )}
          </div>
        </div>
      </div>

      {/* Racer */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Pembalap</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            <span className="material-symbols-outlined text-white/30 text-[18px]">person</span>
          </div>
          <div>
            <p className="text-white font-semibold">{racer.name}</p>
            {racer.phone && <p className="text-white/40 text-xs">{racer.phone}</p>}
          </div>
          <div className="ml-auto flex gap-1">
            {["kta", "sim", "kis"].map((doc) => (
              <span
                key={doc}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  racer[doc]
                    ? "bg-green-500/15 text-green-400 border border-green-500/20"
                    : "bg-white/5 text-white/20 border border-white/8"
                }`}
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Kendaraan</p>
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {vehicleImgUrl ? (
              <img src={vehicleImgUrl} alt={vehicle.model} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white/25 text-[22px]">directions_car</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">
              {vehicle.brand} {vehicle.model}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {vehicle.plate_number && (
                <span className="text-[#b80014] text-xs font-bold px-2 py-0.5 bg-[#b80014]/8 rounded border border-[#b80014]/15">
                  {vehicle.plate_number}
                </span>
              )}
              {vehicle.cc && <span className="text-white/40 text-xs">{vehicle.cc} cc</span>}
              {vehicle.year && <span className="text-white/40 text-xs">{vehicle.year}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Total */}
      {pit.price > 0 && (
        <div className="flex items-center justify-between px-5 py-4 bg-[#b80014]/10 border border-[#b80014]/20 rounded-2xl">
          <p className="text-white/70 font-semibold">Total Biaya Pendaftaran</p>
          <p className="text-[#b80014] font-bold text-xl">{formatCurrency(pit.price)}</p>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex items-center gap-1.5 px-5 py-3 border border-white/15 hover:border-white/30 text-white/60 hover:text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali
        </button>
        <button
          type="button"
          onClick={handleProcess}
          disabled={processing}
          className="flex-1 py-3.5 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#b80014]/20"
        >
          {processing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Proses Pendaftaran
            </>
          )}
        </button>
      </div>
    </div>
  );
}
