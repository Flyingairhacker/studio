import { FirebaseClientProvider } from "@/firebase/client-provider";
import BioForm from "./bio-form";
import GlassCard from "@/components/ui/glass-card";

export default function BioPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-glow">
          Architect Bio
        </h1>
        <p className="text-muted-foreground">
          Manage your public-facing professional identity.
        </p>
      </div>

      <GlassCard className="p-6">
        <FirebaseClientProvider>
          <BioForm />
        </FirebaseClientProvider>
      </GlassCard>
    </div>
  );
}
