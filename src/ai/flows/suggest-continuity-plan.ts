'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting a business continuity plan.
 *
 * - suggestContinuityPlan - A function that suggests a continuity plan based on a selected risk and historical survey data.
 * - SuggestContinuityPlanInput - The input type for the function.
 * - SuggestContinuityPlanOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SuggestContinuityPlanInputSchema = z.object({
  risiko: z.string().describe('The specific risk event and impact area, formatted as "Risk Event - Impact Area".'),
  allSurveyData: z.string().describe('A JSON string of all historical survey data for context.'),
});
export type SuggestContinuityPlanInput = z.infer<typeof SuggestContinuityPlanInputSchema>;

export const SuggestContinuityPlanOutputSchema = z.object({
  aktivitas: z.string().describe('A concise, actionable recovery activity suggestion.'),
  targetWaktu: z.string().describe('A realistic target time for recovery (e.g., "4 Jam", "1 Hari Kerja").'),
  pic: z.string().describe('The suggested Person in Charge (PIC), typically a role or department (e.g., "Tim IT", "Kepala Bagian Keuangan").'),
  sumberdaya: z.string().describe('A brief list of required resources (e.g., "Server cadangan, teknisi jaringan").'),
});
export type SuggestContinuityPlanOutput = z.infer<typeof SuggestContinuityPlanOutputSchema>;

export async function suggestContinuityPlan(input: SuggestContinuityPlanInput): Promise<SuggestContinuityPlanOutput> {
  return suggestContinuityPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestContinuityPlanPrompt',
  input: {schema: SuggestContinuityPlanInputSchema},
  output: {schema: SuggestContinuityPlanOutputSchema},
  prompt: `You are an expert risk management consultant for a government agency in Indonesia.
Your task is to provide a concise and practical starting point for a business continuity plan.

You will be given a specific risk and the complete history of all risk surveys submitted to the system.
Analyze the given risk in the context of the historical data.

Based on this analysis, suggest a practical recovery activity, a target time, a person in charge (PIC), and the necessary resources.

**Instructions:**
- **Aktivitas:** Be specific and action-oriented. What is the first critical step to recovery?
- **Target Waktu:** Be realistic. How long should this activity take? (e.g., "2 Jam", "8 Jam", "1 Hari Kerja").
- **PIC:** Suggest a department or role, not a specific person's name. (e.g., "Tim Jaringan", "Kepala Dinas").
- **Sumberdaya:** List the essential resources needed. Be brief.

**Selected Risk to Analyze:**
{{risiko}}

**Historical Survey Data for Context:**
{{allSurveyData}}

Provide your suggestions in the specified JSON format.`,
});

const suggestContinuityPlanFlow = ai.defineFlow(
  {
    name: 'suggestContinuityPlanFlow',
    inputSchema: SuggestContinuityPlanInputSchema,
    outputSchema: SuggestContinuityPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
