"use client";

import { useRef, useState, ChangeEvent } from "react";
import Image from "next/image";

interface ImageUploadProps {
  id: string;
  label: string;
  previewUrl?: string;
  onImageSelect: (file: File | null) => void;
  required?: boolean;
}

export default function ImageUpload({
  id,
  label,
  previewUrl = "",
  onImageSelect,
  required = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(previewUrl);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      // Create object URL for local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Cleanup previous object url when new one is selected
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const clearSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreview("");
    onImageSelect(null);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-white/70">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-video group w-full max-w-sm">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={clearSelection}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Hapus Gambar
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="border-2 border-dashed border-white/20 hover:border-[#b80014]/50 bg-white/5 hover:bg-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors w-full aspect-video"
        >
          <span className="material-symbols-outlined text-4xl text-white/30 mb-2">add_photo_alternate</span>
          <span className="text-sm font-medium text-white/70">Klik untuk unggah gambar</span>
          <span className="text-xs text-white/40 mt-1">PNG, JPG, WEBP maks. 5MB</span>
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
