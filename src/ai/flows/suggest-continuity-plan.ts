'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting a business continuity plan.
 *
 * - suggestContinuityPlan - A function that suggests a continuity plan based on a selected risk and historical survey data.
 */

import {ai} from '@/ai/genkit';
import {
    SuggestContinuityPlanInputSchema,
    SuggestContinuityPlanOutputSchema,
    type SuggestContinuityPlanInput,
    type SuggestContinuityPlanOutput
} from '@/types/continuity';

export async function suggestContinuityPlan(input: SuggestContinuityPlanInput): Promise<SuggestContinuityPlanOutput> {
  return suggestContinuityPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestContinuityPlanPrompt',
  input: {schema: SuggestContinuityPlanInputSchema},
  output: {schema: SuggestContinuityPlanOutputSchema},
  prompt: `You are an expert risk management consultant for a government agency in Indonesia.
Your task is to provide a concise and practical starting point for a business continuity plan.

You will be given the full details of a specific risk survey and the complete history of all risk surveys submitted to the system.
Analyze the given risk in the context of the historical data.

Based on this analysis, suggest a practical recovery activity, a target time, a person in charge (PIC), and the necessary resources.

**Instructions:**
- **Aktivitas:** Be specific and action-oriented. What is the first critical step to recovery?
- **Target Waktu:** Be realistic. How long should this activity take? (e.g., "2 Jam", "8 Jam", "1 Hari Kerja").
- **PIC:** Suggest a department or role, not a specific person's name. (e.g., "Tim Jaringan", "Kepala Dinas").
- **Sumberdaya:** List the essential resources needed. Be brief.

**Specific Survey Details to Analyze:**
- Kategori Risiko: {{selectedSurveyDetails.riskEvent}}
- Risiko Spesifik: {{selectedSurveyDetails.impactArea}}
- Penyebab: {{selectedSurveyDetails.cause}}
- Dampak: {{selectedSurveyDetails.impact}}
- Tingkat Risiko: {{selectedSurveyDetails.riskLevel}}

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
