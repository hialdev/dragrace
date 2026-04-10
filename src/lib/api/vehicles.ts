import pb, { COLLECTIONS } from "@/lib/pb";

function buildVehicleFd(data: Record<string, any>) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === "") return;
    if (k === "image") {
      if (v instanceof File) fd.append("image", v);
    } else {
      fd.append(k, v as string);
    }
  });
  return fd;
}

export async function getVehicles(teamId: string) {
  return pb
    .collection(COLLECTIONS.VEHICLE)
    .getFullList({ filter: `team = "${teamId}"`, sort: "-created" });
}

export async function getVehicle(id: string) {
  return pb.collection(COLLECTIONS.VEHICLE).getOne(id);
}

export async function createVehicle(teamId: string, data: Record<string, any>) {
  const fd = buildVehicleFd(data);
  fd.append("team", teamId);
  return pb.collection(COLLECTIONS.VEHICLE).create(fd);
}

export async function updateVehicle(id: string, data: Record<string, any>) {
  const fd = buildVehicleFd(data);
  return pb.collection(COLLECTIONS.VEHICLE).update(id, fd);
}

export async function deleteVehicle(id: string) {
  return pb.collection(COLLECTIONS.VEHICLE).delete(id);
}

export function vehicleImageUrl(record: any): string | null {
  const filename = record?.image;
  if (!filename) return null;
  return pb.files.getURL(record, filename);
}
