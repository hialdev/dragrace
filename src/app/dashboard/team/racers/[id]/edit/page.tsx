"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getRacer, updateRacer, racerFileUrl } from "@/lib/api/racers";
import RacerFormComponent from "@/components/dashboard/RacerForm";
import type { RacerForm } from "@/schemas/racer.schema";

export default function EditRacerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [racer, setRacer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRacer(id)
      .then((r) => { setRacer(r); setLoading(false); })
      .catch(() => router.replace("/dashboard/team/racers"));
  }, [id]);

  const handleSubmit = async (
    data: RacerForm,
    files: Partial<Record<"photo" | "kta" | "sim" | "kis", File>>
  ) => {
    await updateRacer(id, { ...data, ...files });
    setTimeout(() => router.push("/dashboard/team/racers"), 1200);
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
        <Link href="/dashboard/team/racers"
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Edit Racer</h1>
          <p className="text-white/40 text-sm mt-0.5">{racer?.name}</p>
        </div>
      </div>
      <RacerFormComponent
        isEdit
        defaultValues={{
          name: racer.name,
          phone: racer.phone,
          birth_date: racer.birth_date ? racer.birth_date.split(" ")[0] : "",
          address: racer.address,
          notes: racer.notes,
        }}
        existingFiles={{
          photo: racerFileUrl(racer, "photo"),
          kta: racerFileUrl(racer, "kta"),
          sim: racerFileUrl(racer, "sim"),
          kis: racerFileUrl(racer, "kis"),
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
