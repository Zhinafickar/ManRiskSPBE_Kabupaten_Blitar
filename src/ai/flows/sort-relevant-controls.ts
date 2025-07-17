'use server';
/**
 * @fileOverview This file defines a Genkit flow for intelligently sorting ISO 27001 controls.
 *
 * - sortRelevantControls - A function that reorders lists of controls based on risk context.
 * - SortRelevantControlsInput - The input type for the function.
 * - SortRelevantControlsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  ORGANIZATIONAL_CONTROLS,
  PEOPLE_CONTROLS,
  PHYSICAL_CONTROLS,
  TECHNOLOGICAL_CONTROLS
} from '@/constants/data';


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


export async function sortRelevantControls(input: SortRelevantControlsInput): Promise<SortRelevantControlsOutput> {
  return sortRelevantControlsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sortRelevantControlsPrompt',
  input: {schema: SortRelevantControlsInputSchema},
  output: {schema: SortRelevantControlsOutputSchema},
  prompt: `You are an expert ISO 27001 risk management analyst. Your task is to intelligently sort lists of security controls based on the relevance to a specific risk scenario.

Analyze the provided risk context:
-   **Kategori Risiko:** {{riskEvent}}
-   **Risiko:** {{impactArea}}
-   **Area Dampak:** {{areaDampak}}
-   **Penyebab:** {{cause}}
-   **Dampak:** {{impact}}
-   **Tingkat Risiko:** {{riskLevel}}

You are given four complete lists of controls: Organizational, People, Physical, and Technological.
For each list, you MUST return the **complete, original list** of controls, but re-sorted so that the controls most relevant to mitigating the specific risk described above appear at the top. Do not add or remove any controls from the original lists.

**Example Logic:**
- If the risk is about "Pencurian data sensitive oleh staf", the "Kontrol Orang" list should prioritize controls like "6.1 Penyaringan", "6.2 Syarat dan ketentuan kerja", and "6.6 Perjanjian kerahasiaan...".
- If the risk is about "Serangan virus", the "Kontrol Teknologi" list should prioritize "8.7 Perlindungan terhadap malware" and "8.20 Keamanan jaringan".
- If the risk is about "Bencana alam" like a flood, the "Kontrol Fisik" list should prioritize "7.5 Melindungi dari ancaman fisik dan lingkungan" and "7.11 Utilitas pendukung".

Return the four sorted lists in the specified JSON format.

**Complete Control Lists (for your reference to ensure all items are returned):**

**Organizational Controls:**
${[...ORGANIZATIONAL_CONTROLS].join('\n')}

**People Controls:**
${[...PEOPLE_CONTROLS].join('\n')}

**Physical Controls:**
${[...PHYSICAL_CONTROLS].join('\n')}

**Technological Controls:**
${[...TECHNOLOGICAL_CONTROLS].join('\n')}
`,
});

const sortRelevantControlsFlow = ai.defineFlow(
  {
    name: 'sortRelevantControlsFlow',
    inputSchema: SortRelevantControlsInputSchema,
    outputSchema: SortRelevantControlsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
