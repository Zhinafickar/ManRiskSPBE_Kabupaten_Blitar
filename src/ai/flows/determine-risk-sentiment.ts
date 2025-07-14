'use server';
/**
 * @fileOverview This file defines a Genkit flow for determining the sentiment of a given risk.
 *
 * - determineRiskSentiment - A function that analyzes a risk's category and description to classify its sentiment.
 * - DetermineRiskSentimentInput - The input type for the function.
 * - DetermineRiskSentimentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {
    DetermineRiskSentimentInputSchema,
    DetermineRiskSentimentOutputSchema,
    type DetermineRiskSentimentInput,
    type DetermineRiskSentimentOutput,
} from '@/types/sentiment';


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
