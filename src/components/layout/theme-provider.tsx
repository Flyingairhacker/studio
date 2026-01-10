
"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("cyber-architect-theme");
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        if (theme) {
            Object.entries(theme).forEach(([key, value]) => {
              if (typeof value === 'string') {
                document.documentElement.style.setProperty(`--${key}`, value);
              }
            });
        }
      } catch (e) {
        console.error("Failed to parse theme from localStorage", e);
      }
    }
    setIsMounted(true);
  }, []);

  return <>{children}</>;
}
