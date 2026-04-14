"use client";

import { useState, useEffect } from "react";
import { getAdminList, createAdminRecord, updateAdminRecord, deleteAdminRecord, getFileUrl } from "@/lib/api/content-admin";
import DataTable, { Column } from "@/components/content/DataTable";
import ModalForm from "@/components/content/ModalForm";
import ImageUpload from "@/components/content/ImageUpload";
import RichTextEditor from "@/components/content/RichTextEditor";
import Image from "next/image";

interface RaceCategory {
  id: string;
  name: string;
  slug: string;
  content: string;
  cover: string;
  race_class: string;
  created: string;
}

interface RaceClass {
  id: string;
  name: string;
}

export default function RaceCategoryPage() {
  const collectionName = "race_category";
  const [data, setData] = useState<RaceCategory[]>([]);
  const [classes, setClasses] = useState<RaceClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<RaceCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    content: "",
    race_class: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAdminList(collectionName, { sort: "created", expand: "race_class" });
      setData(records as unknown as RaceCategory[]);

      const classRecords = await getAdminList("race_class", { sort: "name" });
      setClasses(classRecords as unknown as RaceClass[]);
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
    setFormData({ name: "", slug: "", content: "", race_class: "" });
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: RaceCategory) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      slug: item.slug || "",
      content: item.content || "",
      race_class: item.race_class || "",
    });
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: RaceCategory) => {
    if (!confirm(`Hapus race category "${item.name}"?`)) return;
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
      if (formData.race_class) {
        submissionData.append("race_class", formData.race_class);
      }
      
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

  const columns: Column<RaceCategory>[] = [
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
    { 
      header: "Class", 
      accessor: (row) => {
        // @ts-ignore
        return row.expand?.race_class?.name || <span className="text-white/30 italic">-</span>;
      } 
    },
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
          <h1 className="text-2xl font-headline font-semibold text-white">Race Category</h1>
          <p className="text-white/40 text-sm">Manajemen sub-kategori balap.</p>
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
        title={modalMode === "add" ? "Tambah Race Category" : "Edit Race Category"}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Nama Kategori</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Race Class Induk</label>
            <select
              value={formData.race_class}
              onChange={(e) => setFormData({ ...formData, race_class: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all appearance-none"
            >
              <option value="">Pilih Class Induk...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id} className="bg-[#0f1011]">{cls.name}</option>
              ))}
            </select>
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
