'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating fictitious risk management data.
 *
 * - generateFictitiousData - A function that creates a specified number of realistic but fake survey
 *   and continuity plan entries for a given user role.
 * - GenerateFictitiousDataInput - The input type for the function.
 * - GenerateFictitiousDataOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { RISK_EVENTS, FREQUENCY_LEVELS, IMPACT_MAGNITUDES, AREA_DAMPAK_OPTIONS, MITIGATION_OPTIONS, ORGANIZATIONAL_CONTROLS, PEOPLE_CONTROLS, PHYSICAL_CONTROLS, TECHNOLOGICAL_CONTROLS } from '@/constants/data';
import { getRiskLevel } from '@/lib/risk-matrix';

// Helper function to get a random element from an array
const getRandomElement = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const GenerateFictitiousDataInputSchema = z.object({
  role: z.string().describe('The user role/department for which to generate data.'),
  surveyCount: z.number().int().min(1).max(10).describe('The number of fictitious survey entries to generate.'),
});
export type GenerateFictitiousDataInput = z.infer<typeof GenerateFictitiousDataInputSchema>;

const FictitiousSurveySchema = z.object({
    riskEvent: z.string(),
    impactArea: z.string(),
    areaDampak: z.string(),
    cause: z.string().describe("A realistic and detailed potential cause for the given risk."),
    impact: z.string().describe("A realistic and detailed potential business impact of the given risk."),
    frequency: z.enum([...FREQUENCY_LEVELS]),
    impactMagnitude: z.enum([...IMPACT_MAGNITUDES]),
    mitigasi: z.enum([...MITIGATION_OPTIONS.map(o => o.name) as [string, ...string[]]]),
    kontrolOrganisasi: z.array(z.string()).describe("A small, relevant selection of 1-3 organizational controls."),
    kontrolOrang: z.array(z.string()).describe("A small, relevant selection of 1-3 people controls."),
    kontrolFisik: z.array(z.string()).describe("A small, relevant selection of 1-3 physical controls."),
    kontrolTeknologi: z.array(z.string()).describe("A small, relevant selection of 1-3 technological controls."),
});

const GenerateFictitiousDataOutputSchema = z.object({
  surveys: z.array(FictitiousSurveySchema).describe('An array of generated fictitious survey objects.'),
});
export type GenerateFictitiousDataOutput = z.infer<typeof GenerateFictitiousDataOutputSchema>;


export async function generateFictitiousData(input: GenerateFictitiousDataInput): Promise<GenerateFictitiousDataOutput> {
  return generateFictitiousDataFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateFictitiousDataPrompt',
  input: { schema: GenerateFictitiousDataInputSchema },
  output: { schema: GenerateFictitiousDataOutputSchema },
  prompt: `You are an expert Indonesian risk management data generator. Your task is to create a set of realistic and diverse fictitious risk survey entries for a government department (Organisasi Perangkat Daerah - OPD).

**Instructions:**
1.  Generate **{{surveyCount}}** unique survey entries for the **{{role}}** department.
2.  For each entry, you MUST select a different 'riskEvent' and 'impactArea' to ensure variety. Do not repeat the same risk.
3.  Based on the chosen risk, intelligently generate a plausible 'cause' and 'impact' in Indonesian.
4.  Randomly but reasonably select values for 'frequency', 'impactMagnitude', 'areaDampak', and 'mitigasi'.
5.  For each control category (Organizational, People, Physical, Technological), select 1 to 3 relevant controls from the complete lists provided below. The selection should be highly relevant to the specific risk scenario you've created.

**Complete Control Lists for Your Reference:**

**Organizational Controls:**
${[...ORGANIZATIONAL_CONTROLS].join('\n')}

**People Controls:**
${[...PEOPLE_CONTROLS].join('\n')}

**Physical Controls:**
${[...PHYSICAL_CONTROLS].join('\n')}

**Technological Controls:**
${[...TECHNOLOGICAL_CONTROLS].join('\n')}

**Available Risk Events & Impact Areas:**
${RISK_EVENTS.map(e => `- ${e.name}:\n  - ${e.impactAreas.join('\n  - ')}`).join('\n')}

**Available Area Dampak:**
${[...AREA_DAMPAK_OPTIONS].join(', ')}

**Available Mitigation Options:**
${MITIGATION_OPTIONS.map(o => o.name).join(', ')}

Generate the output in the specified JSON format. Ensure the generated content is in Indonesian.`,
});


const generateFictitiousDataFlow = ai.defineFlow(
  {
    name: 'generateFictitiousDataFlow',
    inputSchema: GenerateFictitiousDataInputSchema,
    outputSchema: GenerateFictitiousDataOutputSchema,
  },
  async (input) => {
    // This is a complex generation task, so we increase the timeout.
    const { output } = await prompt(input, { config: { anyscale: { responseTimeout: 300 } } });
    return output!;
  }
);
