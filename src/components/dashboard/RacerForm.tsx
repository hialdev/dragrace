"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { racerSchema, type RacerForm } from "@/schemas/racer.schema";

interface FileFieldInfo {
  key: "photo" | "kta" | "sim" | "kis";
  label: string;
  accept: string;
  icon: string;
}

const fileFields: FileFieldInfo[] = [
  { key: "photo", label: "Foto Racer", accept: "image/*", icon: "portrait" },
  { key: "kta", label: "KTA", accept: "image/*,application/pdf", icon: "badge" },
  { key: "sim", label: "SIM", accept: "image/*,application/pdf", icon: "id_card" },
  { key: "kis", label: "KIS", accept: "image/*,application/pdf", icon: "health_and_safety" },
];

function inputClass(hasError?: boolean) {
  return `w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/20 text-sm outline-none transition-all
    focus:ring-2 focus:ring-[#b80014]/40 focus:border-[#b80014]/50
    ${hasError ? "border-red-500/50" : "border-white/10"}`;
}

interface Props {
  defaultValues?: Partial<RacerForm>;
  existingFiles?: Partial<Record<"photo" | "kta" | "sim" | "kis", string | null>>;
  onSubmit: (data: RacerForm, files: Partial<Record<"photo" | "kta" | "sim" | "kis", File>>) => Promise<void>;
  isEdit?: boolean;
}

export default function RacerFormComponent({ defaultValues, existingFiles = {}, onSubmit, isEdit }: Props) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [savedOk, setSavedOk] = useState(false);
  const fileRefs = {
    photo: useRef<HTMLInputElement>(null),
    kta: useRef<HTMLInputElement>(null),
    sim: useRef<HTMLInputElement>(null),
    kis: useRef<HTMLInputElement>(null),
  };
  const [filePreviews, setFilePreviews] = useState<Partial<Record<string, string>>>({});

  const { register, handleSubmit, formState: { errors } } = useForm<RacerForm>({
    resolver: zodResolver(racerSchema),
    defaultValues,
  });

  const handleFileChange = (key: string, file: File | undefined) => {
    if (!file) return;
    setFilePreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const handleSubmitInner = async (data: RacerForm) => {
    setSaving(true);
    setServerError("");
    const files: Partial<Record<"photo" | "kta" | "sim" | "kis", File>> = {};
    for (const f of fileFields) {
      const file = fileRefs[f.key].current?.files?.[0];
      if (file) files[f.key] = file;
    }
    try {
      await onSubmit(data, files);
      setSavedOk(true);
    } catch (err: any) {
      setServerError(err?.response?.message ?? "Simpan gagal. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitInner)} className="space-y-6">
      {/* Basic info */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Data Racer</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="racer-name" className="block text-sm text-white/60 mb-1.5">Nama Racer *</label>
            <input id="racer-name" className={inputClass(!!errors.name)} placeholder="Nama lengkap" {...register("name")} />
            {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="racer-phone" className="block text-sm text-white/60 mb-1.5">No. HP</label>
            <input id="racer-phone" className={inputClass()} placeholder="08xxxxxxxxxx" {...register("phone")} />
          </div>
          <div>
            <label htmlFor="racer-birth" className="block text-sm text-white/60 mb-1.5">Tanggal Lahir</label>
            <input id="racer-birth" type="date" className={inputClass()} {...register("birth_date")} />
          </div>
          <div className="col-span-2">
            <label htmlFor="racer-address" className="block text-sm text-white/60 mb-1.5">Alamat</label>
            <textarea id="racer-address" rows={2} className={inputClass()} placeholder="Alamat racer" {...register("address")} />
          </div>
          <div className="col-span-2">
            <label htmlFor="racer-notes" className="block text-sm text-white/60 mb-1.5">Catatan</label>
            <input id="racer-notes" className={inputClass()} placeholder="Catatan tambahan (opsional)" {...register("notes")} />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Dokumen</h2>
        <div className="grid grid-cols-2 gap-4">
          {fileFields.map((f) => {
            const existing = existingFiles[f.key];
            const preview = filePreviews[f.key] || existing;
            const isImage = preview && !preview.endsWith(".pdf");
            return (
              <div key={f.key} className="bg-white/5 border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-white/30 text-[18px]">{f.icon}</span>
                  <span className="text-sm text-white/60">{f.label}</span>
                  {existing && !filePreviews[f.key] && (
                    <span className="ml-auto text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded font-semibold">Ada</span>
                  )}
                </div>
                <input
                  ref={fileRefs[f.key]}
                  type="file"
                  accept={f.accept}
                  className="hidden"
                  id={`file-${f.key}`}
                  onChange={(e) => handleFileChange(f.key, e.target.files?.[0])}
                />
                {isImage && (
                  <div className="w-full h-24 rounded-lg overflow-hidden mb-2">
                    <img src={preview as string} alt={f.label} className="w-full h-full object-cover" />
                  </div>
                )}
                {preview && !isImage && (
                  <p className="text-xs text-green-400 mb-2">📄 File tersimpan</p>
                )}
                <label htmlFor={`file-${f.key}`}
                  className="cursor-pointer flex items-center justify-center gap-1.5 w-full py-2 border border-dashed border-white/15 hover:border-[#b80014]/40 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors">
                  <span className="material-symbols-outlined text-[14px]">upload</span>
                  {preview ? "Ganti File" : "Upload"}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {serverError && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30"><p className="text-sm text-red-400">{serverError}</p></div>}
      {savedOk && <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30"><p className="text-sm text-green-400">✓ Data racer berhasil disimpan</p></div>}

      <button
        id="btn-save-racer"
        type="submit"
        disabled={saving || savedOk}
        className="w-full py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {saving ? "Menyimpan..." : savedOk ? "✓ Tersimpan" : isEdit ? "Simpan Perubahan" : "Tambah Racer"}
      </button>
    </form>
  );
}
