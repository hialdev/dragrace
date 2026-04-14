import pb from "@/lib/pb";

// ── Generic CRUD helpers for Content Dashboard ──

export async function getAdminList(collectionName: string, queryParams?: Record<string, any>) {
  return pb.collection(collectionName).getFullList(queryParams);
}

export async function getAdminRecord(collectionName: string, id: string, queryParams?: Record<string, any>) {
  return pb.collection(collectionName).getOne(id, queryParams);
}

export async function createAdminRecord(collectionName: string, data: any | FormData) {
  return pb.collection(collectionName).create(data);
}

export async function updateAdminRecord(collectionName: string, id: string, data: any | FormData) {
  return pb.collection(collectionName).update(id, data);
}

export async function deleteAdminRecord(collectionName: string, id: string) {
  return pb.collection(collectionName).delete(id);
}

export function getFileUrl(record: any, filename: string) {
  if (!record || !filename) return "";
  return pb.files.getURL(record, filename);
}
