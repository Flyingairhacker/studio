import { Button } from "../ui/button";
import { ArrowDown, Code } from "lucide-react";

const AnimatedText = ({ text }: { text: string }) => {
  return (
    <span className="relative inline-block">
      {text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="inline-block"
          style={{ animation: `fadeInUp 0.8s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

const Hero = () => {
  return (
    <section className="relative container mx-auto flex min-h-[calc(100vh-80px)] items-center px-4 py-20 md:px-6">
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="font-headline text-[25vw] lg:text-[20vw] font-black text-foreground/5 select-none">
          ENGINEER
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter">
            <span className="block text-primary text-glow"><AnimatedText text="Flutter & IoT" /></span>
            <span className="block text-primary-foreground"><AnimatedText text="Systems Architect" /></span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Specializing in creating robust, scalable, and intelligent systems by bridging the gap between embedded hardware and high-performance mobile applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <a href="#projects">
                <Code className="mr-2"/> View Projects
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
               <a href="#contact">
                Contact Me <ArrowDown className="ml-2 animate-bounce"/>
              </a>
            </Button>
          </div>
        </div>
        <div className="relative h-80 md:h-[500px] w-full">
            <div className="w-full h-full glass-card p-4">
                <div className="w-full h-full border border-dashed border-foreground/20 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground font-code">[ Interactive 3D Model Placeholder ]</p>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
