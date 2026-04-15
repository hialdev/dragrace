import RaceManagerTopNav from "@/components/dashboard/RaceManagerTopNav";
import RoleGuard from "@/components/auth/RoleGuard";

export default function RaceManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["race_manager"]}>
      <div className="min-h-screen bg-[#0f1011]">
        <div className="print:hidden">
          <RaceManagerTopNav />
        </div>
        <main className="max-w-7xl mx-auto px-6 py-8 print:p-0 print:max-w-none">{children}</main>
      </div>
    </RoleGuard>
  );
}
