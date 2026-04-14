"use client";

import { useState, useEffect } from "react";
import { getAdminList, createAdminRecord, updateAdminRecord, deleteAdminRecord, getFileUrl } from "@/lib/api/content-admin";
import DataTable, { Column } from "@/components/content/DataTable";
import ModalForm from "@/components/content/ModalForm";
import ImageUpload from "@/components/content/ImageUpload";
import Image from "next/image";

interface StarGuest {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  created: string;
}

export default function StarGuestPage() {
  const collectionName = "star_guest";
  const [data, setData] = useState<StarGuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<StarGuest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAdminList(collectionName, { sort: "-created" });
      setData(records as unknown as StarGuest[]);
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
    setFormData({ title: "", subtitle: "", description: "" });
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: StarGuest) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
    });
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: StarGuest) => {
    if (!confirm(`Hapus star guest "${item.title}"?`)) return;
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
      submissionData.append("title", formData.title);
      submissionData.append("subtitle", formData.subtitle);
      submissionData.append("description", formData.description);
      
      if (coverFile) {
        submissionData.append("cover", coverFile);
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

  const columns: Column<StarGuest>[] = [
    {
      header: "Photo",
      accessor: (row) => {
        const url = getFileUrl(row, row.cover);
        if (!url) return <span className="text-white/30 text-xs italic">No image</span>;
        return (
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10">
            <Image src={url} alt={row.title} fill className="object-cover" />
          </div>
        );
      },
    },
    { header: "Name/Title", accessor: "title" },
    { header: "Role/Subtitle", accessor: "subtitle" },
    { 
      header: "Description", 
      accessor: (row) => (
        <span className="line-clamp-2 max-w-sm text-white/50">{row.description || "-"}</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Star Guest</h1>
          <p className="text-white/40 text-sm">Manajemen tamu dan MC.</p>
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
        title={modalMode === "add" ? "Tambah Star Guest" : "Edit Star Guest"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <ImageUpload
            id="cover"
            label="Photo / Cover Image"
            previewUrl={modalMode === "edit" && selectedItem ? getFileUrl(selectedItem, selectedItem.cover) : ""}
            onImageSelect={setCoverFile}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Nama / Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Peran / Subtitle</label>
              <input
                type="text"
                required
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
                placeholder="Ex: Official MC, Guest Star"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={3}
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
