import GlassCard from "@/components/ui/glass-card";
import TechStackList from "./tech-stack-list";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export default async function AdminTechStacksPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold text-glow">
                    Tech Stacks
                </h1>
                <p className="text-muted-foreground">Manage your core technologies.</p>
            </div>

            <GlassCard className="p-0 md:p-0">
                <FirebaseClientProvider>
                    <TechStackList />
                </FirebaseClientProvider>
            </GlassCard>
        </div>
    );
}
