"use client";

import { useEffect, useRef, useState } from "react";
import { getVehicles, createVehicle } from "@/lib/api/vehicles";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleForm } from "@/schemas/vehicle.schema";
import pb from "@/lib/pb";

interface Props {
  teamId: string;
  onNext: (vehicle: any) => void;
  onBack: () => void;
}

function inputCls(err?: boolean) {
  return `w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/20 text-sm outline-none transition-all
    focus:ring-2 focus:ring-[#b80014]/40 focus:border-[#b80014]/50
    ${err ? "border-red-500/50" : "border-white/10"}`;
}

export default function Step4Vehicles({ teamId, onNext, onBack }: Props) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedOk, setSavedOk] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
  });

  const loadVehicles = async () => {
    setLoading(true);
    const data = await getVehicles(teamId).catch(() => []);
    setVehicles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadVehicles();
  }, [teamId]);

  const openModal = () => {
    reset();
    setImgPreview(null);
    setSaveError("");
    setSavedOk(false);
    setShowModal(true);
  };

  const onSubmitVehicle = async (data: VehicleForm) => {
    setSaving(true);
    setSaveError("");
    try {
      const image = imgRef.current?.files?.[0];
      const created = await createVehicle(teamId, { ...data, ...(image ? { image } : {}) });
      setSavedOk(true);
      setTimeout(() => {
        setShowModal(false);
        setVehicles((prev) => [created, ...prev]);
        setSelectedId(created.id);
      }, 800);
    } catch (err: any) {
      setSaveError(err?.response?.message ?? "Gagal menyimpan kendaraan.");
    } finally {
      setSaving(false);
    }
  };

  const getVehicleImageUrl = (v: any) => {
    if (!v.file_image_vehicle) return null;
    return pb.files.getURL(v, v.file_image_vehicle);
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-sm">
          Pilih <strong className="text-white">satu kendaraan</strong> untuk digunakan di kelas ini.
        </p>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-white/8 hover:bg-white/12 border border-white/12 hover:border-white/20 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          Tambah Kendaraan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-10 text-center">
          <span className="material-symbols-outlined text-white/15 text-[40px] mb-3 block">no_car</span>
          <p className="text-white/40 text-sm">Belum ada kendaraan. Tambahkan kendaraan tim Anda.</p>
          <button
            onClick={openModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Kendaraan Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {vehicles.map((v) => {
            const imgUrl = getVehicleImageUrl(v);
            const isSelected = selectedId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : v.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-[#b80014] bg-[#b80014]/10"
                    : "border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }`}
              >
                <div className="w-16 h-12 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {imgUrl ? (
                    <img src={imgUrl} alt={v.model} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-white/25 text-[22px]">directions_car</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">
                    {v.brand} {v.model}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {v.plate_number && (
                      <span className="text-[#b80014] text-xs font-bold px-2 py-0.5 bg-[#b80014]/8 rounded border border-[#b80014]/15">
                        {v.plate_number}
                      </span>
                    )}
                    {v.cc && <span className="text-white/40 text-xs">{v.cc} cc</span>}
                    {v.year && <span className="text-white/40 text-xs">{v.year}</span>}
                    {v.color && <span className="text-white/40 text-xs">{v.color}</span>}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? "bg-[#b80014] border-[#b80014]" : "border-white/20"
                  }`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-white text-[14px]">check</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-3 border border-white/15 hover:border-white/30 text-white/60 hover:text-white text-sm font-semibold rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali
        </button>
        <button
          type="button"
          disabled={!selectedVehicle}
          onClick={() => selectedVehicle && onNext(selectedVehicle)}
          className="flex-1 py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {selectedVehicle ? (
            <>
              Lanjut — Review
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          ) : (
            "Pilih kendaraan terlebih dahulu"
          )}
        </button>
      </div>

      {/* Modal Tambah Kendaraan */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#161819] border border-white/10 rounded-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#161819] border-b border-white/8 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <h3 className="text-white font-headline font-bold text-lg">Tambah Kendaraan</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-white/30 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmitVehicle)} className="space-y-4">
                {/* Image */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imgPreview ? (
                      <img src={imgPreview} className="w-full h-full object-cover" alt="vehicle" />
                    ) : (
                      <span className="material-symbols-outlined text-white/20 text-[24px]">directions_car</span>
                    )}
                  </div>
                  <div>
                    <input
                      ref={imgRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      id="modal-vehicle-img"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setImgPreview(URL.createObjectURL(f));
                      }}
                    />
                    <label htmlFor="modal-vehicle-img" className="cursor-pointer text-sm text-[#b80014] hover:text-[#e21b23] transition-colors block mb-1">
                      {imgPreview ? "Ganti Foto" : "Upload Foto"}
                    </label>
                    <p className="text-white/30 text-xs">Opsional — maks 5 MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Brand / Merk *</label>
                    <input className={inputCls(!!errors.brand)} placeholder="Toyota, Honda" {...register("brand")} />
                    {errors.brand && <p className="mt-1.5 text-xs text-red-400">{errors.brand.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Model *</label>
                    <input className={inputCls(!!errors.model)} placeholder="Civic, Yaris" {...register("model")} />
                    {errors.model && <p className="mt-1.5 text-xs text-red-400">{errors.model.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">CC Mesin</label>
                    <input className={inputCls()} placeholder="2000" {...register("cc")} />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Tahun</label>
                    <input className={inputCls()} placeholder="2024" {...register("year")} />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Warna</label>
                    <input className={inputCls()} placeholder="Merah" {...register("color")} />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">No. Plat</label>
                    <input className={inputCls()} placeholder="B 1234 ABC" {...register("plate_number")} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-white/60 mb-1.5">Catatan</label>
                    <input className={inputCls()} placeholder="Modifikasi, dll (opsional)" {...register("notes")} />
                  </div>
                </div>

                {saveError && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400">{saveError}</p>
                  </div>
                )}
                {savedOk && (
                  <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30">
                    <p className="text-sm text-green-400">✓ Kendaraan berhasil ditambahkan</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || savedOk}
                  className="w-full py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? "Menyimpan..." : savedOk ? "✓ Tersimpan" : "Tambah Kendaraan"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
