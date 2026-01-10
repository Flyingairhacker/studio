"use client";

import { motion } from "framer-motion";
import ProjectCard from "../ui/project-card";
import SectionTitle from "../ui/section-title";
import type { Project } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "../ui/skeleton";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

const Projects = () => {
  const firestore = useFirestore();

  const projectsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "projects"), orderBy("title", "asc"));
  }, [firestore]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="projects" className="container mx-auto px-4 py-20 md:px-6 md:py-32">
      <SectionTitle
        title="Featured Deployments"
        subtitle="A selection of case studies demonstrating my capabilities in architecture, development, and system integration."
      />
       {isLoading ? (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[450px] w-full rounded-lg" />
            <Skeleton className="h-[450px] w-full rounded-lg" />
            <Skeleton className="h-[450px] w-full rounded-lg" />
            <Skeleton className="h-[450px] w-full rounded-lg" />
          </div>
        ) : (
      <motion.div
        className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {projects?.map((project) => (
          <motion.div key={project.id} variants={itemVariants}>
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>
      )}
    </section>
  );
};

export default Projects;
