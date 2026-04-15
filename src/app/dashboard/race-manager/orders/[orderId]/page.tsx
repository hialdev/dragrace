"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pb";
import { COLLECTIONS } from "@/lib/pb";
import { approveManualPayment, rejectOrder } from "@/lib/api/admin";
import { getAssignments, type Assignment } from "@/lib/api/assignments";
import { statusBadge, lockBadge, formatCurrency } from "@/lib/orderUtils";
import { downloadTeamExport } from "@/lib/api/admin";

function ActionBtn({ onClick, icon, label, variant, disabled }: {
  onClick: () => void; icon: string; label: string;
  variant: "green" | "red" | "default";
  disabled?: boolean;
}) {
  const cls = {
    green: "bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400 font-bold uppercase tracking-widest",
    red:   "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 font-bold uppercase tracking-widest",
    default: "bg-white/5 hover:bg-white/10 border-white/10 text-white/60",
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-2 px-6 py-3.5 border rounded-2xl text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale ${cls}`}>
      <span className="material-symbols-outlined text-[20px]">{icon}</span>{label}
    </button>
  );
}

function DetailSection({ title, children, icon }: { title: string; children: React.ReactNode; icon: string }) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-3xl p-6 mb-4 hover:border-white/15 transition-all">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-white/40 text-[18px]">{icon}</span>
        </div>
        <h2 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function RMOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [done, setDone] = useState("");

  useEffect(() => {
    const init = async () => {
      const data = await pb.collection(COLLECTIONS.ORDER).getOne(orderId, {
        expand: "user,race_pit,race_pit.race_category.race_class,team",
      }).catch(() => null);
      if (!data) { router.replace("/dashboard/race-manager/orders"); return; }
      setOrder(data);
      const assigns = await getAssignments(orderId).catch(() => []);
      setAssignments(assigns);
      setLoading(false);
    };
    init();
  }, [orderId]);

  const handleApprove = async () => {
    if (!confirm("Konfirmasi verifikasi pembayaran ini?")) return;
    setActing(true);
    try {
      await approveManualPayment(orderId);
      setOrder((prev: any) => ({ ...prev, status: "paid" }));
      setDone("Pembayaran berhasil diverifikasi ✓");
    } catch { alert("Gagal verifikasi."); }
    finally { setActing(false); }
  };

  const handleReject = async () => {
    if (!confirm("Batalkan order ini? Tindakan tidak bisa dibatalkan.")) return;
    setActing(true);
    try {
      await rejectOrder(orderId);
      setOrder((prev: any) => ({ ...prev, status: "canceled" }));
      setDone("Order dibatalkan.");
    } catch { alert("Gagal membatalkan."); }
    finally { setActing(false); }
  };

  const handleExport = () => {
    window.print();
  };

  if (loading || !order) {
    return <div className="flex items-center justify-center h-64"><span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  const status = statusBadge(order);
  const lock = lockBadge(order.is_locked, order.unlock_requested);
  const user = order.expand?.user;
  const team = order.expand?.team;
  const pit = order.expand?.race_pit;
  const raceCat = pit?.expand?.race_category;
  const raceClass = raceCat?.expand?.race_class;
  const proofUrl = order.proof_payment ? pb.files.getURL(order, order.proof_payment) : null;
  const teamLogo = team?.logo ? pb.files.getURL(team, team.logo) : null;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-8 print:hidden">
        <Link href="/dashboard/race-manager/orders"
          className="p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-white/5">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight">Detail Pendaftaran</h1>
          <p className="text-white/30 text-[11px] font-mono mt-1 uppercase tracking-[0.2em]">{order.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* 1. Team Detail */}
          <DetailSection title="Data Tim" icon="groups">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {teamLogo ? (
                  <img src={teamLogo} alt={team?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-white/15 text-[40px]">groups</span>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-white uppercase tracking-tight">{team?.name ?? "—"}</p>
                <p className="text-white/40 text-xs mt-1">ID Tim: {team?.id ?? "—"}</p>
              </div>
            </div>
          </DetailSection>

          {/* 2. Pemesan Detail */}
          <DetailSection title="Detail Pemesan" icon="person">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                ["Nama Lengkap", user?.full_name],
                ["Alamat Email", user?.email],
                ["Nomor Telepon", user?.phone],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-1">{l}</p>
                  <p className="text-white font-medium">{v ?? "—"}</p>
                </div>
              ))}
            </div>
          </DetailSection>

          {/* 3. Pit Detail */}
          <DetailSection title="Pit Yang Dipilih" icon="garage">
            <div className="bg-[#1c1e1f] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 text-[10px] text-white/30 mb-2 font-black uppercase tracking-[0.1em]">
                <span>{raceClass?.name ?? "—"}</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-white/60">{raceCat?.name ?? "—"}</span>
              </div>
              <p className="text-xl font-bold text-white mb-4">{pit?.name ?? "—"}</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <p className="text-white/40 text-xs font-bold">Billing Amount</p>
                <p className="text-[#b80014] text-xl font-black">{formatCurrency(order.bill_price)}</p>
              </div>
            </div>
          </DetailSection>

          {/* 4. Racer List */}
          {assignments.length > 0 && (
            <DetailSection title={`Daftar Racer (${assignments.length})`} icon="format_list_bulleted">
              <div className="space-y-3">
                {assignments.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                    <span className="text-white/20 text-xs font-mono">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm tracking-wide">{a.expand?.racer?.name ?? "—"}</p>
                      <p className="text-white/40 text-xs uppercase tracking-tighter mt-0.5">
                        {a.expand?.vehicle ? `${a.expand.vehicle.brand} ${a.expand.vehicle.model}` : "Tanpa kendaraan"}
                        {a.expand?.race_class ? ` · ${a.expand.race_class.name}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}
        </div>

        {/* Right Column: Status & Payment */}
        <div className="space-y-4">
          {/* Status Box */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sticky top-8">
            <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.2em] mb-4">Ringkasan Status</p>
            
            <div className="space-y-4 mb-8">
              <div className={`p-4 rounded-2xl text-center border ${status.cls}`}>
                <p className="text-[10px] uppercase font-black opacity-60 mb-1">Status Pembayaran</p>
                <p className="text-sm font-bold">{status.label}</p>
              </div>
              <div className={`p-4 rounded-2xl text-center border ${lock.cls}`}>
                <p className="text-[10px] uppercase font-black opacity-60 mb-1">Status Registrasi</p>
                <p className="text-sm font-bold">{lock.label}</p>
              </div>
            </div>

            {/* Transfer Details */}
            {order.is_manual_payment && (
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-6">
                <p className="text-white/30 text-[10px] uppercase font-bold mb-3">Metode Transfer</p>
                <p className="text-white font-bold">{order.payment_method || "Manual (Bank Tidak Disebut)"}</p>
                
                {proofUrl ? (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-white/30 text-[10px] uppercase font-bold mb-3">Bukti Pembayaran</p>
                    <a href={proofUrl} target="_blank" rel="noopener noreferrer"
                      className="group block w-full aspect-[3/4] rounded-xl bg-black/40 overflow-hidden relative border border-white/5 print:aspect-auto print:h-auto">
                      <img src={proofUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-all print:opacity-100 print:relative" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center print:hidden">
                        <span className="material-symbols-outlined text-white text-[32px] mb-1">zoom_in</span>
                        <span className="text-white/70 text-[10px] font-bold uppercase">Lihat Bukti</span>
                      </div>
                    </a>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-xl bg-white/5 text-center text-white/30 italic text-xs">
                    Bukti belum diupload
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 print:hidden">
              {order.status === "waiting" && proofUrl && (
                <ActionBtn onClick={handleApprove} icon="task_alt" label="Verifikasi Lunas" variant="green" disabled={acting} />
              )}
              {order.status !== "canceled" && (
                <ActionBtn onClick={handleReject} icon="block" label="Batalkan Order" variant="red" disabled={acting} />
              )}
              <ActionBtn onClick={handleExport} icon="picture_as_pdf" label="Export PDF" variant="default" />
            </div>

            {done && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <p className="text-xs text-green-400 font-bold">{done}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
