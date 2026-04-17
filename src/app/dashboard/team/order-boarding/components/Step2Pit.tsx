"use client";

import { useEffect, useState } from "react";
import { getAvailablePits } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/orderUtils";
import pb from "@/lib/pb";

interface RacePit {
  id: string;
  name: string;
  price: number;
  description?: string;
  cover?: string;
  expand?: {
    race_category?: {
      id: string;
      name: string;
      expand?: { race_class?: { id: string; name: string } };
    };
  };
}

interface GroupedCatalog {
  classId: string;
  className: string;
  categories: { categoryId: string; categoryName: string; pits: RacePit[] }[];
}

function groupPits(pits: RacePit[]): GroupedCatalog[] {
  const map = new Map<string, GroupedCatalog>();
  for (const pit of pits) {
    const cat = pit.expand?.race_category;
    const cls = cat?.expand?.race_class;
    const classId = cls?.id ?? "other";
    const className = cls?.name ?? "Kelas Lainnya";
    const categoryId = cat?.id ?? "other";
    const categoryName = cat?.name ?? "Kategori Lainnya";
    if (!map.has(classId)) map.set(classId, { classId, className, categories: [] });
    const cg = map.get(classId)!;
    let catGroup = cg.categories.find((c) => c.categoryId === categoryId);
    if (!catGroup) {
      catGroup = { categoryId, categoryName, pits: [] };
      cg.categories.push(catGroup);
    }
    catGroup.pits.push(pit);
  }
  return Array.from(map.values());
}

interface Props {
  preSelectedPitId?: string | null;
  locked?: boolean;
  onNext: (pit: RacePit) => void;
  onBack: () => void;
}

export default function Step2Pit({ preSelectedPitId, locked = false, onNext, onBack }: Props) {
  const [catalog, setCatalog] = useState<GroupedCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPitId, setSelectedPitId] = useState<string | null>(preSelectedPitId ?? null);
  const [selectedPit, setSelectedPit] = useState<RacePit | null>(null);

  useEffect(() => {
    getAvailablePits()
      .then((pits: any[]) => {
        const typed = pits as RacePit[];
        setCatalog(groupPits(typed));
        if (preSelectedPitId) {
          const found = typed.find((p) => p.id === preSelectedPitId);
          if (found) setSelectedPit(found);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [preSelectedPitId]);

  const handleSelect = (pit: RacePit) => {
    if (locked) return;
    setSelectedPitId(pit.id);
    setSelectedPit(pit);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {locked && selectedPit && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl">
          <span className="material-symbols-outlined text-green-400 text-[16px]">check_circle</span>
          <p className="text-green-400 text-sm font-medium">
            Pit dipilih otomatis: <strong>{selectedPit.name}</strong>
          </p>
        </div>
      )}

      {!locked && (
        <p className="text-white/50 text-sm">
          Pilih <strong className="text-white">satu</strong> kelas balap / pit yang ingin Anda ikuti.
        </p>
      )}

      {catalog.map((classGroup) => (
        <div key={classGroup.classId}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-5 bg-[#b80014] rounded-full" />
            <h3 className="text-base font-headline font-bold text-white">{classGroup.className}</h3>
          </div>
          <div className="space-y-4 pl-4">
            {classGroup.categories.map((catGroup) => (
              <div key={catGroup.categoryId}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-white/30 text-[14px]">
                    subdirectory_arrow_right
                  </span>
                  <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                    {catGroup.categoryName}
                  </h4>
                  <div className="flex-1 h-px bg-white/8" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                  {catGroup.pits.map((pit) => {
                    const isSelected = selectedPitId === pit.id;
                    const coverUrl = pit.cover ? pb.files.getURL(pit as any, pit.cover) : null;
                    return (
                      <button
                        key={pit.id}
                        type="button"
                        disabled={locked}
                        onClick={() => handleSelect(pit)}
                        className={`text-left rounded-2xl overflow-hidden border-2 transition-all group ${
                          isSelected
                            ? "border-[#b80014] bg-[#b80014]/10 shadow-lg shadow-[#b80014]/20"
                            : "border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/8"
                        } ${locked ? "cursor-default" : "cursor-pointer"}`}
                      >
                        {coverUrl && (
                          <div className="h-20 overflow-hidden relative">
                            <img
                              src={coverUrl}
                              alt={pit.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#b80014]/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[28px]">
                                  check_circle
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-3">
                          {!coverUrl && isSelected && (
                            <div className="flex justify-end mb-1">
                              <span className="material-symbols-outlined text-[#b80014] text-[18px]">
                                check_circle
                              </span>
                            </div>
                          )}
                          <p className="text-white font-semibold text-sm leading-snug">{pit.name}</p>
                          <p className="text-[#b80014] font-bold text-sm mt-1">
                            {pit.price > 0 ? formatCurrency(pit.price) : "Gratis"}
                          </p>
                          {pit.description && (
                            <p className="text-white/40 text-xs line-clamp-2 mt-1">{pit.description}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

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
          disabled={!selectedPit}
          onClick={() => selectedPit && onNext(selectedPit)}
          className="flex-1 py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {selectedPit ? (
            <>
              Lanjut — Pilih Pembalap
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          ) : (
            "Pilih salah satu pit terlebih dahulu"
          )}
        </button>
      </div>
    </div>
  );
}
