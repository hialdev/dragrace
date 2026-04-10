"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getVehicle, updateVehicle, vehicleImageUrl } from "@/lib/api/vehicles";
import VehicleFormComponent from "@/components/dashboard/VehicleForm";
import type { VehicleForm } from "@/schemas/vehicle.schema";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicle(id)
      .then((v) => { setVehicle(v); setLoading(false); })
      .catch(() => router.replace("/dashboard/team/vehicles"));
  }, [id]);

  const handleSubmit = async (data: VehicleForm, image?: File) => {
    await updateVehicle(id, { ...data, ...(image ? { image } : {}) });
    setTimeout(() => router.push("/dashboard/team/vehicles"), 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/team/vehicles"
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Edit Kendaraan</h1>
          <p className="text-white/40 text-sm mt-0.5">{vehicle?.brand} {vehicle?.model}</p>
        </div>
      </div>
      <VehicleFormComponent
        isEdit
        defaultValues={{
          brand: vehicle.brand, model: vehicle.model,
          cc: vehicle.cc, year: vehicle.year,
          color: vehicle.color, plate_number: vehicle.plate_number,
          notes: vehicle.notes,
        }}
        existingImageUrl={vehicleImageUrl(vehicle)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
