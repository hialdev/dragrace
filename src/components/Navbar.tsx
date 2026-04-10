"use client";

import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

export const Navbar = ({ logo, siteName }: { logo?: string; siteName?: string }) => {
  const { isAuthenticated } = useAuthStore();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    setIsReady(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled ? "bg-surface/80 backdrop-blur-md py-4 shadow-sm" : "bg-transparent py-6"
    }`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
            {logo ? (
              <img src={logo} alt={siteName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xl tracking-tighter italic">W</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg leading-none tracking-tight group-hover:text-primary transition-colors">
              {siteName || "THE STAR DRAG RACE"}
            </span>
            <span className="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-zinc-400 leading-none mt-1">
              Power Unleashed
            </span>
          </div>
        </Link>

            <div className="hidden md:flex items-center gap-10">
               <a
                  className="font-headline font-light tracking-tighter text-zinc-500 hover:text-zinc-900 transition-colors"
                  href="#about"
               >
                  About
               </a>
               <a
                  className="font-headline font-light tracking-tighter text-zinc-500 hover:text-zinc-900 transition-colors"
                  href="#race-classes"
               >
                  Race Class
               </a>
               <a
                  className="font-headline font-light tracking-tighter text-zinc-500 hover:text-zinc-900 transition-colors"
                  href="#prize"
               >
                  Prize
               </a>
               <a
                  className="font-headline font-light tracking-tighter text-zinc-500 hover:text-zinc-900 transition-colors"
                  href="#star-guest"
               >
                  Star Guest
               </a>
               <a
                  className="font-headline font-light tracking-tighter text-zinc-500 hover:text-zinc-900 transition-colors"
                  href="#timeline"
               >
                  Timeline
               </a>
            </div>

            {isReady && (
               <Link
                  href={
                     isAuthenticated ? "/dashboard/team/orders" : "/register"
                  }
                  className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all inline-block"
               >
                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="w-full h-full"
                  >
                     {isAuthenticated ? "My Orders" : "Reserve Entry"}
                  </motion.div>
               </Link>
            )}
         </div>
      </nav>
   );
};
