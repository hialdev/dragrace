import TeamTopNav from "@/components/dashboard/TeamTopNav";
import RoleGuard from "@/components/auth/RoleGuard";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["team_manager"]}>
      <div className="min-h-screen bg-[#0f1011]">
        <TeamTopNav />
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </div>
    </RoleGuard>
  );
}
