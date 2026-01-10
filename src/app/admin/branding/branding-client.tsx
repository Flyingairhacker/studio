"use client";

import { useState, useEffect, useTransition } from "react";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Palette, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateTheme } from "./actions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const hslStringToObject = (hslString: string) => {
    const [h, s, l] = hslString.split(" ").map(v => parseInt(v.replace('%', '')));
    return { h, s, l };
}

const hslObjectToHex = (hsl: {h: number, s: number, l: number}) => {
    return hslToHex(hsl.h, hsl.s, hsl.l);
}


export default function BrandingClient() {
  const [theme, setTheme] = useState({
    background: "224 41% 3%",
    primary: "192 100% 50%",
    accent: "256 90% 66%",
  });
  const [isMounted, setIsMounted] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem("cyber-architect-theme");
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.style.setProperty("--background", theme.background);
      document.documentElement.style.setProperty("--primary", theme.primary);
      document.documentElement.style.setProperty("--accent", theme.accent);
      document.documentElement.style.setProperty("--secondary", theme.accent);
    }
  }, [theme, isMounted]);

  const handleColorChange = (colorName: keyof typeof theme, value: string) => {
    const hsl = hslStringToObject(value);
    setTheme((prev) => ({ ...prev, [colorName]: `${hsl.h} ${hsl.s}% ${hsl.l}%` }));
  };
  
  const handleHexColorChange = (colorName: keyof typeof theme, hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);

    const r_ = r / 255, g_ = g / 255, b_ = b / 255;
    const max = Math.max(r_, g_, b_), min = Math.min(r_, g_, b_);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r_: h = (g_ - b_) / d + (g_ < b_ ? 6 : 0); break;
            case g_: h = (b_ - r_) / d + 2; break;
            case b_: h = (r_ - g_) / d + 4; break;
        }
        h /= 6;
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    setTheme((prev) => ({ ...prev, [colorName]: `${h} ${s}% ${l}%` }));
  };

  const saveTheme = () => {
    localStorage.setItem("cyber-architect-theme", JSON.stringify(theme));
    toast({
      title: "Theme Saved",
      description: "Your new color palette has been applied and saved.",
    });
  };

  const handleGenerateTheme = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateTheme({ prompt: aiPrompt });
      if (result.error) {
        setError(result.error);
      } else if (result.theme) {
        setTheme(result.theme as any);
        toast({
          title: "AI Theme Generated",
          description: "The new theme has been applied. Don't forget to save!",
        });
      }
    });
  };

  if (!isMounted) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-glow">
          System Aesthetics
        </h1>
        <p className="text-muted-foreground">
          Customize the look and feel of your portfolio.
        </p>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
            <Palette className="text-primary"/> Color Palette
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="background-color">Background</Label>
            <Input
              id="background-color"
              type="color"
              value={hslObjectToHex(hslStringToObject(theme.background))}
              onChange={(e) => handleHexColorChange("background", e.target.value)}
              className="h-12"
            />
          </div>
          <div>
            <Label htmlFor="primary-color">Primary</Label>
            <Input
              id="primary-color"
              type="color"
              value={hslObjectToHex(hslStringToObject(theme.primary))}
              onChange={(e) => handleHexColorChange("primary", e.target.value)}
              className="h-12"
            />
          </div>
          <div>
            <Label htmlFor="accent-color">Accent/Secondary</Label>
            <Input
              id="accent-color"
              type="color"
              value={hslObjectToHex(hslStringToObject(theme.accent))}
              onChange={(e) => handleHexColorChange("accent", e.target.value)}
              className="h-12"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={saveTheme}>Save Palette</Button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
          <Bot className="text-primary" /> AI Branding Assistant
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Describe the branding you want, and let AI generate a new theme.
          Provide a prompt like `a dark, moody theme with fiery orange accents`. The AI must return a background, primary and accent color.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="e.g., 'A cyberpunk theme with neon green and deep blue'"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isPending}
          />
          <Button onClick={handleGenerateTheme} disabled={isPending || !aiPrompt}>
            {isPending ? "Generating..." : "Generate"}
          </Button>
        </div>
        {error && (
            <Alert variant="destructive" className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </GlassCard>
    </div>
  );
}
