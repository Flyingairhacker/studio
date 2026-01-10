import DescriptionGenerator from "@/app/admin/ai-tools/description-generator";
import GlassCard from "@/components/ui/glass-card";
import { Bot } from "lucide-react";

export default function AiToolsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-glow">
          AI Toolbox
        </h1>
        <p className="text-muted-foreground">
          Leverage generative AI to accelerate content creation.
        </p>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
            <Bot className="text-primary"/> Project Description Generator
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
            Provide a few keywords, and the AI will craft a compelling project description for you.
        </p>
        <DescriptionGenerator />
      </GlassCard>
    </div>
  );
}
