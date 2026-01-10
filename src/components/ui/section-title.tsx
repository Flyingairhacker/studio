import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface SectionTitleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle: string;
}

const SectionTitle = ({ title, subtitle, className, ...props }: SectionTitleProps) => {
  return (
    <div className={cn("text-center", className)} {...props}>
      <h2 className="font-headline text-4xl md:text-5xl font-bold">
        <span className="text-glow">{title.charAt(0)}</span>
        {title.slice(1)}
      </h2>
      <p className="mt-2 max-w-2xl mx-auto text-lg text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
};

export default SectionTitle;
