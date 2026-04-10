"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Partner } from "../lib/types/content";

export const Partners = ({ partners, content }: { partners: Partner[]; content: Record<string, string> }) => {
  return (
    <section className="bg-surface py-32 border-t border-zinc-100">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <label className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-4">
            {content.partner_subtitle || "Global Alliance"}
          </label>
          <h2 className="font-headline text-4xl tracking-tighter">
            {content.partner_title || "Our Strategic Partners"}
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-12 grayscale opacity-40 hover:grayscale-0 transition-all duration-700">
          {partners.length > 0 ? (
            partners.map((partner, idx) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative h-12 w-32"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain"
                />
              </motion.div>
            ))
          ) : (
            <>
              {/* Fallback logos if needed */}
              <div className="text-zinc-300 font-headline text-2xl tracking-widest uppercase">Mobil 1</div>
              <div className="text-zinc-300 font-headline text-2xl tracking-widest uppercase">Michelin</div>
              <div className="text-zinc-300 font-headline text-2xl tracking-widest uppercase">Brembo</div>
              <div className="text-zinc-300 font-headline text-2xl tracking-widest uppercase">Akrapovic</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
