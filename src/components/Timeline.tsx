"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TimelineEvent } from "../lib/types/content";

const TimelineItem = ({ 
  date, 
  title, 
  description, 
  delay = 0 
}: { 
  date: string; 
  title: string; 
  description: string; 
  delay?: number 
}) => {
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex gap-8 group"
    >
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full border-2 border-primary bg-white group-hover:bg-primary transition-colors" />
        <div className="flex-grow w-px bg-zinc-200 mt-2" />
      </div>
      <div className="pb-12">
        <div className="text-[0.625rem] font-bold text-primary uppercase tracking-[0.2em] mb-2">
          {formattedDate}
        </div>
        <h3 className="font-headline text-2xl mb-2">{title}</h3>
        {description && (
          <p className="text-zinc-500 leading-relaxed max-w-md">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const Timeline = ({ events, content }: { events: TimelineEvent[]; content: Record<string, string> }) => {
  return (
    <section className="bg-surface py-32">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl"
        >
          <Image
            src={content.race_loc_image || "/images/race-location.jpg"}
            alt="Event Venue and Schedule"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-12 left-12">
            <h2 className="font-headline text-5xl text-white tracking-widest uppercase">THE<br/>SCHEDULE</h2>
          </div>
        </motion.div>

        <div className="pt-8">
          <div className="mb-16">
            <label className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-4">Official Itinerary</label>
            <h2 className="font-headline text-4xl tracking-tighter">Event Timeline</h2>
          </div>
          <div className="relative">
            {events.length > 0 ? (
              events.map((event, idx) => (
                <TimelineItem 
                  key={event.id}
                  date={event.date}
                  title={event.title}
                  description={event.description}
                  delay={idx * 0.1}
                />
              ))
            ) : (
              <>
                <TimelineItem 
                  date="2026-05-15" 
                  title="Scrutineering & Technical Inspection" 
                  description="Pre-race safety checks for all performance categories."
                />
                <TimelineItem 
                  date="2026-05-16" 
                  title="Qualification Rounds (201m)" 
                  description="Initial timing trials for Bracket and FFA classes." 
                  delay={0.1}
                />
                <TimelineItem 
                  date="2026-05-17" 
                  title="Final Championship" 
                  description="Final eliminations and MURI record official attempt." 
                  delay={0.2}
                />
                <TimelineItem 
                  date="2026-05-17" 
                  title="Awards Gala & Entertainment Night" 
                  description="Celebrating the winners with live headliner performances." 
                  delay={0.3}
                />
              </>
            )}
            
            {/* Legend Line */}
            <div className="absolute left-2 top-2 bottom-0 w-px bg-zinc-100 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};
