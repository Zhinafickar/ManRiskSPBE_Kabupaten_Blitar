import { z } from 'zod';

export const SortRelevantControlsInputSchema = z.object({
  riskEvent: z.string().describe("The high-level category of the risk."),
  impactArea: z.string().describe("The specific risk being analyzed."),
  areaDampak: z.string().describe("The specific business area affected by the risk."),
  cause: z.string().describe("The described cause of the risk event."),
  impact: z.string().describe("The described potential impact of the risk event."),
  riskLevel: z.string().describe("The calculated risk level (e.g., Bahaya, Sedang, Rendah, Minor)."),
});
export type SortRelevantControlsInput = z.infer<typeof SortRelevantControlsInputSchema>;


export const SortRelevantControlsOutputSchema = z.object({
    sortedOrganizational: z.array(z.string()).describe("The complete list of organizational controls, sorted by relevance."),
    sortedPeople: z.array(z.string()).describe("The complete list of people controls, sorted by relevance."),
    sortedPhysical: z.array(z.string()).describe("The complete list of physical controls, sorted by relevance."),
    sortedTechnological: z.array(z.string()).describe("The complete list of technological controls, sorted by relevance."),
});
export type SortRelevantControlsOutput = z.infer<typeof SortRelevantControlsOutputSchema>;
