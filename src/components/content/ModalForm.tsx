"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export default function ModalForm({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting = false,
}: ModalFormProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal / Slide-over Container */}
      <div 
        ref={modalRef} 
        className="relative bg-[#0f1011] w-full max-w-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-headline font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body - scrollable */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {children}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-medium text-sm rounded-xl transition-colors border border-white/10 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors min-w-[120px] flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(184,0,20,0.3)]"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
