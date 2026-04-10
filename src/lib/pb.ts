import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8090";

// Singleton client — reused across the app
const pb = new PocketBase(PB_URL);

// Auto-refresh token when close to expiry
pb.autoCancellation(false);

export default pb;

// Collection name constants to avoid typos
export const COLLECTIONS = {
   USERS: "users",
   TEAM: "team",
   RACER: "racer",
   VEHICLE: "vehicle",
   ORDER: "order",
   ORDER_RACER_ASSIGNMENT: "order_racer_assignment",
   CHANGE_REQUEST: "change_request",
   RACE_PIT: "race_pit",
   RACE_CATEGORY: "race_category",
   RACE_CLASSES: "race_class",
   PAYMENTS: "payments",
} as const;

// Role constants
export const ROLES = {
   TEAM_MANAGER: "team_manager",
   RACE_MANAGER: "race_manager",
   CONTENT: "content",
   SUPERADMIN: "superadmin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Role → dashboard home route
export const ROLE_HOME: Record<Role, string> = {
   team_manager: "/dashboard/team",
   race_manager: "/dashboard/race-manager",
   content: "/dashboard/content",
   superadmin: "/dashboard/admin",
};
