"use client";

import { useState, useEffect } from "react";
import { getAdminList, updateAdminRecord, getFileUrl } from "@/lib/api/content-admin";
import Image from "next/image";

interface SingleContent {
  id: string;
  key: string;
  is_image: boolean;
  content: string;
  image: string;
  updated: string;
}

export default function SingleContentPage() {
  const collectionName = "single_content";
  const [data, setData] = useState<SingleContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit mode state per item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ content: string; imageFile: File | null }>({ content: "", imageFile: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local preview url for image replacements
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAdminList(collectionName, { sort: "key" });
      setData(records as unknown as SingleContent[]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEdit = (item: SingleContent) => {
    setEditingId(item.id);
    setEditData({ content: item.content || "", imageFile: null });
    setPreviewUrl(getFileUrl(item, item.image));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ content: "", imageFile: null });
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditData({ ...editData, imageFile: file });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async (id: string) => {
    setIsSubmitting(true);
    try {
      const submissionData = new FormData();
      submissionData.append("content", editData.content);
      if (editData.imageFile) {
        submissionData.append("image", editData.imageFile);
      }

      await updateAdminRecord(collectionName, id, submissionData);
      setEditingId(null);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui konten.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-white">Single Content Editor</h1>
          <p className="text-white/40 text-sm">Update text dan gambar pada landing page. (Keys tidak bisa ditambah/dihapus)</p>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center py-12 text-white/50">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center py-12 text-center text-white/50">
          <span className="material-symbols-outlined text-4xl mb-3 opacity-50">data_alert</span>
          <p>Belum ada data single content di database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {data.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-colors hover:bg-white/[0.07]">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-white/40 mb-1">KEY</span>
                  <span className="font-semibold text-white tracking-widest">{item.key}</span>
                </div>
                {!editingId || editingId !== item.id ? (
                  <button
                    onClick={() => openEdit(item)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleSave(item.id)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center min-w-[80px]"
                    >
                      {isSubmitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Simpan"}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                {editingId === item.id ? (
                  // EDIT MODE
                  item.is_image ? (
                    <div className="space-y-4">
                      {previewUrl && (
                        <div className="relative w-full max-w-xl h-48 bg-black/50 rounded-xl overflow-hidden border border-white/10">
                          <Image src={previewUrl} alt="preview" fill className="object-contain" />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          id={`file-${item.id}`}
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <label
                          htmlFor={`file-${item.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">upload</span>
                          Pilih Gambar Baru
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <textarea
                        value={editData.content}
                        onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#b80014]/70 focus:ring-1 focus:ring-[#b80014]/50 transition-all font-sans min-h-[150px] resize-y"
                        placeholder="Masukkan konten teks di sini..."
                      />
                    </div>
                  )
                ) : (
                  // VIEW MODE
                  item.is_image ? (
                    <div className="relative w-full max-w-xl h-48 bg-black/50 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <Image src={getFileUrl(item, item.image)} alt={item.key} fill className="object-contain p-2" />
                      ) : (
                        <span className="text-white/30 italic text-sm">Belum ada gambar</span>
                      )}
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-white/80">
                       <p className="whitespace-pre-wrap leading-relaxed">{item.content || <span className="italic opacity-50">Kosong</span>}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
