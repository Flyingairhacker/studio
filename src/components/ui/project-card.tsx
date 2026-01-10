"use client";

import type { Project } from "@/lib/types";
import { useRef } from "react";
import Image from "next/image";
import { ArrowUpRight, Code, Globe, Laptop, Server, Smartphone } from "lucide-react";
import GlassCard from "./glass-card";
import { Button } from "./button";
import { Badge } from "./badge";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const systemIcons = {
  Mobile: Smartphone,
  IoT: Server,
  Desktop: Laptop,
  Web: Globe,
};

const ProjectCard = ({ project }: { project: Project }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  const glowX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(y, [-0.5, 0.5], ["0%", "100%"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const SystemIcon = systemIcons[project.systemType];

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      className="relative"
    >
      <GlassCard
        className="group relative overflow-hidden p-0 w-full h-full"
        style={{ transform: "translateZ(8px)", transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glowX.get()} ${glowY.get()}, hsl(var(--primary) / 0.1), transparent 40%)`,
          }}
        />
        <div 
          className="relative z-20 flex h-full flex-col"
          style={{ transform: "translateZ(16px)" }}
        >
          <div className="relative h-52 w-full overflow-hidden">
            <Image
              src={project.imageUrl}
              alt={project.title}
              data-ai-hint={project.imageHint}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <Badge
              variant="default"
              className="absolute top-3 right-3 bg-primary/20 border-primary/50 text-primary-foreground backdrop-blur-sm"
            >
              <SystemIcon className="mr-2 h-4 w-4" />
              {project.systemType}
            </Badge>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-headline text-2xl font-bold text-primary-foreground">{project.title}</h3>
            <p className="mt-2 text-muted-foreground flex-grow">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-secondary/10 text-secondary">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="border-t border-foreground/10 p-4 flex gap-2">
            {project.repoUrl && (
              <Button asChild variant="ghost" className="w-full">
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                  <Code className="mr-2 h-4 w-4" />
                  Repository
                </a>
              </Button>
            )}
            {project.liveUrl && (
              <Button asChild variant="default" className="w-full bg-primary/10 text-primary-foreground hover:bg-primary/20">
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  Live Demo
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ProjectCard;
