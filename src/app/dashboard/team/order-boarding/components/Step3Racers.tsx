"use client";

import { useEffect, useRef, useState } from "react";
import { getRacers, createRacer, racerFileUrl } from "@/lib/api/racers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { racerSchema, type RacerForm } from "@/schemas/racer.schema";

interface Props {
  teamId: string;
  onNext: (racer: any) => void;
  onBack: () => void;
}

function inputCls(err?: boolean) {
  return `w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/20 text-sm outline-none transition-all
    focus:ring-2 focus:ring-[#b80014]/40 focus:border-[#b80014]/50
    ${err ? "border-red-500/50" : "border-white/10"}`;
}

export default function Step3Racers({ teamId, onNext, onBack }: Props) {
  const [racers, setRacers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedOk, setSavedOk] = useState(false);

  const fileRefs = {
    photo: useRef<HTMLInputElement>(null),
    kta: useRef<HTMLInputElement>(null),
    sim: useRef<HTMLInputElement>(null),
    kis: useRef<HTMLInputElement>(null),
  };
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RacerForm>({ resolver: zodResolver(racerSchema) });

  const loadRacers = async () => {
    setLoading(true);
    const data = await getRacers(teamId).catch(() => []);
    setRacers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRacers();
  }, [teamId]);

  const openModal = () => {
    reset();
    setFilePreviews({});
    setSaveError("");
    setSavedOk(false);
    setShowModal(true);
  };

  const onSubmitRacer = async (data: RacerForm) => {
    setSaving(true);
    setSaveError("");
    try {
      const files: Record<string, File> = {};
      for (const key of ["photo", "kta", "sim", "kis"] as const) {
        const f = fileRefs[key].current?.files?.[0];
        if (f) files[key] = f;
      }
      const created = await createRacer(teamId, { ...data, ...files });
      setSavedOk(true);
      setTimeout(() => {
        setShowModal(false);
        setRacers((prev) => [created, ...prev]);
        setSelectedId(created.id);
      }, 800);
    } catch (err: any) {
      setSaveError(err?.response?.message ?? "Gagal menyimpan racer.");
    } finally {
      setSaving(false);
    }
  };

  const selectedRacer = racers.find((r) => r.id === selectedId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-sm">
          Pilih <strong className="text-white">satu pembalap</strong> untuk kelas ini.
        </p>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-white/8 hover:bg-white/12 border border-white/12 hover:border-white/20 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          Tambah Pembalap
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : racers.length === 0 ? (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-10 text-center">
          <span className="material-symbols-outlined text-white/15 text-[40px] mb-3 block">person_off</span>
          <p className="text-white/40 text-sm">Belum ada pembalap. Tambahkan pembalap tim Anda.</p>
          <button
            onClick={openModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Pembalap Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {racers.map((r) => {
            const photoUrl = racerFileUrl(r, "photo");
            const isSelected = selectedId === r.id;
            const initials = r.name?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : r.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-[#b80014] bg-[#b80014]/10"
                    : "border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white/40 font-bold text-sm">{initials || "?"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{r.name}</p>
                  {r.phone && <p className="text-white/40 text-xs mt-0.5">{r.phone}</p>}
                  <div className="flex gap-1 mt-1.5">
                    {["kta", "sim", "kis"].map((doc) => (
                      <span
                        key={doc}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          r[doc]
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "bg-white/5 text-white/20 border border-white/8"
                        }`}
                      >
                        {doc}
                      </span>
                    ))}
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
          disabled={!selectedRacer}
          onClick={() => selectedRacer && onNext(selectedRacer)}
          className="flex-1 py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {selectedRacer ? (
            <>
              Lanjut — Pilih Kendaraan
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          ) : (
            "Pilih pembalap terlebih dahulu"
          )}
        </button>
      </div>

      {/* Modal Tambah Pembalap */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#161819] border border-white/10 rounded-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#161819] border-b border-white/8 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <h3 className="text-white font-headline font-bold text-lg">Tambah Pembalap</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-white/30 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmitRacer)} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Nama Racer *</label>
                  <input className={inputCls(!!errors.name)} placeholder="Nama lengkap" {...register("name")} />
                  {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">No. HP</label>
                    <input className={inputCls()} placeholder="08xx" {...register("phone")} />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Tanggal Lahir</label>
                    <input type="date" className={inputCls()} {...register("birth_date")} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Alamat</label>
                  <textarea rows={2} className={inputCls()} placeholder="Alamat racer" {...register("address")} />
                </div>
                {/* Document uploads */}
                <div className="grid grid-cols-2 gap-3">
                  {(["photo", "kta", "sim", "kis"] as const).map((key) => {
                    const labels = { photo: "Foto", kta: "KTA", sim: "SIM", kis: "KIS" };
                    const preview = filePreviews[key];
                    return (
                      <div key={key} className="bg-white/5 border border-white/8 rounded-xl p-3">
                        <p className="text-xs text-white/50 mb-2">{labels[key]}</p>
                        {preview && (
                          <div className="w-full h-16 rounded-lg overflow-hidden mb-2">
                            <img src={preview} className="w-full h-full object-cover" alt={key} />
                          </div>
                        )}
                        <input
                          ref={fileRefs[key]}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          id={`modal-${key}`}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setFilePreviews((p) => ({ ...p, [key]: URL.createObjectURL(f) }));
                          }}
                        />
                        <label
                          htmlFor={`modal-${key}`}
                          className="cursor-pointer flex items-center justify-center gap-1 w-full py-1.5 border border-dashed border-white/15 hover:border-[#b80014]/40 rounded-lg text-[10px] text-white/40 hover:text-white/70 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">upload</span>
                          {preview ? "Ganti" : "Upload"}
                        </label>
                      </div>
                    );
                  })}
                </div>

                {saveError && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400">{saveError}</p>
                  </div>
                )}
                {savedOk && (
                  <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30">
                    <p className="text-sm text-green-400">✓ Pembalap berhasil ditambahkan</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || savedOk}
                  className="w-full py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? "Menyimpan..." : savedOk ? "✓ Tersimpan" : "Tambah Pembalap"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
