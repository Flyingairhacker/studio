
import GlassCard from '@/components/ui/glass-card';
import { Gamepad2 } from 'lucide-react';
import SequenceBreaker from './sequence-breaker';
import CodeCracker from './code-cracker';
import GlitchHunt from './glitch-hunt';
import FirewallBreach from './firewall-breach';
import DataFlow from './data-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const AsteroidDefense = dynamic(() => import('./asteroid-defense'), {
  loading: () => <Skeleton className="h-[460px] w-full max-w-sm mx-auto" />,
  ssr: false,
});


export default function GamesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-glow">
          Training Simulations
        </h1>
        <p className="text-muted-foreground">
          Hone your cognitive abilities with these training exercises.
        </p>
      </div>

      <GlassCard className="p-6">
        <Tabs defaultValue="sequence-breaker">
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
             <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <Gamepad2 className="text-primary" /> Sequence Breaker
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Observe the sequence and repeat it. The sequence gets longer with each
              successful attempt. One mistake, and the system resets.
            </p>
            <SequenceBreaker />
          </TabsContent>
          <TabsContent value="code-cracker" className="mt-6">
             <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <Gamepad2 className="text-primary" /> Code Cracker
            </h2>
             <p className="text-sm text-muted-foreground mb-4">
              Crack the 4-digit secret code. After each guess, you'll see how many digits are in the correct position (Hits) and how many are correct but in the wrong position (Blows).
            </p>
            <CodeCracker />
          </TabsContent>
          <TabsContent value="glitch-hunt" className="mt-6">
             <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <Gamepad2 className="text-primary" /> Glitch Hunt
            </h2>
             <p className="text-sm text-muted-foreground mb-4">
                A glitch is causing rapid fluctuations in the system grid. Click the unstable cells before they disappear to stabilize the system and score points.
            </p>
            <GlitchHunt />
          </TabsContent>
          <TabsContent value="firewall-breach" className="mt-6">
             <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <Gamepad2 className="text-primary" /> Firewall Breach
            </h2>
             <p className="text-sm text-muted-foreground mb-4">
                Accurately type the data packet before the timer runs out to breach the firewall and score points.
            </p>
            <FirewallBreach />
          </TabsContent>
           <TabsContent value="asteroid-defense" className="mt-6">
             <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <Gamepad2 className="text-primary" /> Asteroid Defense
            </h2>
             <p className="text-sm text-muted-foreground mb-4">
                Type the words on the falling asteroids to destroy them before they hit your base.
            </p>
            <AsteroidDefense />
          </TabsContent>
          <TabsContent value="data-flow" className="mt-6">
             <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <Gamepad2 className="text-primary" /> Data Flow
            </h2>
             <p className="text-sm text-muted-foreground mb-4">
                Rotate the tiles to connect the source to the destination and complete the data circuit.
            </p>
            <DataFlow />
          </TabsContent>
        </Tabs>
      </GlassCard>
    </div>
  );
}
