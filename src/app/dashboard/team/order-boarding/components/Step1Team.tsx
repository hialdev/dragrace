"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchema, type TeamForm } from "@/schemas/team.schema";
import { createTeam, updateTeam, getRaceClasses } from "@/lib/api/teams";
import { useEffect } from "react";
import pb from "@/lib/pb";

interface Props {
  /** Tim yang sudah ada (null = user baru) */
  existingTeam?: any | null;
  /** Jika true, form hanya preview/readonly */
  readonly?: boolean;
  onNext: (team: any) => void;
}

function inputCls(err?: boolean) {
  return `w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/20 text-sm outline-none transition-all
    focus:ring-2 focus:ring-[#b80014]/40 focus:border-[#b80014]/50
    ${err ? "border-red-500/50" : "border-white/10"}`;
}

export default function Step1Team({ existingTeam, readonly = false, onNext }: Props) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [raceClasses, setRaceClasses] = useState<any[]>([]);
  const logoRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    existingTeam?.logo ? pb.files.getURL(existingTeam, existingTeam.logo) : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: existingTeam
      ? {
          name: existingTeam.name ?? "",
          description: existingTeam.description ?? "",
          entrant_number: existingTeam.entrant_number ?? "",
          entrant_pic: existingTeam.entrant_pic ?? "",
          entrant_pic_phone: existingTeam.entrant_pic_phone ?? "",
          entrant_pic_kta: existingTeam.entrant_pic_kta ?? "",
          manager_name: existingTeam.manager_name ?? "",
          manager_phone: existingTeam.manager_phone ?? "",
          manager_license: existingTeam.manager_license ?? "",
          manager_kta: existingTeam.manager_kta ?? "",
        }
      : undefined,
  });

  useEffect(() => {
    getRaceClasses().catch(() => []).then(setRaceClasses);
  }, []);

  const onSubmit = async (data: TeamForm) => {
    if (readonly && existingTeam) {
      onNext(existingTeam);
      return;
    }
    setSaving(true);
    setServerError("");
    try {
      const logo = logoRef.current?.files?.[0];
      let team: any;
      if (existingTeam) {
        team = await updateTeam(existingTeam.id, data, logo);
      } else {
        team = await createTeam(data, logo);
      }
      onNext(team);
    } catch (err: any) {
      setServerError(err?.response?.message ?? "Gagal menyimpan data tim.");
    } finally {
      setSaving(false);
    }
  };

  if (readonly && existingTeam) {
    const logoUrl = existingTeam.logo ? pb.files.getURL(existingTeam, existingTeam.logo) : null;
    return (
      <div className="space-y-6">
        {/* Preview card */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={existingTeam.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-white/30 text-[28px]">groups</span>
              )}
            </div>
            <div>
              <p className="text-white font-bold text-xl">{existingTeam.name}</p>
              <p className="text-white/40 text-sm mt-0.5">
                Entrant #{existingTeam.entrant_number || "—"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="material-symbols-outlined text-green-400 text-[14px]">lock</span>
              <span className="text-green-400 text-xs font-semibold">Data Tim Terkunci</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Nama Manager", existingTeam.manager_name],
              ["No. HP Manager", existingTeam.manager_phone],
              ["No. Lisensi", existingTeam.manager_license || "—"],
              ["No. KTA", existingTeam.manager_kta || "—"],
            ].map(([label, val]) => (
              <div key={label as string}>
                <p className="text-white/30 text-xs mb-0.5">{label}</p>
                <p className="text-white">{val || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onNext(existingTeam)}
          className="w-full py-3.5 bg-[#b80014] hover:bg-[#e21b23] text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Lanjut — Pilih Kelas / Pit
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Logo upload */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Logo Tim</h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white/20 text-[32px]">groups</span>
            )}
          </div>
          <div>
            <input
              ref={logoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              id="team-logo"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setLogoPreview(URL.createObjectURL(f));
              }}
            />
            <label
              htmlFor="team-logo"
              className="cursor-pointer text-sm text-[#b80014] hover:text-[#e21b23] transition-colors block mb-1"
            >
              {logoPreview ? "Ganti Logo" : "Upload Logo"}
            </label>
            <p className="text-white/30 text-xs">JPG, PNG — maks 5 MB (opsional)</p>
          </div>
        </div>
      </div>

      {/* Team Info */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Identitas Tim</h3>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Nama Tim *</label>
          <input className={inputCls(!!errors.name)} placeholder="Nama tim Anda" {...register("name")} />
          {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">No. Entrant</label>
            <input className={inputCls()} placeholder="Nomor entrant" {...register("entrant_number")} />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">PIC Entrant</label>
            <input className={inputCls()} placeholder="Nama PIC" {...register("entrant_pic")} />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">HP Entrant</label>
            <input className={inputCls()} placeholder="08xx" {...register("entrant_pic_phone")} />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">KTA Entrant</label>
            <input className={inputCls()} placeholder="No. KTA" {...register("entrant_pic_kta")} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Deskripsi</label>
          <textarea rows={2} className={inputCls()} placeholder="Deskripsi singkat tim (opsional)" {...register("description")} />
        </div>
      </div>

      {/* Manager Info */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Data Manager</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Nama Manager *</label>
            <input className={inputCls(!!errors.manager_name)} placeholder="Nama lengkap" {...register("manager_name")} />
            {errors.manager_name && <p className="mt-1.5 text-xs text-red-400">{errors.manager_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">HP Manager *</label>
            <input className={inputCls(!!errors.manager_phone)} placeholder="08xx" {...register("manager_phone")} />
            {errors.manager_phone && <p className="mt-1.5 text-xs text-red-400">{errors.manager_phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">No. Lisensi</label>
            <input className={inputCls()} placeholder="Nomor lisensi" {...register("manager_license")} />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">No. KTA Manager</label>
            <input className={inputCls()} placeholder="No. KTA" {...register("manager_kta")} />
          </div>
        </div>
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3.5 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            Simpan & Lanjut
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}
