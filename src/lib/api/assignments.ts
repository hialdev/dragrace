import pb, { COLLECTIONS } from "@/lib/pb";

export interface Assignment {
  id: string;
  order: string;
  racer: string;
  vehicle?: string;
  race_class?: string;
  notes?: string;
  expand?: {
    racer?: any;
    vehicle?: any;
    race_class?: any;
  };
}

export async function getAssignments(orderId: string): Promise<Assignment[]> {
  return pb.collection(COLLECTIONS.ORDER_RACER_ASSIGNMENT).getFullList({
    filter: `order = "${orderId}"`,
    expand: "racer,vehicle,race_class",
    sort: "created",
  }) as Promise<Assignment[]>;
}

export async function createAssignment(
  orderId: string,
  racerId: string,
  vehicleId?: string,
  raceClassId?: string,
  notes?: string
): Promise<Assignment> {
  return pb.collection(COLLECTIONS.ORDER_RACER_ASSIGNMENT).create({
    order: orderId,
    racer: racerId,
    ...(vehicleId ? { vehicle: vehicleId } : {}),
    ...(raceClassId ? { race_class: raceClassId } : {}),
    ...(notes ? { notes } : {}),
  }) as Promise<Assignment>;
}

export async function deleteAssignment(id: string): Promise<void> {
  await pb.collection(COLLECTIONS.ORDER_RACER_ASSIGNMENT).delete(id);
}

export async function getChangeRequests(orderId: string) {
  return pb.collection("change_request").getFullList({
    filter: `order = "${orderId}"`,
    sort: "-created",
    expand: "requested_by,reviewed_by",
  });
}
