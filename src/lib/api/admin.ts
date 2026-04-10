import pb, { COLLECTIONS } from "@/lib/pb";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8090";

// ── Admin / Race Manager API helpers ─────────────────

/** Get ALL orders (Race Manager + Admin view) */
export async function getAllOrders(filter?: string) {
  return pb.collection(COLLECTIONS.ORDER).getFullList({
    filter: filter ?? "",
    sort: "-created",
    expand: "user,race_pit,race_pit.race_category,team",
  });
}

/** Get orders paginated for the RM dashboard */
export async function getOrdersPage(page: number, perPage = 20, filter = "") {
  return pb.collection(COLLECTIONS.ORDER).getList(page, perPage, {
    filter,
    sort: "-created",
    expand: "user,race_pit,race_pit.race_category,team",
  });
}

/** Approve manual payment → set status = paid */
export async function approveManualPayment(orderId: string): Promise<void> {
  await pb.collection(COLLECTIONS.ORDER).update(orderId, { status: "paid" });
}

/** Reject/cancel an order */
export async function rejectOrder(orderId: string): Promise<void> {
  await pb.collection(COLLECTIONS.ORDER).update(orderId, { status: "canceled" });
}

/** Get ALL change requests (pending only) */
export async function getPendingChangeRequests() {
  return pb.collection("change_request").getFullList({
    filter: 'status = "pending"',
    sort: "-created",
    expand: "order,order.race_pit,requested_by",
  });
}

/** Approve a change request → RM unlocks the order */
export async function approveChangeRequest(crId: string, orderId: string, note = ""): Promise<void> {
  // update change_request status
  await pb.collection("change_request").update(crId, {
    status: "approved",
    review_note: note,
    reviewed_by: pb.authStore.record?.id,
    reviewed_at: new Date().toISOString(),
  });
  // unlock the order
  await pb.collection(COLLECTIONS.ORDER).update(orderId, {
    is_locked: false,
    unlock_requested: false,
  });
}

/** Reject a change request */
export async function rejectChangeRequest(crId: string, note = ""): Promise<void> {
  await pb.collection("change_request").update(crId, {
    status: "rejected",
    review_note: note,
    reviewed_by: pb.authStore.record?.id,
    reviewed_at: new Date().toISOString(),
  });
  // clear unlock_requested flag
  const cr = await pb.collection("change_request").getOne(crId);
  if (cr.order) {
    await pb.collection(COLLECTIONS.ORDER).update(cr.order as string, { unlock_requested: false });
  }
}

/** Get all locked orders for RM participant list */
export async function getLockedOrders() {
  return pb.collection(COLLECTIONS.ORDER).getFullList({
    filter: 'is_locked = true && status = "paid"',
    sort: "-updated",
    expand: "user,race_pit,race_pit.race_category,race_pit.race_category.race_class,team",
  });
}

/** Admin stats */
export async function getAdminStats() {
  const [users, orders, teams, racers] = await Promise.all([
    pb.collection(COLLECTIONS.USERS).getList(1, 1),
    pb.collection(COLLECTIONS.ORDER).getList(1, 1),
    pb.collection(COLLECTIONS.TEAM).getList(1, 1),
    pb.collection(COLLECTIONS.RACER).getList(1, 1),
  ]);
  const [paid, pending, locked] = await Promise.all([
    pb.collection(COLLECTIONS.ORDER).getList(1, 1, { filter: 'status = "paid"' }),
    pb.collection(COLLECTIONS.ORDER).getList(1, 1, { filter: 'status = "waiting"' }),
    pb.collection(COLLECTIONS.ORDER).getList(1, 1, { filter: "is_locked = true" }),
  ]);
  return {
    totalUsers: users.totalItems,
    totalOrders: orders.totalItems,
    totalTeams: teams.totalItems,
    totalRacers: racers.totalItems,
    paidOrders: paid.totalItems,
    pendingOrders: pending.totalItems,
    lockedOrders: locked.totalItems,
  };
}

/** Download team export from Go backend */
export async function downloadTeamExport(teamId: string, format: "excel" | "pdf" = "excel"): Promise<Blob> {
  const res = await fetch(`${PB_URL}/api/export/team/${teamId}?format=${format}`, {
    headers: { Authorization: `Bearer ${pb.authStore.token}` },
  });
  if (!res.ok) throw new Error("Export gagal");
  return res.blob();
}
