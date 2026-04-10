import RaceManagerTopNav from "@/components/dashboard/RaceManagerTopNav";

export default function RaceManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1011]">
      <RaceManagerTopNav />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
