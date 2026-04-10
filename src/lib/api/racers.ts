import pb, { COLLECTIONS } from "@/lib/pb";

function buildRacerFd(data: Record<string, any>) {
  const fd = new FormData();
  const fileFields = ["photo", "kta", "sim", "kis"];
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === "") return;
    if (fileFields.includes(k)) {
      if (v instanceof File) fd.append(k, v);
      // if string (existing URL) → skip, PB keeps existing file
    } else {
      fd.append(k, v as string);
    }
  });
  return fd;
}

export async function getRacers(teamId: string) {
  return pb
    .collection(COLLECTIONS.RACER)
    .getFullList({ filter: `team = "${teamId}"`, sort: "-created" });
}

export async function getRacer(id: string) {
  return pb.collection(COLLECTIONS.RACER).getOne(id);
}

export async function createRacer(teamId: string, data: Record<string, any>) {
  const fd = buildRacerFd(data);
  fd.append("team", teamId);
  return pb.collection(COLLECTIONS.RACER).create(fd);
}

export async function updateRacer(id: string, data: Record<string, any>) {
  const fd = buildRacerFd(data);
  return pb.collection(COLLECTIONS.RACER).update(id, fd);
}

export async function deleteRacer(id: string) {
  return pb.collection(COLLECTIONS.RACER).delete(id);
}

/** Build PocketBase file URL for a racer's file field */
export function racerFileUrl(record: any, field: string): string | null {
  const filename = record?.[field];
  if (!filename) return null;
  return pb.files.getURL(record, filename);
}
