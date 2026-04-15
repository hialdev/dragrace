"use client";

import { useState, useEffect } from "react";
import { getAdminList, createAdminRecord, updateAdminRecord, deleteAdminRecord } from "@/lib/api/content-admin";
import ModalForm from "@/components/content/ModalForm";

interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export default function ValuesPage() {
  const collectionName = "values";
  const [data, setData] = useState<ValueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<ValueItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAdminList(collectionName, { sort: "created" });
      setData(records as unknown as ValueItem[]);
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
    setFormData({ title: "", description: "", icon: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ValueItem) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      icon: item.icon || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: ValueItem) => {
    if (!confirm(`Hapus value "${item.title}"?`)) return;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Values & Benefits</h1>
          <p className="text-white/40 text-sm">Manajemen poin-poin keuntungan/nilai.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Data
        </button>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center py-12 text-white/50">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center py-12 text-center text-white/50">
          <span className="material-symbols-outlined text-4xl mb-3 opacity-50">data_alert</span>
          <p>Belum ada data values.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-[#b80014]/20 text-[#b80014] rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">{item.icon || "star"}</span>
              </div>
              <h3 className="text-lg font-headline font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2 transition-opacity">
                <button
                  onClick={() => openEditModal(item)}
                  className="w-8 h-8 bg-black/40 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="w-8 h-8 bg-black/40 hover:bg-red-500/40 text-red-400 rounded-full flex items-center justify-center transition-colors"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Tambah Value" : "Edit Value"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Judul</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Material Symbol Icon Name</label>
            <div className="flex gap-3">
              <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                <span className="material-symbols-outlined">{formData.icon || "help"}</span>
              </div>
              <input
                type="text"
                required
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all font-mono"
                placeholder="Ex: star, emoji_events, diamond"
              />
            </div>
            <p className="text-xs text-white/40 mt-2">Cari nama icon di <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-[#b80014] hover:underline">Google Fonts</a>.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
