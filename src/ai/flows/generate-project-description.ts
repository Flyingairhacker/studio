'use server';

/**
 * @fileOverview AI-powered project description generator.
 * 
 * - generateProjectDescription - A function that generates a project description from keywords.
 * - GenerateProjectDescriptionInput - The input type for the generateProjectDescription function.
 * - GenerateProjectDescriptionOutput - The return type for the generateProjectDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectDescriptionInputSchema = z.object({
  keywords: z
    .string()
    .describe('Comma separated keywords describing the project.'),
});
export type GenerateProjectDescriptionInput = z.infer<
  typeof GenerateProjectDescriptionInputSchema
>;

const GenerateProjectDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A detailed and engaging description of the project.'),
});
export type GenerateProjectDescriptionOutput = z.infer<
  typeof GenerateProjectDescriptionOutputSchema
>;

export async function generateProjectDescription(
  input: GenerateProjectDescriptionInput
): Promise<GenerateProjectDescriptionOutput> {
  return generateProjectDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectDescriptionPrompt',
  input: {schema: GenerateProjectDescriptionInputSchema},
  output: {schema: GenerateProjectDescriptionOutputSchema},
  prompt: `You are a world-class copywriter specializing in creating engaging descriptions of software engineering projects.

  Based on the keywords provided, create a compelling description of the project.

  Keywords: {{{keywords}}}`,
});

const generateProjectDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProjectDescriptionFlow',
    inputSchema: GenerateProjectDescriptionInputSchema,
    outputSchema: GenerateProjectDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
