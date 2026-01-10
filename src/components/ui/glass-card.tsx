import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const GlassCard = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "glass-card transition-all duration-300 ease-in-out",
      className
    )}
    {...props}
  />
);

export default GlassCard;
