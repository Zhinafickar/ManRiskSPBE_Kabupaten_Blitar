import { z } from 'zod';

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

export interface ContinuityPlan {
  id: string;
  userId: string;
  userRole: string;
  risiko: string;
  aktivitas: string;
  targetWaktu: string;
  pic: string;
  sumberdaya: string;
  rto: string;
  rpo: string;
  createdAt: string;
}
