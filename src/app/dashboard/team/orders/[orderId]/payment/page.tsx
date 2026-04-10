"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrder, uploadProofPayment, subscribeOrder, type Order } from "@/lib/api/orders";
import { getPaymentOptions, paymentFileUrl, createFlipPaymentLink, type PaymentMethod } from "@/lib/api/payment";
import { statusBadge, formatCurrency } from "@/lib/orderUtils";

type PaymentType = "automatic" | "manual";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Flow State
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Action State
  const [creatingLink, setCreatingLink] = useState(false);
  const [error, setError] = useState("");

  // Manual Upload State
  const proofRef = useRef<HTMLInputElement>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedOk, setUploadedOk] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const init = async () => {
      const [data, methods] = await Promise.all([
        getOrder(orderId).catch(() => null),
        getPaymentOptions().catch(() => []),
      ]);

      if (!data) {
        router.replace("/dashboard/team/katalog-pit");
        return;
      }
      if (data.status === "paid") {
        router.replace(`/dashboard/team/orders/${orderId}`);
        return;
      }

      setOrder(data);
      setPaymentMethods(methods);
      setLoading(false);

      if (data.proof_payment) {
        setUploadedOk(true);
        setPaymentType("manual");
      }

      unsub = subscribeOrder(orderId, (updated) => {
        setOrder(updated);
        if (updated.status === "paid") {
          router.replace(`/dashboard/team/orders/${orderId}`);
        }
      });
    };
    init();
    return () => unsub?.();
  }, [orderId]);

  const handleSelectAutomatic = async () => {
    setCreatingLink(true);
    setError("");
    try {
      const resp = await createFlipPaymentLink(orderId);
      window.location.href = resp.payment_url;
    } catch (err: any) {
      setError(err?.message ?? "Gagal membuat link pembayaran otomatis.");
      setCreatingLink(false);
    }
  };

  const handleUploadProof = async () => {
    const file = proofRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadProofPayment(orderId, file, selectedMethod?.bank_name);
      setUploadedOk(true);
    } catch (err: any) {
      setError(err?.response?.message ?? "Upload gagal. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const pit = order.expand?.race_pit;
  const raceCat = pit?.expand?.race_category;
  const raceClass = raceCat?.expand?.race_class;
  const status = statusBadge(order);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/dashboard/team/orders/${orderId}`}
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Pembayaran</h1>
          {(raceClass || raceCat || pit) && (
            <div className="flex items-center gap-1 text-[11px] text-white/30 mt-0.5">
              {raceClass && <span>{raceClass.name}</span>}
              {raceClass && <span className="material-symbols-outlined text-[10px]">chevron_right</span>}
              {raceCat && <span>{raceCat.name}</span>}
              {raceCat && <span className="material-symbols-outlined text-[10px]">chevron_right</span>}
              {pit && <span className="text-white/60">{pit.name}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white/5 border border-white/8 rounded-3xl p-6 mb-8 hover:bg-white/[0.07] transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-lg">{pit?.name ?? "Race Pit"}</p>
            <p className="text-white/30 text-xs font-mono mt-0.5 tracking-wider">{order.code}</p>
          </div>
          <div className="text-right">
            <p className="text-[#b80014] font-bold text-2xl">
              {order.bill_price > 0 ? formatCurrency(order.bill_price) : "Gratis"}
            </p>
            <span className={`inline-block mt-2 text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest font-bold ${status.cls}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </p>
        </div>
      )}

      {/* ── Selection Screen ──────────────────────────────────────────────── */}
      {!paymentType && (
        <div className="grid grid-cols-1 gap-4">
          <p className="text-white/50 text-sm font-medium mb-1 pl-1">Pilih Metode Pembayaran:</p>
          
          <button
            onClick={handleSelectAutomatic}
            disabled={creatingLink}
            className="group relative flex items-center gap-5 p-6 bg-white/5 border border-white/10 hover:border-[#b80014]/40 rounded-3xl text-left transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#b80014]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              {creatingLink ? (
                <span className="w-6 h-6 border-2 border-[#b80014]/30 border-t-[#b80014] rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[#b80014] text-[32px]">bolt</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold">Otomatis (Instant)</p>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#b80014]/20 text-[#b80014] rounded font-black uppercase tracking-tighter">Fast</span>
              </div>
              <p className="text-white/40 text-xs mt-1">Konfirmasi instan via Flip (Virtual Account, E-Wallet, etc)</p>
            </div>
            <span className="material-symbols-outlined text-white/20 group-hover:text-white/60 transition-colors">chevron_right</span>
          </button>

          <button
            onClick={() => setPaymentType("manual")}
            className="group relative flex items-center gap-5 p-6 bg-white/5 border border-white/10 hover:border-white/30 rounded-3xl text-left transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white/40 text-[32px]">payments</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">Manual Transfer</p>
              <p className="text-white/40 text-xs mt-1">Transfer Bank/QRIS & Upload bukti transfer (Cek manual 1x24h)</p>
            </div>
            <span className="material-symbols-outlined text-white/20 group-hover:text-white/60 transition-colors">chevron_right</span>
          </button>
        </div>
      )}

      {/* ── Manual Flow ──────────────────────────────────────────────────── */}
      {paymentType === "manual" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pl-1">
            <button
              onClick={() => { setPaymentType(null); setSelectedMethod(null); }}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Ganti Metode Pembayaran
            </button>
          </div>

          {uploadedOk ? (
            <div className="bg-green-500/8 border border-green-500/20 rounded-3xl p-10 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-green-400 text-[48px]">verified</span>
              </div>
              <p className="text-white font-bold text-xl mb-2">Bukti Berhasil Dikirim!</p>
              <p className="text-white/40 text-sm px-4">
                Panitia akan memverifikasi pembayaran Anda dalam waktu 1×24 jam. Tiket akan otomatis terbit jika sudah disetujui.
              </p>
              <Link
                href={`/dashboard/team/orders/${orderId}`}
                className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-2xl border border-white/10 transition-all"
              >
                Kembali ke Detail Order
              </Link>
            </div>
          ) : !selectedMethod ? (
            /* Choose Manual Method */
            <div className="grid grid-cols-1 gap-3">
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Tujuan Transfer:</p>
              {paymentMethods.length === 0 ? (
                <div className="bg-white/5 border border-white/8 rounded-2xl p-10 text-center">
                  <p className="text-white/40 text-sm">Belum ada rekening tujuan tersedia.</p>
                </div>
              ) : (
                paymentMethods.map((method) => {
                  const logoUrl = paymentFileUrl(method, "bank_logo");
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      className="group flex items-center gap-4 p-5 bg-white/5 border border-white/10 hover:border-[#b80014]/30 rounded-2xl text-left transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoUrl ? (
                          <img src={logoUrl} alt={method.bank_name} className="w-full h-full object-contain p-1.5" />
                        ) : (
                          <span className="material-symbols-outlined text-white/30 text-[20px]">
                            {method.is_qris ? "qr_code_2" : "account_balance"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm tracking-wide">{method.bank_name}</p>
                        <p className="text-white/40 text-xs mt-0.5">{method.is_qris ? "Instant QRIS" : method.account_number}</p>
                      </div>
                      <span className="material-symbols-outlined text-white/15 group-hover:text-white/50 text-[18px] transition-colors">arrow_forward</span>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            /* Show Transfer Details + Upload */
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-[#1c1e1f] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#b80014]/5 blur-[60px] rounded-full -mr-10 -mt-10" />
                <div className="flex items-center gap-4 mb-6">
                  {(() => {
                    const logoUrl = paymentFileUrl(selectedMethod, "bank_logo");
                    return (
                      <div className="w-12 h-12 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain p-2" /> : <span className="material-symbols-outlined text-white/20">payments</span>}
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-white font-bold uppercase tracking-wider">{selectedMethod.bank_name}</p>
                    <p className="text-white/40 text-xs uppercase tracking-tighter">Manual Transfer Instruction</p>
                  </div>
                </div>

                {selectedMethod.is_qris ? (
                  <div className="text-center py-4 bg-white rounded-2xl p-4 mx-auto w-fit mb-4 border-4 border-[#b80014]/10 shadow-xl">
                    {(() => {
                      const qrisUrl = paymentFileUrl(selectedMethod, "qris_image");
                      return qrisUrl ? <img src={qrisUrl} className="w-48 h-48 object-contain" /> : <div className="w-48 h-48 bg-gray-100 flex items-center justify-center"><span className="material-symbols-outlined text-gray-300">qr_code_2</span></div>;
                    })()}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                      <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.2em] mb-2">No. Rekening</p>
                      <div className="flex items-center justify-between">
                        <p className="text-white font-mono text-2xl font-black">{selectedMethod.account_number}</p>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(selectedMethod.account_number); }}
                          className="p-2 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all outline-none"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                      </div>
                      <p className="text-white/60 text-sm mt-1.5 font-medium">a/n {selectedMethod.account_name}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Total Bayar</p>
                  <p className="text-white font-black text-2xl">{formatCurrency(order.bill_price)}</p>
                </div>
              </div>

              {/* Upload Component */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <p className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#b80014] text-[18px]">cloud_upload</span>
                  Upload Bukti Pembayaran
                </p>
                <input ref={proofRef} type="file" accept="image/*,application/pdf" className="hidden" id="proof-upload" onChange={(e) => { const f = e.target.files?.[0]; if (f) setProofPreview(URL.createObjectURL(f)); }} />
                <label
                  htmlFor="proof-upload"
                  className="block w-full py-12 border-2 border-dashed border-white/5 hover:border-[#b80014]/40 rounded-2xl cursor-pointer text-center group transition-all"
                >
                  {proofPreview ? (
                    <img src={proofPreview} className="max-h-48 rounded-xl mx-auto shadow-2xl" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#b80014]/10 transition-colors">
                        <span className="material-symbols-outlined text-white/20 group-hover:text-[#b80014] transition-colors">upload</span>
                      </div>
                      <span className="text-white/30 text-xs font-semibold">Tarik file atau klik untuk telusuri</span>
                    </div>
                  )}
                </label>

                <button
                  onClick={handleUploadProof}
                  disabled={!proofPreview || uploading}
                  className="w-full mt-6 py-4 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-50 disabled:grayscale text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-[#b80014]/20 flex items-center justify-center gap-2"
                >
                  {uploading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[18px]">task_alt</span>}
                  {uploading ? "Mengirim..." : "Kirim Bukti Manual"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
