"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleForm } from "@/schemas/vehicle.schema";

function inputClass(hasError?: boolean) {
  return `w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/20 text-sm outline-none transition-all focus:ring-2 focus:ring-[#b80014]/40 focus:border-[#b80014]/50 ${hasError ? "border-red-500/50" : "border-white/10"}`;
}

interface Props {
  defaultValues?: Partial<VehicleForm>;
  existingImageUrl?: string | null;
  onSubmit: (data: VehicleForm, image?: File) => Promise<void>;
  isEdit?: boolean;
}

export default function VehicleFormComponent({ defaultValues, existingImageUrl, onSubmit, isEdit }: Props) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [savedOk, setSavedOk] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(existingImageUrl ?? null);

  const { register, handleSubmit, formState: { errors } } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
  });

  const handleInner = async (data: VehicleForm) => {
    setSaving(true);
    setServerError("");
    try {
      const image = imgRef.current?.files?.[0];
      await onSubmit(data, image);
      setSavedOk(true);
    } catch (err: any) {
      setServerError(err?.response?.message ?? "Simpan gagal. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleInner)} className="space-y-6">
      {/* Image upload */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Foto Kendaraan</h2>
        <div className="flex items-center gap-4">
          <div className="w-32 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {imgPreview ? (
              <img src={imgPreview} alt="Vehicle" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white/20 text-[32px]">directions_car</span>
            )}
          </div>
          <div>
            <input
              ref={imgRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" id="vehicle-img"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setImgPreview(URL.createObjectURL(f));
              }}
            />
            <label htmlFor="vehicle-img" className="cursor-pointer text-sm text-[#b80014] hover:text-[#e21b23] transition-colors block mb-1">
              {imgPreview ? "Ganti Foto" : "Upload Foto"}
            </label>
            <p className="text-white/30 text-xs">JPG, PNG, WebP — maks 5 MB (opsional)</p>
          </div>
        </div>
      </div>

      {/* Vehicle data */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Data Kendaraan</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="v-brand" className="block text-sm text-white/60 mb-1.5">Brand / Merk *</label>
            <input id="v-brand" className={inputClass(!!errors.brand)} placeholder="Toyota, Honda, dll" {...register("brand")} />
            {errors.brand && <p className="mt-1.5 text-xs text-red-400">{errors.brand.message}</p>}
          </div>
          <div>
            <label htmlFor="v-model" className="block text-sm text-white/60 mb-1.5">Model *</label>
            <input id="v-model" className={inputClass(!!errors.model)} placeholder="Civic Type R, dll" {...register("model")} />
            {errors.model && <p className="mt-1.5 text-xs text-red-400">{errors.model.message}</p>}
          </div>
          <div>
            <label htmlFor="v-cc" className="block text-sm text-white/60 mb-1.5">Kapasitas Mesin (CC)</label>
            <input id="v-cc" className={inputClass()} placeholder="2000" {...register("cc")} />
          </div>
          <div>
            <label htmlFor="v-year" className="block text-sm text-white/60 mb-1.5">Tahun</label>
            <input id="v-year" className={inputClass()} placeholder="2024" {...register("year")} />
          </div>
          <div>
            <label htmlFor="v-color" className="block text-sm text-white/60 mb-1.5">Warna</label>
            <input id="v-color" className={inputClass()} placeholder="Merah" {...register("color")} />
          </div>
          <div>
            <label htmlFor="v-plate" className="block text-sm text-white/60 mb-1.5">No. Plat</label>
            <input id="v-plate" className={inputClass()} placeholder="B 1234 ABC" {...register("plate_number")} />
          </div>
          <div className="col-span-2">
            <label htmlFor="v-notes" className="block text-sm text-white/60 mb-1.5">Catatan</label>
            <input id="v-notes" className={inputClass()} placeholder="Modifikasi khusus, dll" {...register("notes")} />
          </div>
        </div>
      </div>

      {serverError && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30"><p className="text-sm text-red-400">{serverError}</p></div>}
      {savedOk && <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30"><p className="text-sm text-green-400">✓ Kendaraan berhasil disimpan</p></div>}

      <button id="btn-save-vehicle" type="submit" disabled={saving || savedOk}
        className="w-full py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
        {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {saving ? "Menyimpan..." : savedOk ? "✓ Tersimpan" : isEdit ? "Simpan Perubahan" : "Tambah Kendaraan"}
      </button>
    </form>
  );
}
