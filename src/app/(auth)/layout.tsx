import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Star Drag Race",
  description: "Masuk ke akun Star Drag Race Anda",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1011] flex items-center justify-center p-4">
      {children}
    </div>
  );
}
