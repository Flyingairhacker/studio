
'use server';

/**
 * @fileOverview This file defines a Genkit flow for updating the portfolio branding using AI.
 * 
 * It takes a text prompt as input and generates color scheme and typography suggestions.
 * @interface UpdateBrandingInput - Input for the updateBrandingViaAi flow.
 * @interface UpdateBrandingOutput - Output of the updateBrandingViaAi flow.
 * @function updateBrandingViaAi - The main function to trigger the branding update flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpdateBrandingInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A text prompt describing the desired branding changes for the portfolio.'
    ),
});
export type UpdateBrandingInput = z.infer<typeof UpdateBrandingInputSchema>;

const UpdateBrandingOutputSchema = z.object({
  colorScheme: z
    .string()
    .describe('Suggested color scheme in CSS variable format for --background, --foreground, --card, --primary, --secondary, --accent, and --muted.'),
  typography:
    z.string().describe('Suggested typography settings (font families).'),
});
export type UpdateBrandingOutput = z.infer<typeof UpdateBrandingOutputSchema>;

export async function updateBrandingViaAi(
  input: UpdateBrandingInput
): Promise<UpdateBrandingOutput> {
  return updateBrandingFlow(input);
}

const updateBrandingPrompt = ai.definePrompt({
  name: 'updateBrandingPrompt',
  input: {schema: UpdateBrandingInputSchema},
  output: {schema: UpdateBrandingOutputSchema},
  prompt: `You are an AI assistant specialized in branding. Based on the provided prompt, suggest a color scheme and typography settings for a portfolio website.

  Prompt: {{{prompt}}}

  Provide a complete color scheme in CSS variable format. You MUST include values for --background, --foreground, --card, --primary, --secondary, --accent, and --muted.
  Example: --background: #0A0A0A; --foreground: #F8F8F8; --card: #1A1A1A; --primary: #00C8FF; --secondary: #8B5CF6; --accent: #FF00FF; --muted: #3A3A3A;
  
  Also provide typography settings as font families (e.g., body: Inter, sans-serif; heading: Space Grotesk, sans-serif;). Make sure to return valid CSS.
  `,
});

const updateBrandingFlow = ai.defineFlow(
  {
    name: 'updateBrandingFlow',
    inputSchema: UpdateBrandingInputSchema,
    outputSchema: UpdateBrandingOutputSchema,
  },
  async input => {
    const {output} = await updateBrandingPrompt(input);
    return output!;
  }
);
