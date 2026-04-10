"use client";

import React from "react";
import { motion } from "framer-motion";
import { ValueItem } from "../lib/types/content";

const FeatureCard = ({ icon, title, description, delay = 0 }: { icon: string; title: string; description: string; delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="space-y-6"
  >
    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
      <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
    </div>
    <h3 className="font-headline text-2xl whitespace-pre-line">{title}</h3>
    <p className="text-lg text-on-surface-variant leading-relaxed">{description}</p>
  </motion.div>
);

export const Values = ({ items }: { items: ValueItem[] }) => {
  return (
    <section className="bg-surface-container py-32">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-20">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <FeatureCard 
              key={item.id}
              icon={item.icon || "stars"}
              title={item.title}
              description={item.description}
              delay={idx * 0.2}
            />
          ))
        ) : (
          <>
            <FeatureCard 
              icon="payments" 
              title="Magnificent Rewards" 
              description="A total prize pool exceeding Rp 250,000,000 distributed across all major classes and special performance awards."
            />
            <FeatureCard 
              icon="music_note" 
              title="Elite Entertainment" 
              description="Experience a curated atmosphere featuring international DJs, luxury lounge access, and exclusive networking suites."
              delay={0.2}
            />
            <FeatureCard 
              icon="safety_check" 
              title="Safety Standards" 
              description="Governed by strict safety regulations and medical response teams ensuring the highest level of professional conduct."
              delay={0.4}
            />
          </>
        )}
      </div>
    </section>
  );
};
