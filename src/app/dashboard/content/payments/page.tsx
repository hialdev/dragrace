"use client";

import { useState, useEffect } from "react";
import { getAdminList, createAdminRecord, updateAdminRecord, deleteAdminRecord, getFileUrl } from "@/lib/api/content-admin";
import ModalForm from "@/components/content/ModalForm";
import ImageUpload from "@/components/content/ImageUpload";
import Image from "next/image";

interface PaymentMethod {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_logo: string;
  is_qris: boolean;
  qris_image: string;
  is_active: boolean;
}

export default function PaymentsPage() {
  const collectionName = "payments";
  const [data, setData] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    account_name: "",
    account_number: "",
    bank_name: "",
    is_qris: false,
    is_active: true,
  });
  const [bankLogoFile, setBankLogoFile] = useState<File | null>(null);
  const [qrisImageFile, setQrisImageFile] = useState<File | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAdminList(collectionName, { sort: "created" });
      setData(records as unknown as PaymentMethod[]);
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
    setFormData({ 
      account_name: "", 
      account_number: "", 
      bank_name: "", 
      is_qris: false,
      is_active: true
    });
    setBankLogoFile(null);
    setQrisImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PaymentMethod) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      account_name: item.account_name || "",
      account_number: item.account_number || "",
      bank_name: item.bank_name || "",
      is_qris: item.is_qris || false,
      is_active: item.is_active !== undefined ? item.is_active : true,
    });
    setBankLogoFile(null);
    setQrisImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: PaymentMethod) => {
    if (!confirm(`Hapus metode pembayaran "${item.bank_name}"?`)) return;
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
      submissionData.append("account_name", formData.account_name);
      submissionData.append("account_number", formData.account_number);
      submissionData.append("bank_name", formData.bank_name);
      submissionData.append("is_qris", formData.is_qris.toString());
      submissionData.append("is_active", formData.is_active.toString());
      
      if (bankLogoFile) {
        submissionData.append("bank_logo", bankLogoFile);
      }
      if (formData.is_qris && qrisImageFile) {
        submissionData.append("qris_image", qrisImageFile);
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

  const toggleStatus = async (item: PaymentMethod) => {
    try {
      await updateAdminRecord(collectionName, item.id, { is_active: !item.is_active });
      await loadData();
    } catch (error) {
      console.error("Gagal update status", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Payment Methods</h1>
          <p className="text-white/40 text-sm">Manajemen rekening tujuan pembayaran untuk peserta.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Rekening
        </button>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center py-12 text-white/50">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center py-12 text-center text-white/50">
          <span className="material-symbols-outlined text-4xl mb-3 opacity-50">data_alert</span>
          <p>Belum ada metode pembayaran.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white/5 border rounded-2xl p-6 relative group overflow-hidden transition-all ${
                item.is_active ? "border-white/10" : "border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-10 bg-white rounded-lg p-1 flex items-center justify-center relative overflow-hidden">
                  {item.bank_logo ? (
                    <Image 
                      src={getFileUrl(item, item.bank_logo)} 
                      alt={item.bank_name} 
                      fill 
                      className="object-contain p-1" 
                    />
                  ) : (
                    <span className="text-[10px] text-black/50 font-bold">{item.bank_name}</span>
                  )}
                </div>
                <button
                  onClick={() => toggleStatus(item)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {item.is_active ? "Aktif" : "Non-Aktif"}
                </button>
              </div>

              <div>
                <p className="text-sm text-white/50 mb-1">{item.bank_name}</p>
                <p className="text-xl font-mono text-white font-semibold tracking-wider mb-1">{item.account_number}</p>
                <p className="text-white/70 text-sm uppercase">{item.account_name}</p>
              </div>

              {item.is_qris && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-indigo-400 text-sm font-medium">
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  Mendukung QRIS
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(item)}
                  className="w-8 h-8 bg-black/40 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="w-8 h-8 bg-black/40 hover:bg-red-500/40 text-red-400 rounded-full flex items-center justify-center transition-colors shadow-lg"
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
        title={modalMode === "add" ? "Tambah Rekening Pembayaran" : "Edit Rekening Pembayaran"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 accent-[#b80014] rounded cursor-pointer"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-white cursor-pointer select-none flex-1">
              Aktifkan Rekening Ini
            </label>
          </div>

          <ImageUpload
            id="bank_logo"
            label="Logo Bank / E-Wallet"
            previewUrl={modalMode === "edit" && selectedItem ? getFileUrl(selectedItem, selectedItem.bank_logo) : ""}
            onImageSelect={setBankLogoFile}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Nama Bank</label>
              <input
                type="text"
                required
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all"
                placeholder="Ex: BCA, Mandiri, GoPay"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Nomor Rekening</label>
              <input
                type="text"
                required
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Nama Pemilik Rekening</label>
            <input
              type="text"
              required
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all uppercase"
            />
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="is_qris"
                checked={formData.is_qris}
                onChange={(e) => setFormData({ ...formData, is_qris: e.target.checked })}
                className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
              />
              <label htmlFor="is_qris" className="text-sm font-medium text-white cursor-pointer select-none flex-1">
                Rekening ini mendukung QRIS
              </label>
            </div>

            {formData.is_qris && (
              <div className="pl-8">
                <ImageUpload
                  id="qris_image"
                  label="Upload QR Code (QRIS)"
                  previewUrl={modalMode === "edit" && selectedItem ? getFileUrl(selectedItem, selectedItem.qris_image) : ""}
                  onImageSelect={setQrisImageFile}
                  required={true}
                />
              </div>
            )}
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
