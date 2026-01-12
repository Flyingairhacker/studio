
"use client";

import { Button } from "../ui/button";
import { ArrowDown, Code } from "lucide-react";
import { useDoc, useFirestore, useMemoFirebase, useFirebaseServicesAvailable } from "@/firebase";
import type { Bio } from "@/lib/types";
import { doc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import ModelViewer from "../3d/model-viewer";
import { useEffect, useState } from "react";

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

const defaultBio: Bio = {
    id: "local-bio",
    name: "Rohit Kumar",
    title: "Flutter & IoT Developer",
    description: "Results-driven Flutter Developer with hands-on experience in mobile application development, specializing in Android (Java) and cross-platform solutions using Flutter. Skilled in building scalable, high-performance apps, implementing unit testing, and collaborating within Agile teams.",
    avatarUrl: "",
    modelUrl: "https://sketchfab.com/models/0c74ca18fa6a4d05be9fe6ffa2206db8/embed"
};


const Hero = () => {
  const servicesAvailable = useFirebaseServicesAvailable();
  const firestore = useFirestore();
  const bioRef = useMemoFirebase(() => (firestore && servicesAvailable) ? doc(firestore, "bio", "main-bio") : null, [firestore, servicesAvailable]);
  const { data: remoteBio, isLoading: isRemoteBioLoading } = useDoc<Bio>(bioRef);

  const [bio, setBio] = useState<Bio>(defaultBio);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!servicesAvailable) {
        setBio(defaultBio);
        setIsLoading(false);
        return;
    }
    
    if (!isRemoteBioLoading) {
        setBio(remoteBio || defaultBio);
        setIsLoading(false);
    }
  }, [servicesAvailable, isRemoteBioLoading, remoteBio]);

  return (
    <section className="relative container mx-auto flex min-h-[calc(100vh-80px)] items-center px-4 py-20 md:px-6">
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="font-headline text-[25vw] lg:text-[20vw] font-black text-foreground/5 select-none">
          DEVELOPER
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-36" />
                <Skeleton className="h-12 w-36" />
              </div>
            </>
          ) : (
            <>
              <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter">
                <span className="block text-primary text-glow"><AnimatedText text={bio?.name ?? "Rohit Kumar"} /></span>
                <span className="block text-primary-foreground"><AnimatedText text={bio?.title ?? "Flutter & IoT Developer"} /></span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                {bio?.description ?? "Results-driven Flutter Developer with hands-on experience in mobile application development, specializing in Android (Java) and cross-platform solutions using Flutter."}
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
            </>
          )}
        </div>
        <div className="relative h-80 md:h-[500px] w-full">
            <div className="w-full h-full glass-card p-4">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ModelViewer modelUrl={bio?.modelUrl ?? "https://sketchfab.com/models/0c74ca18fa6a4d05be9fe6ffa2206db8/embed"} />
                )}
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
