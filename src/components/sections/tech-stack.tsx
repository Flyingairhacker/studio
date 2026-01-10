"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/glass-card";
import SectionTitle from "../ui/section-title";
import { Server, Smartphone, Cpu, Bot, Cloud, Database } from 'lucide-react';

const tech = [
  { name: 'Flutter', Icon: Smartphone, color: 'hsl(198, 89%, 48%)' },
  { name: 'Dart', Icon: Cpu, color: 'hsl(200, 95%, 53%)' },
  { name: 'Firebase', Icon: Database, color: 'hsl(38, 96%, 56%)' },
  { name: 'IoT Core', Icon: Server, color: 'hsl(135, 62%, 45%)' },
  { name: 'GenAI', Icon: Bot, color: 'hsl(255, 90%, 66%)' },
  { name: 'Cloud Functions', Icon: Cloud, color: 'hsl(217, 91%, 60%)' },
];

const TechCard = ({ name, Icon, color }: { name: string; Icon: React.ElementType; color: string }) => {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
        <GlassCard className="group relative aspect-square flex flex-col items-center justify-center gap-4 p-6 transition-all duration-300">
        <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
            style={{
            background: `radial-gradient(circle at 50% 100%, ${color}1A, transparent 70%)`
            }}
        />
        <div 
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"
        />
        <Icon className="h-16 w-16 transition-all duration-300 group-hover:scale-110" style={{ color }} />
        <h3 className="font-headline text-xl font-bold text-primary-foreground transition-colors duration-300 group-hover:text-glow" style={{'--tw-text-shadow-color': color, textShadow: `0 0 8px ${color}`}}>{name}</h3>
        <div 
            className="absolute bottom-0 h-0.5 w-0 group-hover:w-1/2 transition-all duration-300"
            style={{ background: color }}
        />
        </GlassCard>
    </motion.div>
  );
}

const TechStack = () => {

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
      <motion.div 
        className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        >
        {tech.map((t) => (
          <motion.div key={t.name} variants={itemVariants}>
            <TechCard {...t} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default TechStack;
