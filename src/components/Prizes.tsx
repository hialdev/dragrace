"use client";

import React from "react";
import { motion } from "framer-motion";
import { PrizeCategory, RaceClassHierarchy } from "../lib/types/content";

const PrizeRow = ({ label, value, isPrimary = false }: { label: string; value: string; isPrimary?: boolean }) => (
  <li className="flex justify-between items-center pb-4 border-b border-white/40 last:border-0 last:pb-0">
    <span className="text-on-surface-variant">{label}</span>
    <span className={`font-headline font-bold text-lg ${isPrimary ? "text-primary" : ""}`}>{value}</span>
  </li>
);

export const Prizes = ({ 
  classes, 
  prizes, 
  content 
}: { 
  classes: RaceClassHierarchy[]; 
  prizes: PrizeCategory[];
  content: Record<string, string>;
}) => {
  return (
    <section className="bg-surface py-32 border-t border-surface-container">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="text-center mb-24">
          <label className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary mb-4 block">
            {content.reward_subtitle || "Competition Details"}
          </label>
          <h2 className="font-headline text-[3.5rem] tracking-tighter">
            {content.reward_title || "Race Classes & Rewards"}
          </h2>
        </div>

        {/* Dynamic Race Classes List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {classes.map((cls, idx) => (
            <motion.div 
              key={cls.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-12 rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-zinc-100"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    {cls.name.includes("201") ? "timer" : "speed"}
                  </span>
                </div>
                <h3 className="font-headline text-3xl font-medium">{cls.name}</h3>
              </div>
              <div className="space-y-10">
                {cls.categories.map((cat) => (
                  <div key={cat.id}>
                    <h4 className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-6">Kategori {cat.name}</h4>
                    <div className="flex flex-wrap gap-3">
                      {cat.pits.map(pit => (
                        <span key={pit.id} className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                          pit.name === "FFA" 
                            ? "bg-primary/10 text-primary border-primary/20 font-bold" 
                            : "bg-surface-container-low border-zinc-200"
                        }`}>
                          {pit.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prize Structure Highlight Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface-container rounded-[2.5rem] p-8 md:p-16 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[12rem]">military_tech</span>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline text-4xl mb-16">Prize Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {prizes.map((cat, idx) => (
                <div key={cat.id} className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx % 2 !== 0 ? "bg-primary" : "bg-white"}`}>
                      <span className={`material-symbols-outlined text-xl ${idx % 2 !== 0 ? "text-white" : "text-primary"}`}>
                        {idx % 2 !== 0 ? "stars" : "workspace_premium"}
                      </span>
                    </div>
                    <h4 className="font-headline text-2xl font-medium">Hadiah {cat.name}</h4>
                  </div>
                  <ul className="space-y-4">
                    {cat.winners.map((w, wIdx) => (
                      <PrizeRow 
                        key={w.id} 
                        label={w.title} 
                        value={w.description || `Rp ${w.prize.toLocaleString()}`} 
                        isPrimary={idx % 2 !== 0 && wIdx === 0} 
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Reward Benefit - Moved outside of winners list boxes but inside the main card container as a highlight bar */}
            {content.reward_benefit && (
              <div className="mt-16 bg-white/50 backdrop-blur p-4 rounded-xl border border-white/30 text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-3 w-full">
                <span className="material-symbols-outlined text-sm">redeem</span>
                {content.reward_benefit}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
