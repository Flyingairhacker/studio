"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const savedTheme = localStorage.getItem("cyber-architect-theme");
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        // Ensure theme object exists and has the required properties
        if (theme && theme.background && theme.primary && theme.accent) {
            document.documentElement.style.setProperty("--background", theme.background);
            document.documentElement.style.setProperty("--primary", theme.primary);
            document.documentElement.style.setProperty("--accent", theme.accent);
            // Also set secondary to keep it in sync with accent
            document.documentElement.style.setProperty("--secondary", theme.accent);
        }
      } catch (e) {
        console.error("Failed to parse theme from localStorage", e);
      }
    }
    // Set mounted to true after the first client-side run
    setIsMounted(true);
  }, []); // Empty dependency array ensures this runs only once on mount

  // We can return the children directly. The theme is applied via side-effect.
  // The isMounted state is no longer strictly necessary for rendering children,
  // but keeping the effect structure is key to solving the hydration issue.
  return <>{children}</>;
}
