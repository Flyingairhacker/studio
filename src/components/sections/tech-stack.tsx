"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/glass-card";
import SectionTitle from "../ui/section-title";
import * as LucideIcons from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { TechStack as TechStackType } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

type LucideIconName = keyof typeof LucideIcons;

const TechCard = ({ name, iconName, color }: { name: string; iconName: string; color: string }) => {
  const Icon = LucideIcons[iconName as LucideIconName] as React.ElementType || LucideIcons['Code'];
  const safeColor = color.startsWith('hsl') ? color : `hsl(${color})`;

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
        <GlassCard className="group relative aspect-square flex flex-col items-center justify-center gap-4 p-6 transition-all duration-300">
        <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
            style={{
            background: `radial-gradient(circle at 50% 100%, ${safeColor.replace(')', ' / 0.1)').replace('hsl(','hsla(')}, transparent 70%)`
            }}
        />
        <div 
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"
        />
        <Icon className="h-16 w-16 transition-all duration-300 group-hover:scale-110" style={{ color: safeColor }} />
        <h3 className="font-headline text-xl font-bold text-primary-foreground transition-colors duration-300 group-hover:text-glow" style={{'--tw-text-shadow-color': safeColor, textShadow: `0 0 8px ${safeColor}`}}>{name}</h3>
        <div 
            className="absolute bottom-0 h-0.5 w-0 group-hover:w-1/2 transition-all duration-300"
            style={{ background: safeColor }}
        />
        </GlassCard>
    </motion.div>
  );
}

const TechStack = () => {
    const firestore = useFirestore();
    const techStacksQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "tech_stacks"), orderBy("name", "asc"));
    }, [firestore]);

    const { data: tech, isLoading } = useCollection<TechStackType>(techStacksQuery);

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    }
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

  return (
    <section id="tech-stack" className="container mx-auto px-4 py-20 md:px-6 md:py-32">
      <SectionTitle
        title="Core Systems"
        subtitle="A curated selection of technologies I leverage to build robust and scalable digital ecosystems."
      />
       {isLoading ? (
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
        </div>
       ) : (
      <motion.div 
        className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        >
        {tech?.map((t) => (
          <motion.div key={t.id} variants={itemVariants}>
            <TechCard {...t} />
          </motion.div>
        ))}
      </motion.div>
      )}
    </section>
  );
};

export default TechStack;
