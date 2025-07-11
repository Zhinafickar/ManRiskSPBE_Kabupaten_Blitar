'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting the cause and impact of a risk event.
 *
 * - suggestCauseImpact - A function that suggests a cause and impact based on a selected risk category, risk, and impact area.
 * - SuggestCauseImpactInput - The input type for the suggestCauseImpact function.
 * - SuggestCauseImpactOutput - The return type for the suggestCauseImpact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SuggestCauseImpactInputSchema = z.object({
  riskCategory: z.string().describe('The high-level category of the risk.'),
  risk: z.string().describe('The specific risk being analyzed.'),
  impactArea: z.string().describe('The specific area affected by the risk.'),
});
export type SuggestCauseImpactInput = z.infer<typeof SuggestCauseImpactInputSchema>;

export const SuggestCauseImpactOutputSchema = z.object({
  cause: z.string().describe('A plausible cause for the specified risk event.'),
  impact: z.string().describe('A potential impact resulting from the specified risk event.'),
});
export type SuggestCauseImpactOutput = z.infer<typeof SuggestCauseImpactOutputSchema>;


export async function suggestCauseImpact(input: SuggestCauseImpactInput): Promise<SuggestCauseImpactOutput> {
  return suggestCauseImpactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCauseImpactPrompt',
  input: {schema: SuggestCauseImpactInputSchema},
  output: {schema: SuggestCauseImpactOutputSchema},
  prompt: `You are an expert risk management analyst for an Indonesian government agency.
Based on the following risk information, provide a concise and plausible **cause** and **impact** in Indonesian.

- **Kategori Risiko:** {{riskCategory}}
- **Risiko:** {{risk}}
- **Area Dampak:** {{impactArea}}

Generate a realistic cause and a corresponding impact.
**Example Cause:** "Kesalahan konfigurasi pada firewall yang tidak sengaja membuka port yang seharusnya tertutup."
**Example Impact:** "Potensi akses tidak sah ke dalam jaringan internal, yang dapat menyebabkan pencurian data atau gangguan layanan."

Provide your suggestions in the specified JSON format.`,
});

const suggestCauseImpactFlow = ai.defineFlow(
  {
    name: 'suggestCauseImpactFlow',
    inputSchema: SuggestCauseImpactInputSchema,
    outputSchema: SuggestCauseImpactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
