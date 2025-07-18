import { z } from 'zod';

const SurveyDetailSchema = z.object({
  riskEvent: z.string(),
  impactArea: z.string(),
  cause: z.string(),
  impact: z.string(),
  riskLevel: z.string(),
});

export const SuggestContinuityPlanInputSchema = z.object({
  selectedSurveyDetails: SurveyDetailSchema.describe('An object containing the full details of the specific survey entry for which a plan is being created.'),
  allSurveyData: z.string().describe('A JSON string of all historical survey data for broader context.'),
  existingPlans: z.array(z.string()).optional().describe('An optional list of recovery activities that have already been suggested for this risk, to avoid generating duplicates.'),
});
export type SuggestContinuityPlanInput = z.infer<typeof SuggestContinuityPlanInputSchema>;

export const SuggestContinuityPlanOutputSchema = z.object({
  aktivitas: z.string().describe('A concise, actionable recovery activity suggestion. If no new ideas are found, this will contain a specific message indicating so.'),
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
  isFictitious?: boolean;
}
