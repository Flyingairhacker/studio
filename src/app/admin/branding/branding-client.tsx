
"use client";

import { useState, useEffect, useTransition } from "react";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Loader2, Palette, Terminal, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateTheme } from "./actions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { generateSceneInfo } from "@/ai/flows/generate-scene-info";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc, serverTimestamp } from "firebase/firestore";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";

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
    if (!hslString) return { h: 0, s: 0, l: 0 };
    const [h, s, l] = hslString.split(" ").map(v => parseInt(v.replace('%', '')));
    return { h, s, l };
}

const hslObjectToHex = (hsl: {h: number, s: number, l: number}) => {
    return hslToHex(hsl.h, hsl.s, hsl.l);
}

type Theme = {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
};

type BrandingData = {
  theme: Theme;
  weather: 'none' | 'rain' | 'snow' | 'fog' | 'storm' | 'sunny' | 'dusk' | 'night';
  terrain: 'none' | 'city' | 'hills' | 'beach' | 'forest' | 'desert' | 'mountains';
}

export default function BrandingClient() {
  const [theme, setTheme] = useState<Theme>({
    background: "224 41% 3%",
    foreground: "210 40% 98%",
    card: "224 71% 4%",
    primary: "192 100% 50%",
    secondary: "256 90% 66%",
    accent: "300 100% 50%",
    muted: "215 28% 17%",
  });
  const [weather, setWeather] = useState<BrandingData['weather']>('none');
  const [terrain, setTerrain] = useState<BrandingData['terrain']>('none');
  
  const [isMounted, setIsMounted] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [aiScenePrompt, setAiScenePrompt] = useState("a rainy night in tokyo");
  const [isScenePending, startSceneTransition] = useTransition();

  const { toast } = useToast();
  const firestore = useFirestore();

  const brandingRef = useMemoFirebase(() => (firestore ? doc(firestore, "branding", "live-branding") : null), [firestore]);
  const { data: brandingData, isLoading: isBrandingLoading } = useDoc<BrandingData>(brandingRef);
  
  useEffect(() => {
    if (isBrandingLoading) return;
    const savedTheme = brandingData?.theme || JSON.parse(localStorage.getItem("cyber-architect-theme") || "null");
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (brandingData?.weather) setWeather(brandingData.weather);
    if (brandingData?.terrain) setTerrain(brandingData.terrain);

    setIsMounted(true);
  }, [brandingData, isBrandingLoading]);

  useEffect(() => {
    if (isMounted) {
      Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    }
  }, [theme, isMounted]);

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

  const saveSettings = () => {
    if (!brandingRef) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Firestore is not available.",
      });
      return;
    }

    const dataToSave = {
      theme,
      weather,
      terrain,
      updatedAt: serverTimestamp()
    };
    
    setDocumentNonBlocking(brandingRef, dataToSave, { merge: true });

    // Also save to local storage as a fallback
    localStorage.setItem("cyber-architect-theme", JSON.stringify(theme));
    
    toast({
      title: "Settings Saved",
      description: "Your new branding and scene settings have been saved.",
    });
  };

  const handleGenerateTheme = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateTheme({ prompt: aiPrompt });
      if (result.error) {
        setError(result.error);
      } else if (result.theme) {
        setTheme(result.theme as Theme);
        toast({
          title: "AI Theme Generated",
          description: "The new theme has been applied. Don't forget to save!",
        });
      }
    });
  };

  const handleGenerateScene = () => {
    if (!aiScenePrompt) return;

    startSceneTransition(async () => {
      try {
        const result = await generateSceneInfo({ location: aiScenePrompt });
        setWeather(result.weather);
        setTerrain(result.terrain);
        toast({
          title: "Scene Updated",
          description: `Weather set to ${result.weather}, terrain set to ${result.terrain}. Don't forget to save!`,
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

  if (!isMounted || isBrandingLoading) {
    return null; // Or a loading skeleton
  }

  const renderColorInput = (name: keyof Theme, label: string) => (
    <div>
      <Label htmlFor={`${name}-color`}>{label}</Label>
      <Input
        id={`${name}-color`}
        type="color"
        value={hslObjectToHex(hslStringToObject(theme[name]))}
        onChange={(e) => handleHexColorChange(name, e.target.value)}
        className="h-12"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-headline font-bold text-glow">
            System Aesthetics
            </h1>
            <p className="text-muted-foreground">
            Customize the look and feel of your portfolio.
            </p>
        </div>
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
            <Palette className="text-primary"/> Color Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {renderColorInput("background", "Background")}
            {renderColorInput("foreground", "Foreground")}
            {renderColorInput("card", "Card")}
            {renderColorInput("muted", "Muted")}
            {renderColorInput("primary", "Primary")}
            {renderColorInput("secondary", "Secondary")}
            {renderColorInput("accent", "Accent")}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={saveSettings}>Save Palette</Button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
          <Bot className="text-primary" /> AI Branding Assistant
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Describe the branding you want, and let AI generate a new theme.
          Provide a prompt like `a dark, moody theme with fiery orange accents`. The AI must return a full palette.
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

      <GlassCard className="p-6">
        <h2 className="text-xl font-headline font-semibold border-b pb-2 mb-4 flex items-center gap-2">
            <Wand2 className="text-primary"/> Scene Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="weather">Weather</Label>
                <Select value={weather} onValueChange={(v: BrandingData['weather']) => setWeather(v)}>
                    <SelectTrigger id="weather">
                        <SelectValue placeholder="Select weather..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="rain">Rain</SelectItem>
                        <SelectItem value="snow">Snow</SelectItem>
                        <SelectItem value="fog">Fog</SelectItem>
                        <SelectItem value="storm">Storm</SelectItem>
                        <SelectItem value="sunny">Sunny</SelectItem>
                        <SelectItem value="dusk">Dusk</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="terrain">Terrain</Label>
                 <Select value={terrain} onValueChange={(v: BrandingData['terrain']) => setTerrain(v)}>
                    <SelectTrigger id="terrain">
                        <SelectValue placeholder="Select terrain..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="city">City</SelectItem>
                        <SelectItem value="hills">Hills</SelectItem>
                        <SelectItem value="mountains">Mountains</SelectItem>
                        <SelectItem value="forest">Forest</SelectItem>
                        <SelectItem value="beach">Beach</SelectItem>
                        <SelectItem value="desert">Desert</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

         <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <Bot className="text-primary"/> AI Scene Generator
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Describe a scene to let AI configure the weather and terrain for you.
            </p>
             <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    placeholder="e.g., 'a foggy morning in the mountains'"
                    value={aiScenePrompt}
                    onChange={(e) => setAiScenePrompt(e.target.value)}
                    disabled={isScenePending}
                />
                <Button onClick={handleGenerateScene} disabled={isScenePending || !aiScenePrompt}>
                    {isScenePending ? <Loader2 className="animate-spin" /> : "Generate Scene"}
                </Button>
             </div>
         </div>
      </GlassCard>
    </div>
  );
}
