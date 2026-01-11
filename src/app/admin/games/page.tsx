import GlassCard from '@/components/ui/glass-card';
import { Gamepad2 } from 'lucide-react';
import SequenceBreaker from './sequence-breaker';

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
        <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
          <Gamepad2 className="text-primary" /> Sequence Breaker
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Observe the sequence and repeat it. The sequence gets longer with each
          successful attempt. One mistake, and the system resets.
        </p>
        <SequenceBreaker />
      </GlassCard>
    </div>
  );
}
