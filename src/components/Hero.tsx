"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const SpecItem = ({ 
  label, 
  value, 
  icon, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  icon: string; 
  highlight?: boolean 
}) => (
  <div className="flex flex-col gap-1 min-w-[150px] md:min-w-[200px]">
    <span className="text-[0.6875rem] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">
      {label}
    </span>
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <span className={`font-headline text-lg md:text-xl leading-none ${highlight ? "text-primary font-bold" : "text-white md:text-zinc-900"}`}>
        {value}
      </span>
    </div>
  </div>
);

export const Hero = ({ content }: { content: Record<string, string> }) => {
  return (
    <section className="relative min-h-[921px] flex items-center overflow-hidden px-6 md:px-12 mb-20 pt-24">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src={content.hero_image || "/images/hero-car.jpg"}
          alt="luxury sports car acceleration"
          fill
          priority
          className="object-cover grayscale-[20%] brightness-[0.95]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-white/90 md:via-white/40 md:to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl">
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary mb-6 block"
        >
          {content.hero_subtitle || "Jakarta Special Exhibition"}
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-headline font-light text-[2.5rem] md:text-[5rem] leading-[1.1] tracking-[-0.04em] text-white md:text-zinc-900 mb-6 uppercase"
        >
          {content.hero_title || "THE STAR DRAG RACE: POWER UNLEASHED"}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-white/70 md:text-zinc-600 max-w-xl mb-12 leading-relaxed"
        >
          {content.hero_excerpt || "Driven by excellence, defined by performance. Join the elite echelon of speed at Jakarta's premier automotive showcase."}
        </motion.p>

        {/* Event Specs Strip */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap gap-8 md:gap-12 items-center bg-white/10 md:bg-white/40 backdrop-blur-md p-6 md:p-8 rounded-xl border border-white/20 shadow-sm"
        >
          <SpecItem 
            label="Venue" 
            value={content.race_location || "Stadion GBLA, Bandung"} 
            icon="location_on" 
          />
          <SpecItem 
            label="Date" 
            value={content.race_date || "Mei 2026"} 
            icon="calendar_today" 
          />
          <SpecItem 
            label="Prize Pool" 
            value={content.race_prize_pool || "Rp 250M+"} 
            icon="stars" 
            highlight 
          />
        </motion.div>
      </div>
    </section>
  );
};
