import CollectorTopNav from "@/components/dashboard/CollectorTopNav";
import RoleGuard from "@/components/auth/RoleGuard";

export default function CollectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["collector"]}>
      <div className="min-h-screen bg-[#0f1011]">
        <CollectorTopNav />
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </div>
    </RoleGuard>
  );
}
