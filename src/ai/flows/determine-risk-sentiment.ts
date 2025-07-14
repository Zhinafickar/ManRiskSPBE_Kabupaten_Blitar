'use server';
/**
 * @fileOverview This file defines a Genkit flow for determining the sentiment of a given risk.
 *
 * - determineRiskSentiment - A function that analyzes a risk's category and description to classify its sentiment.
 * - DetermineRiskSentimentInput - The input type for the function.
 * - DetermineRiskSentimentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const DetermineRiskSentimentInputSchema = z.object({
  riskCategory: z.string().describe('The high-level category of the risk.'),
  risk: z.string().describe('The specific risk being analyzed.'),
});
export type DetermineRiskSentimentInput = z.infer<typeof DetermineRiskSentimentInputSchema>;

export const DetermineRiskSentimentOutputSchema = z.object({
  sentiment: z.enum(['Positif', 'Negatif', 'Netral']).describe('The sentiment of the risk. "Positif" if it represents an opportunity or gain, "Negatif" if it represents a threat or loss, and "Netral" if it is neutral or unclear.'),
});
export type DetermineRiskSentimentOutput = z.infer<typeof DetermineRiskSentimentOutputSchema>;


export async function determineRiskSentiment(input: DetermineRiskSentimentInput): Promise<DetermineRiskSentimentOutput> {
  return determineRiskSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'determineRiskSentimentPrompt',
  input: {schema: DetermineRiskSentimentInputSchema},
  output: {schema: DetermineRiskSentimentOutputSchema},
  prompt: `Anda adalah seorang analis risiko ahli yang bertugas mengklasifikasikan sifat sebuah risiko.
Analisis Kategori Risiko dan deskripsi Risiko di bawah ini. Tentukan apakah risiko tersebut bersifat 'Positif' (merupakan peluang, keuntungan, atau peningkatan) atau 'Negatif' (merupakan ancaman, kerugian, atau penurunan). Jika tidak keduanya, anggap 'Netral'.

Contoh:
- Kategori: 'Finansial', Risiko: 'Keuntungan 1 jt - 5 jt' -> Sentimen: 'Positif'
- Kategori: 'Finansial', Risiko: 'Kerugian 1 jt - 5 jt' -> Sentimen: 'Negatif'
- Kategori: 'Operasi', Risiko: 'Penyalahgunaan hak akses oleh staff' -> Sentimen: 'Negatif'
- Kategori: 'Kinerja', Risiko: 'Signifikan berpengaruh dalam meningkatkan indeks kinerja' -> Sentimen: 'Positif'

Analisis input berikut:
- **Kategori Risiko:** {{riskCategory}}
- **Risiko:** {{risk}}

Tentukan sentimennya dan berikan output dalam format JSON yang diminta.`,
});

const determineRiskSentimentFlow = ai.defineFlow(
  {
    name: 'determineRiskSentimentFlow',
    inputSchema: DetermineRiskSentimentInputSchema,
    outputSchema: DetermineRiskSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
