'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing risk trends from survey data.
 *
 * - analyzeRiskTrends - A function that analyzes survey data to identify emerging risk trends and their potential impacts.
 * - AnalyzeRiskTrendsInput - The input type for the analyzeRiskTrends function, which includes the survey data.
 * - AnalyzeRiskTrendsOutput - The return type for the analyzeRiskTrends function, containing a summary of risk trends.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRiskTrendsInputSchema = z.object({
  surveyData: z.string().describe('A JSON string of all survey data.'),
});
export type AnalyzeRiskTrendsInput = z.infer<typeof AnalyzeRiskTrendsInputSchema>;

const AnalyzeRiskTrendsOutputSchema = z.object({
  summary: z.string().describe('A summary of emerging risk trends, prevalent issues, and potential impacts.'),
});
export type AnalyzeRiskTrendsOutput = z.infer<typeof AnalyzeRiskTrendsOutputSchema>;

export async function analyzeRiskTrends(input: AnalyzeRiskTrendsInput): Promise<AnalyzeRiskTrendsOutput> {
  return analyzeRiskTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRiskTrendsPrompt',
  input: {schema: AnalyzeRiskTrendsInputSchema},
  output: {schema: AnalyzeRiskTrendsOutputSchema},
  prompt: `Analyze the following survey data to identify emerging risk trends, prevalent issues, and potential impacts. Provide a concise summary of your findings.
  
  Survey Data: {{surveyData}}
  
  Summary: `,
});

const analyzeRiskTrendsFlow = ai.defineFlow(
    {
      name: 'analyzeRiskTrendsFlow',
      inputSchema: AnalyzeRiskTrendsInputSchema,
      outputSchema: AnalyzeRiskTrendsOutputSchema,
    },
    async (input) => {
      const {output} = await prompt(input);
      return output!;
    }
);
