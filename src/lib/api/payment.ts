import pb, { COLLECTIONS } from "@/lib/pb";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8090";

export interface PaymentMethod {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_logo: string;
  is_qris: boolean;
  qris_image: string;
  is_active: boolean;
}

/** Get active payment methods from payments collection */
export async function getPaymentOptions(): Promise<PaymentMethod[]> {
  return pb.collection(COLLECTIONS.PAYMENTS).getFullList({
    filter: "is_active = true",
    sort: "bank_name",
  }) as Promise<PaymentMethod[]>;
}

/** Get file URL for a payment method (bank_logo or qris_image) */
export function paymentFileUrl(record: PaymentMethod, field: "bank_logo" | "qris_image"): string | null {
  const filename = record?.[field];
  if (!filename) return null;
  return pb.files.getURL(record as any, filename);
}

/** Call Go backend to create a Flip payment link for an order */
export async function createFlipPaymentLink(orderId: string): Promise<{ payment_url: string; link_id: string; expired_at: string }> {
  const res = await fetch(`${PB_URL}/api/payment/create-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pb.authStore.token}`,
    },
    body: JSON.stringify({ order_id: orderId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal membuat link pembayaran");
  }

  return res.json();
}
