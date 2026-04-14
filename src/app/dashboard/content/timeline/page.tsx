"use client";

import { useState, useEffect } from "react";
import { getAdminList, createAdminRecord, updateAdminRecord, deleteAdminRecord } from "@/lib/api/content-admin";
import DataTable, { Column } from "@/components/content/DataTable";
import ModalForm from "@/components/content/ModalForm";
import RichTextEditor from "@/components/content/RichTextEditor";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  content: string;
}

export default function TimelinePage() {
  const collectionName = "timeline";
  const [data, setData] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<TimelineEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    description: "",
    content: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAdminList(collectionName, { sort: "date" });
      setData(records as unknown as TimelineEvent[]);
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
    setFormData({ date: "", title: "", description: "", content: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: TimelineEvent) => {
    setModalMode("edit");
    setSelectedItem(item);
    
    // Format date for datetime-local input
    let formattedDate = "";
    if (item.date) {
      const d = new Date(item.date);
      formattedDate = d.toISOString().slice(0, 16);
    }

    setFormData({
      date: formattedDate,
      title: item.title || "",
      description: item.description || "",
      content: item.content || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: TimelineEvent) => {
    if (!confirm(`Hapus event timeline "${item.title}"?`)) return;
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
      // Ensure date exists
      if (!formData.date) throw new Error("Tanggal wajib diisi");

      const submissionData = {
        date: new Date(formData.date).toISOString().replace('T', ' '),
        title: formData.title,
        description: formData.description,
        content: formData.content,
      };

      if (modalMode === "add") {
        await createAdminRecord(collectionName, submissionData);
      } else if (selectedItem) {
        await updateAdminRecord(collectionName, selectedItem.id, submissionData);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data. Pastikan tanggal terisi dengan benar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<TimelineEvent>[] = [
    { 
      header: "Tanggal / Waktu", 
      accessor: (row) => {
        if (!row.date) return "-";
        return new Date(row.date).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
      }
    },
    { header: "Judul Event", accessor: "title" },
    { header: "Deskripsi", accessor: "description" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Timeline Acara</h1>
          <p className="text-white/40 text-sm">Manajemen jadwal dan kegiatan (diurutkan berdasarkan tanggal).</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Kegiatan
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
        title={modalMode === "add" ? "Tambah Kegiatan" : "Edit Kegiatan"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Waktu Pelaksanaan</label>
            <input
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Judul Kegiatan</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
              placeholder="Contoh: Scrutineering Hari 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={2}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Konten Detail (HTML opsional)</label>
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
