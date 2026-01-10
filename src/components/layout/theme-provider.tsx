"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("cyber-architect-theme");
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      document.documentElement.style.setProperty("--background", theme.background);
      document.documentElement.style.setProperty("--primary", theme.primary);
      document.documentElement.style.setProperty("--accent", theme.accent);
      document.documentElement.style.setProperty("--secondary", theme.accent);
    }
    setIsMounted(true);
  }, []);

  // Render children immediately but apply theme once mounted to avoid flash
  return <>{children}</>;
}
