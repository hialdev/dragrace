"use client";

import { useState, useEffect } from "react";
import { getAdminList, createAdminRecord, updateAdminRecord, deleteAdminRecord, getFileUrl } from "@/lib/api/content-admin";
import DataTable, { Column } from "@/components/content/DataTable";
import ModalForm from "@/components/content/ModalForm";
import ImageUpload from "@/components/content/ImageUpload";
import RichTextEditor from "@/components/content/RichTextEditor";
import Image from "next/image";

interface RaceClass {
  id: string;
  name: string;
  slug: string;
  content: string;
  cover: string;
  created: string;
}

export default function RaceClassPage() {
  const collectionName = "race_class";
  const [data, setData] = useState<RaceClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<RaceClass | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    content: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAdminList(collectionName, { sort: "created" });
      setData(records as unknown as RaceClass[]);
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
    setFormData({ name: "", slug: "", content: "" });
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: RaceClass) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      slug: item.slug || "",
      content: item.content || "",
    });
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: RaceClass) => {
    if (!confirm(`Hapus race class "${item.name}"?`)) return;
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
      submissionData.append("slug", formData.slug);
      submissionData.append("content", formData.content);
      
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

  const columns: Column<RaceClass>[] = [
    {
      header: "Cover",
      accessor: (row) => {
        const url = getFileUrl(row, row.cover);
        if (!url) return <span className="text-white/30 text-xs italic">No image</span>;
        return (
          <div className="relative w-16 h-10 rounded-md overflow-hidden bg-white/10">
            <Image src={url} alt={row.name} fill className="object-cover" />
          </div>
        );
      },
    },
    { header: "Name", accessor: "name" },
    { header: "Slug", accessor: "slug" },
    { 
      header: "Content", 
      accessor: (row) => (
        <div className="line-clamp-2 max-w-xs" dangerouslySetInnerHTML={{ __html: row.content || "-" }} />
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Race Class</h1>
          <p className="text-white/40 text-sm">Manajemen kelas balap.</p>
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
        title={modalMode === "add" ? "Tambah Race Class" : "Edit Race Class"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <ImageUpload
            id="cover"
            label="Cover Image"
            previewUrl={modalMode === "edit" && selectedItem ? getFileUrl(selectedItem, selectedItem.cover) : ""}
            onImageSelect={setCoverFile}
          />
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Nama Kelas</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ 
                  ...formData, 
                  name: val,
                  slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                });
              }}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Slug (URL)</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Content (HTML)</label>
            <RichTextEditor
              value={formData.content}
              onChange={(val) => setFormData({ ...formData, content: val })}
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
