
'use client';

import { useState, useTransition } from 'react';
import { Bot, Image, Loader2, Wand2 } from 'lucide-react';
import { generateSceneInfo, type GenerateSceneInfoOutput } from '@/ai/flows/generate-scene-info';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SceneControlProps {
  onSceneInfoChange: (info: GenerateSceneInfoOutput) => void;
}

export default function SceneControl({ onSceneInfoChange }: SceneControlProps) {
  const [prompt, setPrompt] = useState('a rainy night in tokyo');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!prompt) return;

    startTransition(async () => {
      try {
        const result = await generateSceneInfo({ location: prompt });
        onSceneInfoChange(result);
        toast({
          title: "Scene Updated",
          description: `Weather set to ${result.weather}, terrain set to ${result.terrain}.`,
        });
      } catch (error) {
        console.error("Failed to generate scene info:", error);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not generate scene information from the prompt.",
        });
      }
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="glass-card flex items-center gap-2 p-2 rounded-lg">
        <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary ml-2"/>
            <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a scene..."
            className="w-64 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isPending}
            />
        </div>
        <Button onClick={handleGenerate} disabled={isPending} size="sm">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
