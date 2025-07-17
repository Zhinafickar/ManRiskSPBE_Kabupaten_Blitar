'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting security controls and mitigation strategies.
 *
 * - suggestControlsAndMitigation - A function that suggests controls and a mitigation strategy based on risk details.
 * - SuggestControlsAndMitigationInput - The input type for the function.
 * - SuggestControlsAndMitigationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  ORGANIZATIONAL_CONTROLS,
  PEOPLE_CONTROLS,
  PHYSICAL_CONTROLS,
  TECHNOLOGICAL_CONTROLS,
  MITIGATION_OPTIONS,
} from '@/constants/data';

const SuggestControlsAndMitigationInputSchema = z.object({
  riskEvent: z.string().describe('The high-level category of the risk.'),
  impactArea: z.string().describe('The specific risk being analyzed.'),
  areaDampak: z.string().describe('The specific business area affected by the risk.'),
  cause: z.string().describe('The described cause of the risk.'),
  impact: z.string().describe('The described impact of the risk.'),
  frequency: z.string().describe('The frequency level of the risk event.'),
  impactMagnitude: z.string().describe('The impact magnitude level of the risk event.'),
  riskLevel: z.string().describe("The calculated risk level (e.g., 'Bahaya', 'Sedang')."),
});
export type SuggestControlsAndMitigationInput = z.infer<typeof SuggestControlsAndMitigationInputSchema>;

const SuggestControlsAndMitigationOutputSchema = z.object({
  suggestedKontrolOrganisasi: z.array(z.string()).describe('A list of relevant organizational controls.'),
  suggestedKontrolOrang: z.array(z.string()).describe('A list of relevant people controls.'),
  suggestedKontrolFisik: z.array(z.string()).describe('A list of relevant physical controls.'),
  suggestedKontrolTeknologi: z.array(z.string()).describe('A list of relevant technological controls.'),
  suggestedMitigasi: z.string().describe('The single most appropriate mitigation strategy.'),
});
export type SuggestControlsAndMitigationOutput = z.infer<typeof SuggestControlsAndMitigationOutputSchema>;


export async function suggestControlsAndMitigation(input: SuggestControlsAndMitigationInput): Promise<SuggestControlsAndMitigationOutput> {
  return suggestControlsAndMitigationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestControlsAndMitigationPrompt',
  input: {schema: SuggestControlsAndMitigationInputSchema},
  output: {schema: SuggestControlsAndMitigationOutputSchema},
  prompt: `You are an expert ISO 27001 risk management analyst for an Indonesian government agency.
Your task is to analyze a given risk and suggest appropriate security controls and a mitigation strategy.

**Instructions:**
1.  Analyze the comprehensive risk details provided: Kategori Risiko, Risiko, Area Dampak, Penyebab, Dampak, Frekuensi, Besaran Dampak, and Tingkat Risiko.
2.  From the lists of available controls below, select the MOST RELEVANT controls for each category. Do not select more than 5 controls for each category. If no control is relevant, return an empty array for that category.
3.  Based on all the risk details AND the controls you have just selected, choose the SINGLE MOST APPROPRIATE mitigation strategy from the list of available mitigation options. For example, if many controls are applicable, 'Peningkatan Risiko' (Mitigation) might be best. If very few controls exist or are effective, 'Pembagian Risiko' (Transfer) or 'Penerimaan Risiko' (Acceptance) might be more suitable.
4.  Your response must only contain values that are exact matches from the provided lists.

**Risk Details to Analyze:**
- **Kategori Risiko:** {{riskEvent}}
- **Risiko:** {{impactArea}}
- **Area Dampak:** {{areaDampak}}
- **Penyebab:** {{cause}}
- **Dampak:** {{impact}}
- **Frekuensi:** {{frequency}}
- **Besaran Dampak:** {{impactMagnitude}}
- **Tingkat Risiko:** {{riskLevel}}

---

**Available Controls & Mitigation Options:**

**Kontrol Organisasi:**
${ORGANIZATIONAL_CONTROLS.join('\n')}

**Kontrol Orang:**
${PEOPLE_CONTROLS.join('\n')}

**Kontrol Fisik:**
${PHYSICAL_CONTROLS.join('\n')}

**Kontrol Teknologi:**
${TECHNOLOGICAL_CONTROLS.join('\n')}

**Opsi Mitigasi:**
${MITIGATION_OPTIONS.map(o => o.name).join('\n')}

---

Provide your suggestions in the specified JSON format. Ensure every suggested control and the mitigation option is an exact match from the lists above.`,
});

const suggestControlsAndMitigationFlow = ai.defineFlow(
  {
    name: 'suggestControlsAndMitigationFlow',
    inputSchema: SuggestControlsAndMitigationInputSchema,
    outputSchema: SuggestControlsAndMitigationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
