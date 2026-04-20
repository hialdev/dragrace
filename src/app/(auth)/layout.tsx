import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getCMSContent } from "@/lib/api/content";

export const metadata: Metadata = {
  title: "Login | Star Drag Race",
  description: "Masuk ke akun Star Drag Race Anda",
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const content = await getCMSContent();

  return (
    <div className="min-h-screen bg-[#0f1011] flex flex-col">
      <Navbar 
        logo={content.site_logo} 
        siteName={content.site_name} 
        registerText={content.register_btn_text} 
      />
      <main className="flex-grow flex items-center justify-center p-4 pt-24">
        {children}
      </main>
    </div>
  );
}
