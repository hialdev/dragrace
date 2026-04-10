"use client";

import { useEffect, useState } from "react";
import { getLockedOrders } from "@/lib/api/admin";
import pb from "@/lib/pb";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface ParticipantGroup {
  id: string;
  name: string;
  categories: {
    id: string;
    name: string;
    pits: {
      id: string;
      name: string;
      orders: any[];
    }[];
  }[];
}

// ── Helper ────────────────────────────────────────────────────────────────

function groupByHierarchy(orders: any[], assignments: any[]): ParticipantGroup[] {
  const classMap = new Map<string, ParticipantGroup>();
  const assignMap = new Map<string, any[]>();

  // Map assignments to orders
  assignments.forEach((a) => {
    const list = assignMap.get(a.order) || [];
    list.push(a);
    assignMap.set(a.order, list);
  });

  orders.forEach((o) => {
    const pit = o.expand?.race_pit;
    const cat = pit?.expand?.race_category;
    const cls = cat?.expand?.race_class;

    const classId = cls?.id ?? "uncategorized";
    const className = cls?.name ?? "Tanpa Kelas";
    const categoryId = cat?.id ?? "other";
    const categoryName = cat?.name ?? "Lainnya";
    const pitId = pit?.id ?? "pit-other";
    const pitName = pit?.name ?? "Pit Lainnya";

    if (!classMap.has(classId)) {
      classMap.set(classId, { id: classId, name: className, categories: [] });
    }
    const classGroup = classMap.get(classId)!;

    let catGroup = classGroup.categories.find((c) => c.id === categoryId);
    if (!catGroup) {
      catGroup = { id: categoryId, name: categoryName, pits: [] };
      classGroup.categories.push(catGroup);
    }

    let pitGroup = catGroup.pits.find((p) => p.id === pitId);
    if (!pitGroup) {
      pitGroup = { id: pitId, name: pitName, orders: [] };
      catGroup.pits.push(pitGroup);
    }

    // Attach assignments to the order
    const orderWithAssigns = { ...o, assignments: assignMap.get(o.id) || [] };
    pitGroup.orders.push(orderWithAssigns);
  });

  return Array.from(classMap.values());
}

