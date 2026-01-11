"use client";

import { motion, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const scaleX = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Show progress bar on path change
    setVisible(true);
    scaleX.set(0.2); // Start with a small progress
    
    const timeout = setTimeout(() => {
        // Simulate loading completion
        scaleX.set(1);
    }, 300);

    const hideTimeout = setTimeout(() => {
        setVisible(false);
        setTimeout(() => scaleX.set(0), 200); // Reset after fade out
    }, 800);

    return () => {
        clearTimeout(timeout);
        clearTimeout(hideTimeout);
    };

  }, [pathname, scaleX]);

  return (
    <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary text-glow z-[9999]"
        style={{
            transformOrigin: "0%",
            scaleX,
            opacity: visible ? 1 : 0,
            transition: "opacity 0.2s ease-out"
        }}
    />
  );
}
