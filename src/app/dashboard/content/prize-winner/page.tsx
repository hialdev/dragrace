"use client";

import { useState, useEffect } from "react";
import { getAdminList, createAdminRecord, updateAdminRecord, deleteAdminRecord } from "@/lib/api/content-admin";
import DataTable, { Column } from "@/components/content/DataTable";
import ModalForm from "@/components/content/ModalForm";

interface PrizeWinner {
  id: string;
  position: string;
  title: string;
  prize: number;
  description: string;
  prize_category: string;
}

interface PrizeCategory {
  id: string;
  name: string;
}

export default function PrizeWinnerPage() {
  const collectionName = "prize_winner";
  const [data, setData] = useState<PrizeWinner[]>([]);
  const [categories, setCategories] = useState<PrizeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<PrizeWinner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    position: "",
    title: "",
    prize: 0,
    description: "",
    prize_category: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const winnerRecords = await getAdminList(collectionName, { sort: "position", expand: "prize_category" });
      setData(winnerRecords as unknown as PrizeWinner[]);
      
      const catRecords = await getAdminList("prize_category", { sort: "name" });
      setCategories(catRecords as unknown as PrizeCategory[]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedItem(null);
    setFormData({ position: "", title: "", prize: 0, description: "", prize_category: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: PrizeWinner) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      position: item.position || "",
      title: item.title || "",
      prize: item.prize || 0,
      description: item.description || "",
      prize_category: item.prize_category || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: PrizeWinner) => {
    if (!confirm(`Hapus hadiah untuk "${item.title}"?`)) return;
    try {
      await deleteAdminRecord(collectionName, item.id);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === "add") {
        await createAdminRecord(collectionName, formData);
      } else if (selectedItem) {
        await updateAdminRecord(collectionName, selectedItem.id, formData);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<PrizeWinner>[] = [
    { header: "Posisi", accessor: "position" },
    { header: "Judul / Gelar", accessor: "title" },
    { 
      header: "Nilai Hadiah (Rp)", 
      accessor: (row) => row.prize > 0 ? `Rp ${row.prize.toLocaleString("id-ID")}` : "-"
    },
    { 
      header: "Kategori", 
      accessor: (row) => {
        // @ts-ignore
        return row.expand?.prize_category?.name || <span className="text-white/30 italic">-</span>;
      } 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Prize Winner Levels</h1>
          <p className="text-white/40 text-sm">Manajemen daftar juara dan hadiahnya per kategori.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Posisi
        </button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Tambah Posisi Juara" : "Edit Posisi Juara"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Kategori Hadiah</label>
              <select
                required
                value={formData.prize_category}
                onChange={(e) => setFormData({ ...formData, prize_category: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all appearance-none"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#0f1011]">{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Posisi Juara (urutan)</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
                placeholder="Ex: 1, 2, 3, Best Time"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Title / Gelar Pemenang</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
              placeholder="Ex: Juara 1 Umum, The Fastest of The Fastest"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Total Uang Pembinaan (Rp)</label>
            <input
              type="number"
              min="0"
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Deskripsi Hadiah Tambahan</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all font-mono text-sm leading-relaxed"
              placeholder="Ex: + Trophy + Souvenir"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
