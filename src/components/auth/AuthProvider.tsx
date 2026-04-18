"use client";

import { useEffect } from "react";
import { initAuth } from "@/store/authStore";
import { getCMSContent } from "@/lib/api/content";

/**
 * AuthProvider — mounts once at root, initializes PocketBase auth sync.
 * Also handles global branding (favicon and site name) from CMS.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAuth();

    // Fetch site branding
    getCMSContent().then((content) => {
      // Dynamic Favicon
      if (content.site_favicon) {
        const link = (document.querySelector("link[rel~='icon']") || 
                     document.createElement("link")) as HTMLLinkElement;
        link.rel = "icon";
        link.href = content.site_favicon;
        if (!document.head.contains(link)) {
          document.head.appendChild(link);
        }
      }

      // Dynamic Title (Global fallback)
      if (content.site_name && !document.title.includes("|")) {
        document.title = content.site_name;
      }
    }).catch(err => console.error("Failed to load global branding:", err));
  }, []);

  return <>{children}</>;
}
