"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export const MuriRecord = ({ content }: { content: Record<string, string> }) => {
  const { isAuthenticated } = useAuthStore();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(true);
  }, []);

  const href = isAuthenticated ? "/dashboard/team/orders" : "/register";

  return (
    <section className="px-6 md:px-24 py-20 mb-32 bg-surface-container rounded-xl mx-6 md:mx-12 flex flex-col md:flex-row items-center gap-16 overflow-visible">
      <div className="w-full md:w-1/2">
        <div className="relative group">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={content.muri_image || "/images/muri-trophy.jpg"}
              alt="MURI record trophy"
              width={600}
              height={750}
              className="rounded-xl w-full aspect-[4/5] object-cover shadow-xl grayscale"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute -bottom-10 -right-4 md:-right-10 bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-sm border border-primary/10"
          >
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
              <div>
                <h4 className="font-headline text-3xl mb-1">{content.muri_badge_title || "MURI Record"}</h4>
                <p className="text-sm text-primary font-bold uppercase tracking-widest mb-4">{content.muri_badge_subtitle || "Official Attempt 2026"}</p>
                <div className="space-y-2 border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                    <span className="material-symbols-outlined text-sm text-primary">done_all</span>
                    {content.muri_badge_tagline || "One Brand. One Day. One Place."}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <label className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-zinc-400">
            {content.muri_subtitle || "National Milestone"}
          </label>
          <h2 className="font-headline text-[2.75rem] leading-tight tracking-tight mt-2">
            {content.muri_title || "Setting the MURI Record: Rekor Ganti Oli Terbanyak"}
          </h2>
          <p className="text-lg text-on-surface-variant leading-relaxed mt-6 whitespace-pre-line">
            {content.muri_content || "Witness and be part of history as Mobil 1 Luxe attempts the largest oil change marathon in Indonesia. One car brand, one day, one location, and one superior oil brand coming together to set the ultimate standard of performance and reliability."}
          </p>
          <div className="pt-4">
            {ready && (
              <Link 
                href={href}
                className="group flex items-center gap-4 font-bold text-sm tracking-widest uppercase transition-colors hover:text-primary"
              >
                {content.muri_cta || "Join the Record"}
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">
                  arrow_right_alt
                </span>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
