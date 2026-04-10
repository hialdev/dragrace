"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MuriRecord } from "@/components/MuriRecord";
import { RaceClasses } from "@/components/RaceClasses";
import { Prizes } from "@/components/Prizes";
import { Registration } from "@/components/Registration";
import { GuestStars } from "@/components/GuestStars";
import { Timeline } from "@/components/Timeline";
import { Partners } from "@/components/Partners";
import { Footer } from "@/components/Footer";
import { Values } from "@/components/Values";
import { 
  getCMSContent, 
  getRaceHierarchy, 
  getValues, 
  getPrizeStructure, 
  getRegistrationSteps, 
  getStarGuests, 
  getPartners, 
  getTimeline 
} from "@/lib/api/content";
import { 
  CMSContent, 
  RaceClassHierarchy, 
  ValueItem, 
  PrizeCategory, 
  RegistrationStep, 
  StarGuest, 
  Partner, 
  TimelineEvent 
} from "@/lib/types/content";

function CtaButton() {
  const { isAuthenticated } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  const href = isAuthenticated ? "/dashboard/team/orders" : "/register";
  const label = isAuthenticated ? "Daftar Pit" : "Register / Apply / Reserve";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 bg-[#b80014] hover:bg-[#e21b23] text-white px-8 py-4 rounded-full font-bold text-lg tracking-widest uppercase shadow-xl hover:scale-105 transition-all"
    >
      <span className="material-symbols-outlined text-[24px]">flag</span>
      {label}
    </Link>
  );
}

export default function Home() {
  const [data, setData] = useState<{
    content: CMSContent;
    classes: RaceClassHierarchy[];
    values: ValueItem[];
    prizes: PrizeCategory[];
    steps: RegistrationStep[];
    guests: StarGuest[];
    partners: Partner[];
    events: TimelineEvent[];
    loading: boolean;
  }>({
    content: {},
    classes: [],
    values: [],
    prizes: [],
    steps: [],
    guests: [],
    partners: [],
    events: [],
    loading: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          content, 
          classes, 
          values, 
          prizes, 
          steps, 
          guests, 
          partners, 
          events
        ] = await Promise.all([
          getCMSContent(),
          getRaceHierarchy(),
          getValues(),
          getPrizeStructure(),
          getRegistrationSteps(),
          getStarGuests(),
          getPartners(),
          getTimeline()
        ]);

        setData({
          content,
          classes,
          values,
          prizes,
          steps,
          guests,
          partners,
          events,
          loading: false
        });
        
        // Update favicon dynamically if site_favicon exists
        if (content.site_favicon) {
           const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
           if (link) {
             link.href = content.site_favicon;
           } else {
             const newLink = document.createElement("link");
             newLink.rel = "icon";
             newLink.href = content.site_favicon;
             document.head.appendChild(newLink);
           }
        }
        
        // Update title dynamically
        if (content.site_name) {
          document.title = content.site_name;
        }
      } catch (error) {
        console.error("Failed to fetch landing page data:", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar logo={data.content.site_logo} siteName={data.content.site_name} />
      <main className="flex-grow">
        <div id="about">
          <Hero content={data.content} />
          <MuriRecord content={data.content} />
          <Values items={data.values} />
        </div>
        <div id="race-classes">
          <RaceClasses classes={data.classes} />
        </div>
        <div id="prize">
          <Prizes classes={data.classes} prizes={data.prizes} content={data.content} />
        </div>
        <Registration steps={data.steps} ctaButton={<CtaButton />} content={data.content} />
        <div className="checkered-divider" />
        <div id="star-guest">
          <GuestStars guests={data.guests} content={data.content} />
        </div>
        <div className="checkered-divider" />
        <Partners partners={data.partners} content={data.content} />
        <div id="timeline">
          <Timeline events={data.events} content={data.content} />
        </div>
      </main>
      <Footer content={data.content} />
    </div>
  );
}
