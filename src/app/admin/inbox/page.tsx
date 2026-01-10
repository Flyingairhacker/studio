import GlassCard from "@/components/ui/glass-card";
import { MessageList } from "./message-list";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export default function AdminInboxPage() {
  
  return (
    <div className="space-y-8">
       <div>
          <h1 className="text-3xl font-headline font-bold text-glow">
            Secure Inbox
          </h1>
          <p className="text-muted-foreground">Review incoming transmissions.</p>
        </div>

      <GlassCard className="p-0">
        <FirebaseClientProvider>
          <MessageList />
        </FirebaseClientProvider>
      </GlassCard>
    </div>
  );
}
