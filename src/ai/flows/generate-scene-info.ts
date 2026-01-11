'use server';

/**
 * @fileOverview AI-powered scene information generator.
 * 
 * - generateSceneInfo - A function that generates weather and terrain info from a text prompt.
 * - GenerateSceneInfoInput - The input type for the generateSceneInfo function.
 * - GenerateSceneInfoOutput - The return type for the generateSceneInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSceneInfoInputSchema = z.object({
  location: z
    .string()
    .describe('A text description of a location and time, e.g., "a foggy morning in the mountains" or "a rainy night in Tokyo".'),
});
export type GenerateSceneInfoInput = z.infer<
  typeof GenerateSceneInfoInputSchema
>;

const GenerateSceneInfoOutputSchema = z.object({
  weather: z.enum(['none', 'rain', 'snow', 'fog', 'storm', 'sunny', 'dusk', 'night']).describe('The dominant weather condition in the scene.'),
  terrain: z.enum(['none', 'city', 'hills', 'beach', 'forest', 'desert', 'mountains']).describe('The dominant terrain type of the scene.'),
});
export type GenerateSceneInfoOutput = z.infer<
  typeof GenerateSceneInfoOutputSchema
>;

export async function generateSceneInfo(
  input: GenerateSceneInfoInput
): Promise<GenerateSceneInfoOutput> {
  return generateSceneInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSceneInfoPrompt',
  input: {schema: GenerateSceneInfoInputSchema},
  output: {schema: GenerateSceneInfoOutputSchema},
  prompt: `You are a scene analysis expert. Based on the user's description of a location, determine the primary weather and terrain.

  - If storm, thunder, or lightning is mentioned, set weather to 'storm'.
  - If rain or drizzle is mentioned, set weather to 'rain'.
  - If snow or blizzard is mentioned, set weather to 'snow'.
  - If fog or mist is mentioned, set weather to 'fog'.
  - If sunny, clear, or daytime is mentioned, set weather to 'sunny'.
  - If dusk, sunset, or evening is mentioned, set weather to 'dusk'.
  - If night or dark is mentioned, set weather to 'night'.
  - Otherwise, set weather to 'none'.

  - If city, urban, or buildings are mentioned, set terrain to 'city'.
  - If hills are mentioned, set terrain to 'hills'.
  - If mountains or peaks are mentioned, set terrain to 'mountains'.
  - If forest, woods, or trees are mentioned, set terrain to 'forest'.
  - If beach, coast, or ocean are mentioned, set terrain to 'beach'.
  - If desert or dunes are mentioned, set terrain to 'desert'.
  - Otherwise, set terrain to 'none'.

  Description: {{{location}}}`,
});

const generateSceneInfoFlow = ai.defineFlow(
  {
    name: 'generateSceneInfoFlow',
    inputSchema: GenerateSceneInfoInputSchema,
    outputSchema: GenerateSceneInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
