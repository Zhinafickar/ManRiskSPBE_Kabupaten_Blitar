import { z } from 'zod';

export const DetermineRiskSentimentInputSchema = z.object({
  riskCategory: z.string().describe('The high-level category of the risk.'),
  risk: z.string().describe('The specific risk being analyzed.'),
});
export type DetermineRiskSentimentInput = z.infer<typeof DetermineRiskSentimentInputSchema>;

export const DetermineRiskSentimentOutputSchema = z.object({
  sentiment: z.enum(['Positif', 'Negatif', 'Netral']).describe('The sentiment of the risk. "Positif" if it represents an opportunity or gain, "Negatif" if it represents a threat or loss, and "Netral" if it is neutral or unclear.'),
});
export type DetermineRiskSentimentOutput = z.infer<typeof DetermineRiskSentimentOutputSchema>;
