"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createVehicle } from "@/lib/api/vehicles";
import { useTeamStore } from "@/store/teamStore";
import VehicleFormComponent from "@/components/dashboard/VehicleForm";
import type { VehicleForm } from "@/schemas/vehicle.schema";

export default function CreateVehiclePage() {
  const router = useRouter();
  const { teamId } = useTeamStore();

  const handleSubmit = async (data: VehicleForm, image?: File) => {
    if (!teamId) throw new Error("Team not found");
    await createVehicle(teamId, { ...data, ...(image ? { image } : {}) });
    setTimeout(() => router.push("/dashboard/team/vehicles"), 1200);
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/team/vehicles"
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Tambah Kendaraan</h1>
          <p className="text-white/40 text-sm mt-0.5">Daftarkan kendaraan baru ke roster tim</p>
        </div>
      </div>
      <VehicleFormComponent onSubmit={handleSubmit} />
    </div>
  );
}
