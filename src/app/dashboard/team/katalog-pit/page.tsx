"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyOrdersWithAssignments, getAvailablePits } from "@/lib/api/orders";
import { getMyTeam } from "@/lib/api/teams";
import { statusBadge, lockBadge, formatCurrency } from "@/lib/orderUtils";
import pb from "@/lib/pb";

// ── Types ──────────────────────────────────────────────────────────────────
interface RacePit {
  id: string;
  name: string;
  slug?: string;
  price: number;
  description?: string;
  cover?: string;
  race_category: string;
  expand?: {
    race_category?: {
      id: string;
      name: string;
      race_class?: string;
      expand?: {
        race_class?: { id: string; name: string };
      };
    };
  };
}

interface GroupedCatalog {
  classId: string;
  className: string;
  categories: {
    categoryId: string;
    categoryName: string;
    pits: RacePit[];
  }[];
}

// ── Helper ────────────────────────────────────────────────────────────────
function groupPitsByHierarchy(pits: RacePit[]): GroupedCatalog[] {
  const classMap = new Map<string, GroupedCatalog>();

  for (const pit of pits) {
    const cat = pit.expand?.race_category;
    const cls = cat?.expand?.race_class;

    const classId = cls?.id ?? "uncategorized";
    const className = cls?.name ?? "Kelas Lainnya";
    const categoryId = cat?.id ?? "other";
    const categoryName = cat?.name ?? "Kategori Lainnya";

    if (!classMap.has(classId)) {
      classMap.set(classId, { classId, className, categories: [] });
    }
    const classGroup = classMap.get(classId)!;

    let catGroup = classGroup.categories.find((c) => c.categoryId === categoryId);
    if (!catGroup) {
      catGroup = { categoryId, categoryName, pits: [] };
      classGroup.categories.push(catGroup);
    }
    catGroup.pits.push(pit);
  }

  return Array.from(classMap.values());
}

function pitCoverUrl(pit: RacePit): string | null {
  if (!pit.cover) return null;
  return pb.files.getURL(pit as any, pit.cover);
}

