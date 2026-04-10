export type OrderStatus = "waiting" | "paid" | "canceled";

export function statusBadge(order: { status: OrderStatus; is_manual_payment?: boolean; proof_payment?: string }) {
  if (order.status === "waiting" && order.is_manual_payment && order.proof_payment) {
    return {
      label: "Menunggu Validasi",
      cls: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    };
  }

  const map: Record<OrderStatus, { label: string; cls: string }> = {
    waiting: { label: "Menunggu Pembayaran", cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" },
    paid:    { label: "Lunas", cls: "bg-green-500/15 text-green-400 border border-green-500/20" },
    canceled: { label: "Dibatalkan", cls: "bg-red-500/10 text-red-400 border border-red-500/20" },
  };
  return map[order.status] ?? map.waiting;
}

export function lockBadge(isLocked: boolean, unlockReq: boolean) {
  if (unlockReq) return { label: "Menunggu Buka Kunci", cls: "bg-orange-500/15 text-orange-400 border border-orange-500/20" };
  if (isLocked) return { label: "Terkunci", cls: "bg-blue-500/15 text-blue-400 border border-blue-500/20" };
  return { label: "Terbuka", cls: "bg-white/8 text-white/40 border border-white/10" };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}
