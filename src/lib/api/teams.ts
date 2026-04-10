import pb, { COLLECTIONS } from "@/lib/pb";

/** Get current user's team (or null) */
export async function getMyTeam() {
  const userId = pb.authStore.record?.id;
  if (!userId) return null;
  try {
    const res = await pb.collection(COLLECTIONS.TEAM).getFirstListItem(
      `user = "${userId}"`,
      { expand: "race_class" }
    );
    return res;
  } catch {
    return null;
  }
}

/** Create a new team using FormData (supports logo file upload) */
export async function createTeam(data: Record<string, any>, logo?: File) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== "") fd.append(k, v as string);
  });
  fd.append("user", pb.authStore.record!.id);
  if (logo) fd.append("logo", logo);
  return pb.collection(COLLECTIONS.TEAM).create(fd);
}

/** Update existing team */
export async function updateTeam(teamId: string, data: Record<string, any>, logo?: File) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined) fd.append(k, v as string);
  });
  if (logo) fd.append("logo", logo);
  return pb.collection(COLLECTIONS.TEAM).update(teamId, fd);
}

/** Get race classes list for dropdown */
export async function getRaceClasses() {
  return pb.collection(COLLECTIONS.RACE_CLASSES).getFullList({ sort: "name" });
}
