'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing risk trends from survey data.
 *
 * - analyzeRiskTrends - A function that analyzes survey data to identify emerging risk trends and their potential impacts.
 * - AnalyzeRiskTrendsInput - The input type for the analyzeRiskTrends function (currently empty).
 * - AnalyzeRiskTrendsOutput - The return type for the analyzeRiskTrends function, containing a summary of risk trends.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRiskTrendsInputSchema = z.object({});
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

const getSurveyData = ai.defineTool(
    {
      name: 'getSurveyData',
      description: 'Retrieves all survey data from Firestore.',
      inputSchema: z.object({}),
      outputSchema: z.array(z.record(z.any())), // Assuming survey data is an array of objects
    },
    async () => {
      // Assuming you have a service function to fetch survey data from Firestore
      return await getAllSurveyData();
    }
);

// Assuming you have a function to fetch survey data from Firestore
import {getAllSurveyData} from '@/services/survey-service';

const analyzeRiskTrendsFlow = ai.defineFlow(
    {
      name: 'analyzeRiskTrendsFlow',
      inputSchema: AnalyzeRiskTrendsInputSchema,
      outputSchema: AnalyzeRiskTrendsOutputSchema,
      tools: [getSurveyData],
    },
    async input => {
      const surveyData = await getSurveyData({});
      const {output} = await prompt({
        ...input,
        surveyData: JSON.stringify(surveyData),
      });
      return output!;
    }
);
