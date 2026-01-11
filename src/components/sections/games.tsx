"use client";

import { useDoc, useFirestore, useMemoFirebase, useFirebaseServicesAvailable } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Bio } from "@/lib/types";
import SequenceBreaker from "@/app/admin/games/sequence-breaker";
import SectionTitle from "../ui/section-title";
import GlassCard from "../ui/glass-card";
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

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
            <GlassCard className="max-w-3xl mx-auto mt-16 p-8">
                <SequenceBreaker />
            </GlassCard>
        </section>
    );
}
