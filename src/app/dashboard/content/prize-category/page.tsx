"use client";

import { useState, useEffect } from "react";
import { getAdminList, createAdminRecord, updateAdminRecord, deleteAdminRecord, getFileUrl } from "@/lib/api/content-admin";
import DataTable, { Column } from "@/components/content/DataTable";
import ModalForm from "@/components/content/ModalForm";
import ImageUpload from "@/components/content/ImageUpload";
import Image from "next/image";

interface PrizeCategory {
  id: string;
  name: string;
  description: string;
  image: string;
}

export default function PrizeCategoryPage() {
  const collectionName = "prize_category";
  const [data, setData] = useState<PrizeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<PrizeCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAdminList(collectionName, { sort: "created" });
      setData(records as unknown as PrizeCategory[]);
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
    setFormData({ name: "", description: "" });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PrizeCategory) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: PrizeCategory) => {
    if (!confirm(`Hapus kategori hadiah "${item.name}"?`)) return;
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
      submissionData.append("description", formData.description);
      
      if (imageFile) {
        submissionData.append("image", imageFile);
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

  const columns: Column<PrizeCategory>[] = [
    {
      header: "Image",
      accessor: (row) => {
        const url = getFileUrl(row, row.image);
        if (!url) return <span className="text-white/30 text-xs italic">No image</span>;
        return (
          <div className="relative w-16 h-10 rounded-md overflow-hidden bg-white/10">
            <Image src={url} alt={row.name} fill className="object-cover" />
          </div>
        );
      },
    },
    { header: "Nama Kategori", accessor: "name" },
    { 
      header: "Deskripsi", 
      accessor: (row) => <span className="line-clamp-2 max-w-sm text-white/60">{row.description}</span>
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Prize Category</h1>
          <p className="text-white/40 text-sm">Manajemen jenis kategori hadiah (contoh: General, Khusus Mahasiswa).</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Data
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
        title={modalMode === "add" ? "Tambah Prize Category" : "Edit Prize Category"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <ImageUpload
            id="image"
            label="Banner / Ilustrasi Hadiah"
            previewUrl={modalMode === "edit" && selectedItem ? getFileUrl(selectedItem, selectedItem.image) : ""}
            onImageSelect={setImageFile}
          />
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Nama Kategori</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all font-mono text-sm leading-relaxed"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
