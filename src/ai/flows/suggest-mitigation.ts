
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting a risk mitigation strategy.
 *
 * - suggestMitigation - A function that suggests a mitigation option based on risk context.
 * - SuggestMitigationInput - The input type for the function.
 * - SuggestMitigationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MITIGATION_OPTIONS } from '@/constants/mitigation';

const SuggestMitigationInputSchema = z.object({
  riskEvent: z.string().describe("The high-level category of the risk."),
  impactArea: z.string().describe("The specific risk being analyzed."),
  cause: z.string().describe("The described cause of the risk event."),
  impact: z.string().describe("The described potential impact of the risk event."),
  riskLevel: z.string().describe("The calculated risk level (e.g., Bahaya, Sedang, Rendah, Minor)."),
  sentiment: z.string().describe("The sentiment of the risk (Positif, Negatif, Netral)."),
});
export type SuggestMitigationInput = z.infer<typeof SuggestMitigationInputSchema>;

const validMitigations = MITIGATION_OPTIONS.map(opt => opt.name) as [string, ...string[]];

const SuggestMitigationOutputSchema = z.object({
  mitigation: z.enum(validMitigations).describe('The most appropriate mitigation strategy.'),
});
export type SuggestMitigationOutput = z.infer<typeof SuggestMitigationOutputSchema>;

export async function suggestMitigation(input: SuggestMitigationInput): Promise<SuggestMitigationOutput> {
  return suggestMitigationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMitigationPrompt',
  input: {schema: SuggestMitigationInputSchema},
  output: {schema: SuggestMitigationOutputSchema},
  prompt: `Anda adalah seorang ahli manajemen risiko. Berdasarkan konteks risiko yang diberikan, tentukan strategi mitigasi yang paling sesuai dari daftar opsi yang valid.

Konteks Risiko:
- Kategori Risiko: {{riskEvent}}
- Risiko: {{impactArea}}
- Penyebab: {{cause}}
- Dampak: {{impact}}
- Tingkat Risiko: {{riskLevel}}
- Sentimen Risiko: {{sentiment}}

Opsi Mitigasi yang Valid dan Penjelasannya:
${MITIGATION_OPTIONS.map(opt => `- **${opt.name}**: ${opt.description}`).join('\n')}

Logika Pemilihan:
- Jika sentimen 'Positif' dan tingkat risiko tinggi, 'Eksploitasi Risiko' seringkali merupakan pilihan terbaik.
- Jika risiko sangat tinggi ('Bahaya') dan sulit dikendalikan secara internal, 'Pembagian Risiko' atau 'Eskalasi Risiko' mungkin diperlukan.
- Untuk sebagian besar risiko negatif, 'Peningkatan Risiko' (mengurangi risiko) adalah strategi standar.
- Jika tingkat risiko 'Minor' atau 'Rendah', 'Penerimaan Risiko' bisa menjadi pilihan yang masuk akal.

Pilih opsi mitigasi yang paling tepat berdasarkan analisis Anda.

Output harus dalam format JSON yang ditentukan.`,
});

const suggestMitigationFlow = ai.defineFlow(
  {
    name: 'suggestMitigationFlow',
    inputSchema: SuggestMitigationInputSchema,
    outputSchema: SuggestMitigationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
