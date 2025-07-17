'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing all risks and continuity plans.
 *
 * - summarizeRisksAndPlans - A function that analyzes all survey and continuity data to provide a high-level summary.
 * - SummarizeRisksAndPlansInput - The input type for the function.
 * - SummarizeRisksAndPlansOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRisksAndPlansInputSchema = z.object({
  allSurveyData: z.string().describe('A JSON string of all survey data from all users.'),
  allContinuityData: z.string().describe('A JSON string of all continuity plan data from all users.'),
});
export type SummarizeRisksAndPlansInput = z.infer<typeof SummarizeRisksAndPlansInputSchema>;

const SummarizeRisksAndPlansOutputSchema = z.object({
  summary: z.string().describe('A concise, analytical summary of the overall risk landscape, identifying key trends, high-risk departments, and the status of continuity planning.'),
});
export type SummarizeRisksAndPlansOutput = z.infer<typeof SummarizeRisksAndPlansOutputSchema>;


export async function summarizeRisksAndPlans(input: SummarizeRisksAndPlansInput): Promise<SummarizeRisksAndPlansOutput> {
  return summarizeRisksAndPlansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRisksAndPlansPrompt',
  input: {schema: SummarizeRisksAndPlansInputSchema},
  output: {schema: SummarizeRisksAndPlansOutputSchema},
  prompt: `You are an expert risk analyst for a government body. Your task is to provide a high-level summary of the current risk landscape based on data from multiple departments.

Analyze the provided JSON data for all risk surveys and continuity plans.

**Analysis Steps:**
1.  **Identify High-Risk Areas:** Pinpoint which departments ('userRole') report the most risks, especially those with 'Bahaya' or 'Sedang' levels.
2.  **Find Common Risk Categories:** Determine which 'riskEvent' categories appear most frequently across all surveys.
3.  **Assess Continuity Preparedness:** Compare the risks identified (especially high-priority ones) with the continuity plans submitted. Note any gaps where high-priority risks do not have a corresponding plan.
4.  **Synthesize Findings:** Combine these points into a concise, easy-to-read summary (2-4 sentences). Start with the most critical finding.

**Data for Analysis:**
-   **All Survey Data:** {{allSurveyData}}
-   **All Continuity Plan Data:** {{allContinuityData}}

Provide your output in the requested JSON format.`,
});

const summarizeRisksAndPlansFlow = ai.defineFlow(
  {
    name: 'summarizeRisksAndPlansFlow',
    inputSchema: SummarizeRisksAndPlansInputSchema,
    outputSchema: SummarizeRisksAndPlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
