
"use client";

import { useDoc, useFirestore, useMemoFirebase, useFirebaseServicesAvailable } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Bio } from "@/lib/types";
import SequenceBreaker from "@/app/admin/games/sequence-breaker";
import CodeCracker from "@/app/admin/games/code-cracker";
import GlitchHunt from "@/app/admin/games/glitch-hunt";
import FirewallBreach from "@/app/admin/games/firewall-breach";
import DataFlow from "@/app/admin/games/data-flow";
import SectionTitle from "../ui/section-title";
import GlassCard from "../ui/glass-card";
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import dynamic from 'next/dynamic';

const AsteroidDefense = dynamic(() => import('@/app/admin/games/asteroid-defense'), {
  loading: () => <Skeleton className="h-[460px] w-full max-w-sm mx-auto" />,
  ssr: false,
});


export default function GamesSection() {
    const servicesAvailable = useFirebaseServicesAvailable();
    const firestore = useFirestore();
    const bioRef = useMemoFirebase(() => (firestore && servicesAvailable) ? doc(firestore, "bio", "main-bio") : null, [firestore, servicesAvailable]);
    const { data: remoteBio, isLoading: isRemoteBioLoading } = useDoc<Bio>(bioRef);

    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!servicesAvailable) {
            setIsVisible(false);
            setIsLoading(false);
            return;
        }
        
        if (!isRemoteBioLoading) {
            setIsVisible(remoteBio?.showGamesSection ?? false);
            setIsLoading(false);
        }
    }, [servicesAvailable, isRemoteBioLoading, remoteBio]);

    if (isLoading) {
        return (
            <section className="container mx-auto px-4 py-20 md:px-6 md:py-32">
                <div className="text-center">
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
                </div>
                <div className="max-w-3xl mx-auto mt-16">
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </section>
        );
    }
    
    if (!isVisible) {
        return null;
    }

    return (
        <section id="games" className="container mx-auto px-4 py-20 md:px-6 md:py-32">
            <SectionTitle
                title="Training Simulations"
                subtitle="Hone your cognitive abilities with these training exercises."
            />
            <GlassCard className="max-w-4xl mx-auto mt-16 p-8">
                 <Tabs defaultValue="sequence-breaker" className="w-full">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="inline-flex h-auto">
                            <TabsTrigger value="sequence-breaker">Sequence Breaker</TabsTrigger>
                            <TabsTrigger value="code-cracker">Code Cracker</TabsTrigger>
                            <TabsTrigger value="glitch-hunt">Glitch Hunt</TabsTrigger>
                            <TabsTrigger value="firewall-breach">Firewall Breach</TabsTrigger>
                            <TabsTrigger value="asteroid-defense">Asteroid Defense</TabsTrigger>
                            <TabsTrigger value="data-flow">Data Flow</TabsTrigger>
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <TabsContent value="sequence-breaker" className="mt-6">
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          Observe the sequence and repeat it. The sequence gets longer with each
                          successful attempt. One mistake, and the system resets.
                        </p>
                        <SequenceBreaker />
                    </TabsContent>
                    <TabsContent value="code-cracker" className="mt-6">
                        <p className="text-sm text-center text-muted-foreground mb-4">
                            Crack the 4-digit secret code. After each guess, you'll see how many digits are in the correct position (Hits) and how many are correct but in the wrong position (Blows).
                        </p>
                        <CodeCracker />
                    </TabsContent>
                    <TabsContent value="glitch-hunt" className="mt-6">
                        <p className="text-sm text-center text-muted-foreground mb-4">
                            Click the unstable cells before they disappear to score points.
                        </p>
                        <GlitchHunt />
                    </TabsContent>
                     <TabsContent value="firewall-breach" className="mt-6">
                        <p className="text-sm text-center text-muted-foreground mb-4">
                            Accurately type the data packet before the timer runs out to breach the firewall and score points.
                        </p>
                        <FirewallBreach />
                    </TabsContent>
                    <TabsContent value="asteroid-defense" className="mt-6">
                        <p className="text-sm text-center text-muted-foreground mb-4">
                            Type the words on the falling asteroids to destroy them before they hit your base.
                        </p>
                        <AsteroidDefense />
                    </TabsContent>
                    <TabsContent value="data-flow" className="mt-6">
                         <p className="text-sm text-center text-muted-foreground mb-4">
                            Rotate the tiles to connect the source to the destination and complete the data circuit.
                        </p>
                        <DataFlow />
                    </TabsContent>
                </Tabs>
            </GlassCard>
        </section>
    );
}
