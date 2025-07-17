'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing a single user's risks and continuity plans.
 *
 * - summarizeUserRisksAndPlans - A function that analyzes a specific user's survey and continuity data.
 * - SummarizeUserRisksAndPlansInput - The input type for the function.
 * - SummarizeUserRisksAndPlansOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUserRisksAndPlansInputSchema = z.object({
  userRole: z.string().describe("The user's role or department name."),
  userSurveyData: z.string().describe("A JSON string of all survey data submitted by this specific user."),
  userContinuityData: z.string().describe("A JSON string of all continuity plan data submitted by this specific user."),
});
export type SummarizeUserRisksAndPlansInput = z.infer<typeof SummarizeUserRisksAndPlansInputSchema>;

const SummarizeUserRisksAndPlansOutputSchema = z.object({
  summary: z.string().describe('A concise, analytical summary for the specific user, highlighting their key risks, preparedness level, and any gaps between high-level risks and their continuity plans.'),
});
export type SummarizeUserRisksAndPlansOutput = z.infer<typeof SummarizeUserRisksAndPlansOutputSchema>;


export async function summarizeUserRisksAndPlans(input: SummarizeUserRisksAndPlansInput): Promise<SummarizeUserRisksAndPlansOutput> {
  return summarizeUserRisksAndPlansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUserRisksAndPlansPrompt',
  input: {schema: SummarizeUserRisksAndPlansInputSchema},
  output: {schema: SummarizeUserRisksAndPlansOutputSchema},
  prompt: `You are an expert risk analyst tasked with creating a personalized summary for a user from a specific government department in Indonesia.

Analyze the provided JSON data for their risk surveys and continuity plans.

**Analysis Steps for Department: {{userRole}}**
1.  **Identify High-Priority Risks:** Pinpoint the most significant risks based on their 'riskLevel' (e.g., 'Bahaya', 'Sedang'). Note the most common 'riskEvent' categories.
2.  **Assess Continuity Preparedness:** Compare the high-priority risks identified with the continuity plans submitted ('userContinuityData'). Are there high-priority risks that do NOT have a corresponding continuity plan?
3.  **Synthesize Findings:** Combine these points into a concise, easy-to-read summary (2-3 sentences) for this specific user. Address them directly. Start with the most critical finding regarding their department. For example: "Berdasarkan data Anda, risiko utama di departemen Anda terkait dengan..." or "Tingkat kesiapan Anda cukup baik, namun terdapat beberapa risiko 'Bahaya' terkait... yang belum memiliki rencana kontinuitas."

**Data for Analysis:**
-   **User's Survey Data:** {{userSurveyData}}
-   **User's Continuity Plan Data:** {{userContinuityData}}

Provide your output in the requested JSON format.`,
});

const summarizeUserRisksAndPlansFlow = ai.defineFlow(
  {
    name: 'summarizeUserRisksAndPlansFlow',
    inputSchema: SummarizeUserRisksAndPlansInputSchema,
    outputSchema: SummarizeUserRisksAndPlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
