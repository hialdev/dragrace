import pb, { COLLECTIONS } from "@/lib/pb";

export interface Order {
  id: string;
  code: string;
  race_pit: string;
  user: string;
  bill_price: number;
  status: "waiting" | "paid" | "canceled";
  is_manual_payment: boolean;
  proof_payment: string;
  is_locked: boolean;
  unlock_requested: boolean;
  payment_link_url: string;
  payment_ref: string;
  payment_expired_at: string;
  created: string;
  updated: string;
  expand?: {
    race_pit?: {
      id: string;
      name: string;
      price: number;
      description?: string;
      cover?: string;
      race_category?: string;
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
    };
  };
}

export async function getMyOrders(): Promise<Order[]> {
  const userId = pb.authStore.record?.id;
  if (!userId) return [];
  return pb.collection(COLLECTIONS.ORDER).getFullList({
    filter: `user = "${userId}"`,
    sort: "-created",
    expand: "race_pit,race_pit.race_category,race_pit.race_category.race_class",
  }) as Promise<Order[]>;
}

/** Get my orders with racer assignments embedded */
export async function getMyOrdersWithAssignments(): Promise<(Order & { assignments?: any[] })[]> {
  const userId = pb.authStore.record?.id;
  if (!userId) return [];
  const res = await pb.collection(COLLECTIONS.ORDER).getList(1, 500, {
    filter: `user = "${userId}"`,
    sort: "-created",
    expand: "race_pit,race_pit.race_category,race_pit.race_category.race_class,team",
  }) as { items: Order[] };

  // Fetch assignments for all orders in parallel
  const withAssignments = await Promise.all(
    res.items.map(async (order) => {
      const assignments = await pb
        .collection("order_racer_assignment")
        .getFullList({
          filter: `order = "${order.id}"`,
          expand: "racer,vehicle",
        })
        .catch(() => []);
      return { ...order, assignments };
    })
  );
  return withAssignments;
}

export async function getOrder(id: string): Promise<Order> {
  return pb.collection(COLLECTIONS.ORDER).getOne(id, {
    expand: "user,race_pit,race_pit.race_category,race_pit.race_category.race_class,team",
  }) as Promise<Order>;
}

export async function createOrder(racePitId: string, racerId?: string, vehicleId?: string): Promise<Order> {
  const userId = pb.authStore.record?.id!;
  
  // Fetch pit price first
  const pit = await pb.collection(COLLECTIONS.RACE_PIT).getOne(racePitId);
  const price = pit.price || 0;

  const code = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const order = await pb.collection(COLLECTIONS.ORDER).create({
    code,
    race_pit: racePitId,
    user: userId,
    status: "waiting",
    is_locked: false,
    unlock_requested: false,
    is_manual_payment: false,
    bill_price: price,
  }) as Order;

  // If racer and vehicle are provided, create assignment automatically
  if (racerId && vehicleId) {
    await pb.collection(COLLECTIONS.ORDER_RACER_ASSIGNMENT).create({
      order: order.id,
      racer: racerId,
      vehicle: vehicleId,
    });
  }

  return order;
}

export async function cancelOrder(id: string): Promise<void> {
  await pb.collection(COLLECTIONS.ORDER).update(id, { status: "canceled" });
}

export async function uploadProofPayment(id: string, file: File, paymentMethod?: string): Promise<Order> {
  const fd = new FormData();
  fd.append("proof_payment", file);
  fd.append("is_manual_payment", "true");
  if (paymentMethod) fd.append("payment_method", paymentMethod);
  return pb.collection(COLLECTIONS.ORDER).update(id, fd) as Promise<Order>;
}

export async function lockOrder(id: string): Promise<Order> {
  return pb.collection(COLLECTIONS.ORDER).update(id, { is_locked: true }) as Promise<Order>;
}

export async function requestUnlock(orderId: string, reason: string): Promise<void> {
  const userId = pb.authStore.record?.id!;
  await pb.collection("change_request").create({
    order: orderId,
    requested_by: userId,
    reason,
    status: "pending",
  });
  await pb.collection(COLLECTIONS.ORDER).update(orderId, { unlock_requested: true });
}

/** Subscribe to order changes for realtime SSE updates */
export function subscribeOrder(orderId: string, callback: (order: Order) => void) {
  pb.collection(COLLECTIONS.ORDER).subscribe(orderId, (e) => {
    if (e.action === "update") {
      callback(e.record as unknown as Order);
    }
  });
  return () => pb.collection(COLLECTIONS.ORDER).unsubscribe(orderId);
}

/** Get available race pits with full hierarchy expand */
export async function getAvailablePits() {
  return pb.collection(COLLECTIONS.RACE_PIT).getFullList({
    sort: "name",
    expand: "race_category,race_category.race_class",
  });
}
