"use server";

import { updateBrandingViaAi, type UpdateBrandingInput } from "@/ai/flows/update-branding-via-ai";
import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const parseCssVariables = (cssString: string): Record<string, string> => {
    const colors: Record<string, string> = {};
    const regex = /--([\w-]+):\s*(#[0-9a-fA-F]{6});/g;
    let match;
    while ((match = regex.exec(cssString)) !== null) {
        colors[match[1]] = match[2];
    }
    return colors;
}

function hexToHsl(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "0 0% 0%";

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}


export async function generateTheme(input: UpdateBrandingInput) {
  try {
    const result = await updateBrandingViaAi(input);

    if (!result.colorScheme) {
        return { error: "AI did not return a valid color scheme." };
    }

    const colors = parseCssVariables(result.colorScheme);

    const theme = {
        background: colors.background ? hexToHsl(colors.background) : null,
        primary: colors.primary ? hexToHsl(colors.primary) : null,
        accent: colors.accent ? hexToHsl(colors.accent) : null,
    };

    if (!theme.background || !theme.primary || !theme.accent) {
        return { error: "AI did not return all required colors (background, primary, accent)." };
    }
    
    return { theme };
  } catch (e) {
    console.error(e);
    return { error: "An error occurred during AI theme generation." };
  }
}