// ── Sub-components ────────────────────────────────────────────────────────
function PitCard({
  pit,
  ownedCount,
  onOrder,
}: {
  pit: RacePit;
  ownedCount: number;
  onOrder: (pitId: string) => void;
}) {
  const coverUrl = pitCoverUrl(pit);

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 hover:bg-white/[0.07] transition-all group">
      {/* Cover */}
      {coverUrl && (
        <div className="h-28 overflow-hidden relative">
          <img
            src={coverUrl}
            alt={pit.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {ownedCount > 0 && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-[#b80014] text-white text-[10px] font-bold rounded-lg shadow-lg">
              {ownedCount} Dimiliki
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        {!coverUrl && ownedCount > 0 && (
          <div className="mb-2 flex justify-end">
            <span className="px-2 py-0.5 bg-[#b80014]/20 text-[#b80014] text-[10px] font-bold rounded border border-[#b80014]/30">
              {ownedCount} Dimiliki
            </span>
          </div>
        )}
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-white font-semibold text-sm leading-snug">{pit.name}</p>
          {pit.price > 0 ? (
            <p className="text-[#b80014] font-bold text-sm flex-shrink-0">
              {formatCurrency(pit.price)}
            </p>
          ) : (
            <p className="text-white/30 text-sm flex-shrink-0">Gratis</p>
          )}
        </div>
        {pit.description && (
          <p className="text-white/40 text-xs line-clamp-2 mb-3">{pit.description}</p>
        )}
        <button
          onClick={() => onOrder(pit.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all
            bg-[#b80014]/10 hover:bg-[#b80014]/20 text-[#b80014] border border-[#b80014]/20"
        >
          <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
          {ownedCount > 0 ? "Tambah Slot Pit" : "Daftar Pit Ini"}
        </button>
      </div>
    </div>
  );
}

function OrderTicketCard({ order }: { order: any }) {
  const pit = order.expand?.race_pit;
  const raceCat = pit?.expand?.race_category;
  const raceClass = raceCat?.expand?.race_class;
  const status = statusBadge(order);
  const lock = lockBadge(order.is_locked, order.unlock_requested);
  const assignments: any[] = order.assignments ?? [];

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:border-white/12 transition-all">
      {/* Breadcrumb hierarchy */}
      {(raceClass || raceCat) && (
        <div className="flex items-center gap-1.5 text-[10px] text-white/30 mb-3 font-medium">
          {raceClass && <span>{raceClass.name}</span>}
          {raceClass && raceCat && (
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          )}
          {raceCat && <span>{raceCat.name}</span>}
          {raceCat && pit && (
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          )}
          {pit && <span className="text-white/50">{pit.name}</span>}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{pit?.name ?? "Race Pit"}</p>
          <p className="text-white/30 text-[10px] font-mono mt-0.5">{order.code}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold ${status.cls}`}>
              {status.label}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold ${lock.cls}`}>
              <span className="material-symbols-outlined text-[10px] align-middle mr-0.5">
                {order.is_locked ? "lock" : "lock_open"}
              </span>
              {lock.label}
            </span>
          </div>

          {/* Assigned racers */}
          {assignments.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Racer Assigned</p>
            {assignments.map((a: any) => {
              const vehiclePhoto = a.expand?.vehicle?.file_image_vehicle
                ? pb.files.getURL(a.expand.vehicle, a.expand.vehicle.file_image_vehicle)
                : null;

              return (
                <div key={a.id} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white/30 text-[10px]">person</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{a.expand?.racer?.name ?? "—"}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {a.expand?.vehicle && (
                        <>
                          <p className="text-white/30 text-[9px] truncate">
                            {a.expand.vehicle.brand} {a.expand.vehicle.model}
                          </p>
                          <span className="text-[#b80014] text-[8px] font-bold tracking-wider px-1 py-0.5 bg-[#b80014]/5 rounded border border-[#b80014]/10">
                            {a.expand.vehicle.plate_number || "—"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {vehiclePhoto && (
                    <div className="w-7 h-7 rounded border border-white/10 overflow-hidden shrink-0">
                      <img src={vehiclePhoto} alt="Vehicle" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
        </div>

        {/* Right: Price + Actions */}
        <div className="text-right flex-shrink-0">
          <p className="text-white font-semibold text-sm">
            {order.bill_price > 0 ? formatCurrency(order.bill_price) : "—"}
          </p>
          <p className="text-white/20 text-[10px] mt-0.5">
            {new Date(order.created).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            {order.status === "waiting" && (
              <Link
                href={`/dashboard/team/orders/${order.id}/payment`}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold bg-[#b80014]/10 hover:bg-[#b80014]/20 text-[#b80014] border border-[#b80014]/20 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[12px]">payments</span>
                Bayar
              </Link>
            )}
            <Link
              href={`/dashboard/team/orders/${order.id}`}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-lg transition-all group/btn"
            >
              Detail
              <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action: Assign if empty */}
      {assignments.length === 0 && order.status === "paid" && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <Link
            href={`/dashboard/team/orders/${order.id}/assignment`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 text-white text-xs font-semibold rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Assign Pembalap & Kendaraan
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
type TabType = "catalog" | "orders";

export default function KatalogPitPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("catalog");
  const [orders, setOrders] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<GroupedCatalog[]>([]);
  const [pitOwnedCounts, setPitOwnedCounts] = useState<Map<string, number>>(new Map());
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTeamWarning, setShowTeamWarning] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [myOrders, pits, teamData] = await Promise.all([
        getMyOrdersWithAssignments().catch(() => []),
        getAvailablePits().catch(() => []),
        getMyTeam().catch(() => null),
      ]);

      const counts = new Map<string, number>();
      myOrders.forEach((o: any) => {
        counts.set(o.race_pit, (counts.get(o.race_pit) || 0) + 1);
      });

      setOrders(myOrders);
      setPitOwnedCounts(counts);
      setCatalog(groupPitsByHierarchy(pits as RacePit[]));
      setTeam(teamData);
      setLoading(false);
    };
    load();
  }, []);

  const handleOrder = (pitId: string) => {
    if (!team) {
      setShowTeamWarning(true);
      return;
    }
    // Arahkan ke order boarding dengan pitId sebagai query param
    router.push(`/dashboard/team/order-boarding?pitId=${pitId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl relative">
      {/* Team Warning Modal */}
      {showTeamWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTeamWarning(false)}
          />
          <div className="relative w-full max-w-md bg-[#161819] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#b80014]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <span className="material-symbols-outlined text-[#b80014] text-[32px]">warning</span>
            </div>
            <h3 className="text-xl font-headline font-bold text-white text-center mb-2">Profil Tim Belum Lengkap</h3>
            <p className="text-white/40 text-sm text-center mb-8">
              Anda perlu melengkapi profil tim terlebih dahulu sebelum dapat melakukan pendaftaran pit.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/team/order-boarding"
                className="w-full py-4 bg-[#b80014] hover:bg-[#e21b23] text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-[#b80014]/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                Lengkapi Data Tim Sekarang
              </Link>
              <button
                onClick={() => setShowTeamWarning(false)}
                className="w-full py-3 text-white/30 hover:text-white text-xs font-semibold transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-8 bg-white/5 border border-white/8 rounded-2xl p-1.5">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "catalog"
              ? "bg-[#b80014] text-white shadow-lg shadow-[#b80014]/20"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">garage</span>
          Pesan Kelas Balap / Pit
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "orders"
              ? "bg-[#b80014] text-white shadow-lg shadow-[#b80014]/20"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
          Pesanan Saya
          {orders.length > 0 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === "orders"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab: Pesan Kelas Balap / Pit ─────────────────────────────── */}
      {activeTab === "catalog" && (
        <>
          {/* CTA Banner */}
          <div className="mb-6 px-5 py-4 bg-white/5 border border-white/8 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold text-sm">Daftar via Panduan Langkah-Demi-Langkah</p>
              <p className="text-white/40 text-xs mt-0.5">Ikuti proses pendaftaran yang dipandu dari awal hingga pembayaran.</p>
            </div>
            <Link
              href="/dashboard/team/order-boarding"
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-[#b80014] hover:bg-[#e21b23] text-white rounded-xl transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              Mulai
            </Link>
          </div>

          {catalog.length === 0 ? (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-white/15 text-[48px] mb-4 block">
                event_busy
              </span>
              <p className="text-white/40 text-sm">Belum ada race pit yang tersedia saat ini.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {catalog.map((classGroup) => (
                <div key={classGroup.classId}>
                  {/* Race Class Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-6 bg-[#b80014] rounded-full" />
                    <h3 className="text-xl font-headline font-bold text-white">
                      {classGroup.className}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {classGroup.categories.map((catGroup) => (
                      <div key={catGroup.categoryId}>
                        {/* Race Category Sub-header */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-white/30 text-[16px]">
                            subdirectory_arrow_right
                          </span>
                          <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide">
                            {catGroup.categoryName}
                          </h4>
                          <div className="flex-1 h-px bg-white/8 ml-2" />
                        </div>

                        {/* Race Pits Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-5">
                          {catGroup.pits.map((pit) => (
                            <PitCard
                              key={pit.id}
                              pit={pit}
                              ownedCount={pitOwnedCounts.get(pit.id) || 0}
                              onOrder={handleOrder}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Tab: Pesanan Saya ─────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-headline font-bold text-white">Pesanan Saya</h2>
              <p className="text-white/40 text-xs mt-0.5">
                {orders.length} pit yang sudah didaftarkan
              </p>
            </div>
            <button
              onClick={() => setActiveTab("catalog")}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#b80014]/10 hover:bg-[#b80014]/20 text-[#b80014] border border-[#b80014]/20 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Tambah Pesanan
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-white/15 text-[40px] mb-3 block">
                confirmation_number
              </span>
              <p className="text-white/40 text-sm">Belum ada pit yang didaftarkan.</p>
              <p className="text-white/25 text-xs mt-1">
                Pilih pit dari tab "Pesan Kelas Balap / Pit" untuk mulai mendaftar.
              </p>
              <button
                onClick={() => setActiveTab("catalog")}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                Pesan Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {orders.map((order) => (
                <OrderTicketCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
