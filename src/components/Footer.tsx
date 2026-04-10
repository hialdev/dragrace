"use client";

import React from "react";

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    className="font-body text-[0.6875rem] uppercase tracking-[0.1em] font-bold text-zinc-400 hover:text-primary transition-all duration-500" 
    href={href}
  >
    {children}
  </a>
);

export const Footer = ({ content }: { content: Record<string, string> }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-20 px-6 md:px-12 bg-[#edeef0]">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8 mb-16">
          <div className="text-xl font-medium tracking-widest text-zinc-900 font-headline uppercase">
            {content.site_name || "MOBIL 1 LUXE"}
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            <FooterLink href="#about">About</FooterLink>
            <FooterLink href="#race-classes">Race Class</FooterLink>
            <FooterLink href="#prize">Prize</FooterLink>
            <FooterLink href="#star-guest">Star Guest</FooterLink>
            <FooterLink href="#timeline">Timeline</FooterLink>
          </div>
        </div>
        <div className="text-center text-[0.6875rem] font-bold tracking-[0.1em] text-zinc-400 uppercase">
          © {currentYear} {content.site_footer || "MOBIL 1 ETHEREAL SHOWROOM. ALL RIGHTS RESERVED."}
        </div>
      </div>
    </footer>
  );
};