export default function ParticipantsPage() {
  const [hierarchy, setHierarchy] = useState<ParticipantGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const orders = await getLockedOrders();
        
        // Fetch all assignments for these orders
        let assignments: any[] = [];
        if (orders.length > 0) {
          assignments = await pb.collection("order_racer_assignment").getFullList({
            filter: orders.map((o: any) => `order = "${o.id}"`).join(" || "),
            expand: "racer,vehicle",
          });
        }

        setHierarchy(groupByHierarchy(orders, assignments));
      } catch (err) {
        console.error("Failed to load participants:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleGlobalExport = () => {
    setExporting(true);
    try {
      // Build CSV Data
      const headers = [
        "Kelas", "Kategori", "Pit", "Kode Order", "Team", 
        "Racer Name", "Racer Phone", "Vehicle Brand", "Vehicle Model", "Vehicle Plate"
      ];
      const rows: string[][] = [headers];

      hierarchy.forEach((cls) => {
        cls.categories.forEach((cat) => {
          cat.pits.forEach((pit) => {
            pit.orders.forEach((order) => {
              const teamName = order.expand?.team?.name || order.expand?.user?.full_name || "—";
              
              if (order.assignments.length === 0) {
                rows.push([cls.name, cat.name, pit.name, order.code, teamName, "—", "—", "—", "—", "—"]);
              } else {
                order.assignments.forEach((a: any) => {
                  rows.push([
                    cls.name, cat.name, pit.name, order.code, teamName,
                    a.expand?.racer?.name || "—",
                    a.expand?.racer?.phone || "—",
                    a.expand?.vehicle?.brand || "—",
                    a.expand?.vehicle?.model || "—",
                    a.expand?.vehicle?.plate_number || "—"
                  ]);
                });
              }
            });
          });
        });
      });

      const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `all-participants-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Export gagal.");
    } finally {
      setExporting(false);
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
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Data Peserta Lomba</h1>
          <p className="text-white/40 text-sm mt-1">Dikelompokkan berdasarkan hierarki kelas dan kategori</p>
        </div>
        <button
          onClick={handleGlobalExport}
          disabled={exporting || hierarchy.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-[#b80014]/20"
        >
          {exporting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[20px]">download</span>
          )}
          Download Semua Data (.CSV)
        </button>
      </div>

      {hierarchy.length === 0 ? (
        <div className="bg-white/5 border border-white/8 rounded-3xl p-12 text-center">
          <span className="material-symbols-outlined text-white/15 text-[48px] mb-4 block">groups</span>
          <p className="text-white/40 text-sm">Belum ada data peserta terkunci yang siap ditampilkan.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {hierarchy.map((cls) => (
            <div key={cls.id} className="space-y-6">
              {/* Race Class Header */}
              <div className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-2xl px-6 py-4">
                <div className="w-10 h-10 bg-[#b80014] rounded-xl flex items-center justify-center shadow-lg shadow-[#b80014]/20">
                  <span className="material-symbols-outlined text-white text-[20px]">stars</span>
                </div>
                <div>
                  <h2 className="text-lg font-headline font-bold text-white uppercase tracking-wider">{cls.name}</h2>
                  <p className="text-[#b80014] text-[10px] font-bold uppercase tracking-widest mt-0.5">Race Class</p>
                </div>
              </div>

              {cls.categories.map((cat) => (
                <div key={cat.id} className="pl-6 border-l border-white/8 space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/30 text-[18px]">subdirectory_arrow_right</span>
                    <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">{cat.name}</h3>
                    <div className="flex-1 h-px bg-white/8" />
                  </div>

                  {cat.pits.map((pit) => (
                    <div key={pit.id} className="pl-8 space-y-4">
                      {/* Pit Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b80014]" />
                          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wide">{pit.name}</h4>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono tracking-tighter">
                          {pit.orders.length} Pit Slots
                        </span>
                      </div>

                      {/* Ticket Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pit.orders.map((order) => (
                          <ParticipantCard key={order.id} order={order} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipantCard({ order }: { order: any }) {
  const team = order.expand?.team;
  const user = order.expand?.user;
  const logoUrl = team?.logo ? pb.files.getURL(team, team.logo) : null;
  const assignments = order.assignments || [];

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 hover:bg-white/[0.07] transition-all group">
      <div className="p-4 border-b border-white/8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={team?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white/10 text-[18px]">groups</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold truncate uppercase tracking-tight">
            {team?.name || user?.full_name || "—"}
          </p>
          <p className="text-white/30 text-[9px] font-mono leading-none mt-1">{order.code}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {assignments.length === 0 ? (
          <p className="text-center text-white/20 text-[10px] py-4">Belum ada racer</p>
        ) : (
          assignments.map((a: any) => {
            const vehiclePhoto = a.expand?.vehicle?.file_image_vehicle 
              ? pb.files.getURL(a.expand.vehicle, a.expand.vehicle.file_image_vehicle)
              : null;

            return (
              <div key={a.id} className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[11px] font-bold leading-tight">{a.expand?.racer?.name || "—"}</p>
                    <p className="text-white/40 text-[9px] mt-0.5">{a.expand?.racer?.phone || "—"}</p>
                  </div>
                </div>

                {a.expand?.vehicle && (
                  <div className="ml-4 pl-3 border-l border-white/8 flex gap-3 items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-[10px] font-medium leading-tight">
                        {a.expand.vehicle.brand} {a.expand.vehicle.model}
                      </p>
                      <p className="text-[#b80014] text-[9px] font-bold mt-0.5 tracking-wider">
                        {a.expand.vehicle.plate_number || "NO PLATE"}
                      </p>
                    </div>
                    {vehiclePhoto && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                        <img src={vehiclePhoto} alt="Vehicle" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
