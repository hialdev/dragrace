"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
export default function ContentPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  return (
    <div className="flex min-h-screen bg-[#0f1011]">
      <aside className="w-64 min-h-screen bg-[#0a0b0c] border-r border-white/8 flex flex-col">
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#b80014] rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">DR</span>
            </div>
            <div>
              <p className="text-white font-headline font-semibold text-sm">STAR DRAG RACE</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Content Manager</p>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <p className="text-white/20 text-xs px-3 py-2">Konten website akan tersedia di sini.</p>
        </div>
        <div className="p-4 border-t border-white/8">
          <button onClick={() => logout().then(() => router.push("/login"))}
            className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-red-400 text-sm rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[16px]">logout</span>Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-headline font-semibold text-white mb-2">Content Manager</h1>
        <p className="text-white/40 text-sm">Selamat datang, {user?.full_name}</p>
        <div className="mt-8 bg-white/5 border border-white/8 rounded-2xl p-12 text-center max-w-lg">
          <span className="material-symbols-outlined text-white/20 text-[48px] mb-4 block">edit_note</span>
          <p className="text-white/50 text-sm">Manajemen konten website akan diimplementasi di sprint berikutnya.</p>
        </div>
      </main>
    </div>
  );
}
