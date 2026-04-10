"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { teamSchema, type TeamForm } from "@/schemas/team.schema";
import {
  getMyTeam,
  createTeam,
  updateTeam,
} from "@/lib/api/teams";
import { useTeamStore } from "@/store/teamStore";
import pb from "@/lib/pb";

function FormField({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white/60 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function inputClass(hasError?: boolean) {
  return `w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/20 text-sm outline-none transition-all
   focus:ring-2 focus:ring-[#b80014]/40 focus:border-[#b80014]/50
   ${hasError ? "border-red-500/50" : "border-white/10"}`;
}

function TeamProfileForm() {
  const router = useRouter();
  const params = useSearchParams();
  const isSetup = params.get("setup") === "1";
  const { setTeam } = useTeamStore();

  const [existingTeam, setExistingTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [savedOk, setSavedOk] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
  });

  useEffect(() => {
    const init = async () => {
      const team = await getMyTeam();
      if (team) {
        setExistingTeam(team);
        if (team.logo) setLogoPreview(pb.files.getURL(team, team.logo));
        reset({
          name: team.name,
          description: team.description,
          entrant_number: team.entrant_number,
          entrant_pic: team.entrant_pic,
          entrant_pic_phone: team.entrant_pic_phone,
          entrant_pic_kta: team.entrant_pic_kta,
          manager_name: team.manager_name,
          manager_phone: team.manager_phone,
          manager_license: team.manager_license,
          manager_kta: team.manager_kta,
        });
      }
      setLoading(false);
    };
    init();
  }, [reset]);

  const onSubmit = async (data: TeamForm) => {
    setSaving(true);
    setServerError("");
    try {
      const logo = logoRef.current?.files?.[0];
      let saved: any;
      if (existingTeam) {
        saved = await updateTeam(existingTeam.id, data, logo);
      } else {
        saved = await createTeam(data, logo);
      }
      setTeam(saved.id, saved.name);
      setSavedOk(true);
      setTimeout(() => {
        router.push("/dashboard/team");
      }, 1000);
    } catch (err: any) {
      setServerError(err?.response?.message ?? "Simpan gagal. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-headline font-semibold text-white">
          {isSetup ? "Set Up Profil Tim" : "Edit Profil Tim"}
        </h1>
        {isSetup && (
          <p className="text-white/40 text-sm mt-1">
            Lengkapi data tim sebelum mendaftar ke pit.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white/20 text-[32px]">
                add_photo_alternate
              </span>
            )}
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-1">Logo Tim</p>
            <input
              ref={logoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              id="logo-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setLogoPreview(URL.createObjectURL(file));
              }}
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer text-sm text-[#b80014] hover:text-[#e21b23] transition-colors"
            >
              {logoPreview ? "Ganti Logo" : "Upload Logo"}
            </label>
            <p className="text-white/30 text-xs mt-0.5">JPG, PNG, WebP — maks 5 MB</p>
          </div>
        </div>

        {/* Section: Data Tim */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Data Tim</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Nama Tim *" id="name" error={errors.name?.message}>
                <input
                  id="name"
                  className={inputClass(!!errors.name)}
                  placeholder="Nama tim Anda"
                  {...register("name")}
                />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Deskripsi" id="description" error={errors.description?.message}>
                <input
                  id="description"
                  className={inputClass()}
                  placeholder="Opsional"
                  {...register("description")}
                />
              </FormField>
            </div>
            <FormField label="No. Entrant" id="entrant_number" error={errors.entrant_number?.message}>
              <input
                id="entrant_number"
                className={inputClass()}
                placeholder="Opsional"
                {...register("entrant_number")}
              />
            </FormField>
            <FormField label="Nama PIC Entrant" id="entrant_pic" error={errors.entrant_pic?.message}>
              <input
                id="entrant_pic"
                className={inputClass()}
                placeholder="Opsional"
                {...register("entrant_pic")}
              />
            </FormField>
            <FormField label="HP PIC Entrant" id="entrant_pic_phone" error={errors.entrant_pic_phone?.message}>
              <input
                id="entrant_pic_phone"
                className={inputClass()}
                placeholder="Opsional"
                {...register("entrant_pic_phone")}
              />
            </FormField>
            <FormField label="KTA PIC Entrant" id="entrant_pic_kta" error={errors.entrant_pic_kta?.message}>
              <input
                id="entrant_pic_kta"
                className={inputClass()}
                placeholder="Opsional"
                {...register("entrant_pic_kta")}
              />
            </FormField>
          </div>
        </div>

        {/* Section: Manager */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Data Manager Tim
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nama Manager *" id="manager_name" error={errors.manager_name?.message}>
              <input
                id="manager_name"
                className={inputClass(!!errors.manager_name)}
                placeholder="Nama lengkap manager"
                {...register("manager_name")}
              />
            </FormField>
            <FormField label="No. HP Manager *" id="manager_phone" error={errors.manager_phone?.message}>
              <input
                id="manager_phone"
                className={inputClass(!!errors.manager_phone)}
                placeholder="08xxxxxxxxxx"
                {...register("manager_phone")}
              />
            </FormField>
            <FormField label="No. Lisensi" id="manager_license" error={errors.manager_license?.message}>
              <input
                id="manager_license"
                className={inputClass()}
                placeholder="Opsional"
                {...register("manager_license")}
              />
            </FormField>
            <FormField label="No. KTA" id="manager_kta" error={errors.manager_kta?.message}>
              <input
                id="manager_kta"
                className={inputClass()}
                placeholder="Opsional"
                {...register("manager_kta")}
              />
            </FormField>
          </div>
        </div>

        {serverError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{serverError}</p>
          </div>
        )}
        {savedOk && (
          <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-sm text-green-400">✓ Profil tim berhasil disimpan</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            id="btn-save-team"
            type="submit"
            disabled={saving || savedOk}
            className="flex-1 py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {saving ? "Menyimpan..." : savedOk ? "✓ Tersimpan" : "Simpan Profil Tim"}
          </button>
          {!isSetup && (
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-white/10 text-white/50 hover:text-white rounded-xl text-sm transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function TeamProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <TeamProfileForm />
    </Suspense>
  );
}
