"use client";

import React from "react";
import { motion } from "framer-motion";
import { RegistrationStep } from "../lib/types/content";

const Step = ({ 
  number, 
  title, 
  description, 
  delay = 0 
}: { 
  number: string; 
  title: string; 
  description: string; 
  delay?: number 
}) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="flex gap-8 group"
  >
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center font-headline text-lg font-bold group-hover:bg-primary group-hover:text-white transition-colors">
        {number}
      </div>
      <div className="flex-grow w-px bg-zinc-100 my-4" />
    </div>
    <div className="pt-2">
      <h3 className="font-headline text-2xl mb-3">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export const Registration = ({ 
  steps, 
  ctaButton,
  content 
}: { 
  steps: RegistrationStep[]; 
  ctaButton?: React.ReactNode;
  content: Record<string, string>;
}) => {
  return (
    <section className="bg-surface py-32 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-20">
        <div className="w-full lg:w-1/2">
          <motion.label 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary mb-4 block"
          >
            {content.regist_subtitle || "Secure Your Position"}
          </motion.label>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-headline text-[3.5rem] leading-[1.1] tracking-tighter mb-8"
          >
            {content.regist_title || "Registration Process"}
          </motion.h2>
          <div className="max-w-md mb-12">
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Experience the evolution of drag racing. Follow our streamlined process to join the roster of legends.
            </p>
          </div>
          <div className="hidden lg:block">
            {ctaButton}
          </div>
        </div>

        <div className="w-full lg:w-1/2 space-y-2">
          {steps.length > 0 ? (
            steps.map((step, idx) => (
              <Step 
                key={step.id}
                number={step.position}
                title={step.title}
                description={step.description}
                delay={idx * 0.2}
              />
            ))
          ) : (
            <>
              <Step 
                number="01" 
                title="Technical Submission" 
                description="Upload your vehicle specifications and modifications for initial class placement and safety screening."
                delay={0}
              />
              <Step 
                number="02" 
                title="Verification" 
                description="Our technical committee reviews all submissions to ensure fairness and adherence to class regulations." 
                delay={0.2}
              />
              <Step 
                number="03" 
                title="Official Entry" 
                description="Complete your registration payment to secure your pit-stop slot and race timing transponder." 
                delay={0.4}
              />
            </>
          )}
          
          <div className="lg:hidden pt-8">
            {ctaButton}
          </div>
        </div>
      </div>
    </section>
  );
};
