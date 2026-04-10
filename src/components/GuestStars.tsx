"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { StarGuest } from "../lib/types/content";

const GuestCard = ({ 
  name, 
  role, 
  image, 
  delay = 0 
}: { 
  name: string; 
  role: string; 
  image: string; 
  delay?: number 
}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="relative group overflow-hidden rounded-xl aspect-[3/4]"
  >
    <Image
      src={image}
      alt={name}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20">
      <h3 className="font-headline text-2xl text-white mb-1">{name}</h3>
      <p className="text-primary text-[0.6875rem] font-bold uppercase tracking-widest">{role}</p>
    </div>
  </motion.div>
);

export const GuestStars = ({ 
  guests, 
  content 
}: { 
  guests: StarGuest[]; 
  content: Record<string, string>;
}) => {
  return (
    <section className="bg-surface py-32">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.label 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary mb-4 block"
            >
              {content.guest_subtitle || "Festival Atmosphere"}
            </motion.label>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-headline text-[3.5rem] leading-[1.1] tracking-tighter"
            >
              {content.guest_title || "Elite Performance & Star Guests"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg text-on-surface-variant leading-relaxed lowercase first-letter:uppercase"
            >
              {content.guest_excerpt || "Experience high-energy performances as the sun sets over the track."}
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {guests.length > 0 ? (
            guests.map((guest, idx) => (
              <GuestCard 
                key={guest.id}
                name={guest.title}
                role={guest.subtitle}
                image={guest.cover || "/images/guest-placeholder.jpg"}
                delay={idx * 0.15}
              />
            ))
          ) : (
            <>
              <GuestCard name="Juicy Luicy" role="Special Performance" image="/images/guest-1.jpg" />
              <GuestCard name="For Revenge" role="Headliner" image="/images/guest-2.jpg" delay={0.2} />
              <GuestCard name="The Sigit" role="Rock Performance" image="/images/guest-3.jpg" delay={0.4} />
            </>
          )}
        </div>
      </div>
    </section>
  );
};
