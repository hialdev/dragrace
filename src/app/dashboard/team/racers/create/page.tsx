"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRacer } from "@/lib/api/racers";
import { useTeamStore } from "@/store/teamStore";
import RacerFormComponent from "@/components/dashboard/RacerForm";
import type { RacerForm } from "@/schemas/racer.schema";

export default function CreateRacerPage() {
  const router = useRouter();
  const { teamId } = useTeamStore();

  const handleSubmit = async (
    data: RacerForm,
    files: Partial<Record<"photo" | "kta" | "sim" | "kis", File>>
  ) => {
    if (!teamId) throw new Error("Team not found");
    await createRacer(teamId, { ...data, ...files });
    setTimeout(() => router.push("/dashboard/team/racers"), 1200);
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/team/racers"
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Tambah Racer</h1>
          <p className="text-white/40 text-sm mt-0.5">Isi data racer baru untuk tim Anda</p>
        </div>
      </div>
      <RacerFormComponent onSubmit={handleSubmit} />
    </div>
  );
}
