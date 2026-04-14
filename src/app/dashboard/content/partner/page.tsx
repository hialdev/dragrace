"use client";

import { useState, useEffect } from "react";
import { getAdminList, createAdminRecord, updateAdminRecord, deleteAdminRecord, getFileUrl } from "@/lib/api/content-admin";
import ModalForm from "@/components/content/ModalForm";
import ImageUpload from "@/components/content/ImageUpload";
import Image from "next/image";

interface Partner {
  id: string;
  name: string;
  logo: string;
  created: string;
}

export default function PartnerPage() {
  const collectionName = "partner";
  const [data, setData] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<Partner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAdminList(collectionName, { sort: "-created" });
      setData(records as unknown as Partner[]);
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
    setFormData({ name: "" });
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Partner) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
    });
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Partner) => {
    if (!confirm(`Hapus partner "${item.name}"?`)) return;
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
      const submissionData = new FormData();
      submissionData.append("name", formData.name);
      
      if (logoFile) {
        submissionData.append("logo", logoFile);
      }

      if (modalMode === "add") {
        await createAdminRecord(collectionName, submissionData);
      } else if (selectedItem) {
        await updateAdminRecord(collectionName, selectedItem.id, submissionData);
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
          <h1 className="text-2xl font-headline font-semibold text-white">Partner & Sponsor</h1>
          <p className="text-white/40 text-sm">Manajemen logo partner.</p>
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
          <p>Belum ada data partner.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center group relative overflow-hidden">
              <div className="w-full aspect-square relative mb-3 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center p-4">
                {item.logo ? (
                  <Image 
                    src={getFileUrl(item, item.logo)} 
                    alt={item.name} 
                    fill 
                    className="object-contain p-2" 
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-white/20">image</span>
                )}
              </div>
              <p className="text-white text-sm font-medium text-center truncate w-full">{item.name}</p>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="w-10 h-10 bg-red-500/20 hover:bg-red-500/40 text-red-500 hover:text-red-400 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Tambah Partner" : "Edit Partner"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <ImageUpload
            id="logo"
            label="Logo Partner"
            previewUrl={modalMode === "edit" && selectedItem ? getFileUrl(selectedItem, selectedItem.logo) : ""}
            onImageSelect={setLogoFile}
          />
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Nama Partner / Instansi</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
