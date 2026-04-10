"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { RaceClassHierarchy } from "../lib/types/content";

export const RaceClasses = ({ classes }: { classes: RaceClassHierarchy[] }) => {
  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 mb-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div>
          <motion.label 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary mb-4 block"
          >
            Performance Categories
          </motion.label>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-headline text-[3.5rem] tracking-tighter"
          >
            Precision Racing Classes
          </motion.h2>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="hidden md:block max-w-md text-right text-lg text-on-surface-variant italic"
        >
          "Every millisecond is a testament to engineering mastery."
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto">
        {classes.map((cls, idx) => (
          <motion.div 
            key={cls.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className={`${idx === 0 ? "md:col-span-7" : "md:col-span-5"} relative group overflow-hidden rounded-xl bg-surface-container-low cursor-pointer aspect-video md:aspect-auto md:h-[600px]`}
          >
            <Image
              src={cls.cover || "/images/engine-bay.jpg"}
              alt={cls.name}
              fill
              className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-12 left-12 text-white">
              <h3 className="font-headline text-4xl mb-2">{cls.name}</h3>
              <p className="opacity-80 max-w-sm mb-6">{cls.description}</p>
              <span className="px-6 py-2 border border-white/30 rounded-full text-[0.6875rem] font-bold tracking-widest uppercase">
                {cls.name.includes("201") ? "Explosive Power" : "Endurance Speed"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
