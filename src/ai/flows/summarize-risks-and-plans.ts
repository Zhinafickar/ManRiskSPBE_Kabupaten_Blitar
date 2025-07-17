'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing all risks and continuity plans.
 *
 * - summarizeRisksAndPlans - A function that analyzes all survey and continuity data to provide a high-level summary.
 * - SummarizeRisksAndPlansInput - The input type for the function.
 * - SummarizeRisksAndPlansOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRisksAndPlansInputSchema = z.object({
  allSurveyData: z.string().describe('A JSON string of all survey data from all users.'),
  allContinuityData: z.string().describe('A JSON string of all continuity plan data from all users.'),
});
export type SummarizeRisksAndPlansInput = z.infer<typeof SummarizeRisksAndPlansInputSchema>;

const SummarizeRisksAndPlansOutputSchema = z.object({
  summary: z.string().describe('A concise, analytical summary of the overall risk landscape, identifying key trends, high-risk departments, and the status of continuity planning.'),
});
export type SummarizeRisksAndPlansOutput = z.infer<typeof SummarizeRisksAndPlansOutputSchema>;


export async function summarizeRisksAndPlans(input: SummarizeRisksAndPlansInput): Promise<SummarizeRisksAndPlansOutput> {
  return summarizeRisksAndPlansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRisksAndPlansPrompt',
  input: {schema: SummarizeRisksAndPlansInputSchema},
  output: {schema: SummarizeRisksAndPlansOutputSchema},
  prompt: `Anda adalah seorang analis risiko ahli untuk sebuah badan pemerintah di Indonesia. Tugas Anda adalah memberikan ringkasan tingkat tinggi dari lanskap risiko saat ini berdasarkan data dari berbagai departemen.

Analisis data JSON yang disediakan untuk semua survei risiko dan rencana kesinambungan.

**Langkah Analisis:**
1.  **Identifikasi Area Berisiko Tinggi:** Tentukan departemen ('userRole') mana yang paling banyak melaporkan risiko, terutama yang memiliki tingkat 'Bahaya' atau 'Sedang'.
2.  **Temukan Kategori Risiko Umum:** Identifikasi kategori 'riskEvent' mana yang paling sering muncul di semua survei.
3.  **Nilai Kesiapan Kesinambungan:** Bandingkan risiko yang teridentifikasi (terutama yang berprioritas tinggi) dengan rencana kesinambungan yang telah diajukan. Catat adanya kesenjangan di mana risiko prioritas tinggi tidak memiliki rencana yang sesuai.
4.  **Sintesis Temuan:** Gabungkan poin-poin ini menjadi ringkasan yang padat dan mudah dibaca (2-4 kalimat) dengan bahasa formal. Mulailah dengan temuan yang paling kritis.

**Data untuk Analisis:**
-   **Semua Data Survei:** {{allSurveyData}}
-   **Semua Data Rencana Kesinambungan:** {{allContinuityData}}

Sediakan output Anda dalam format JSON yang diminta.`,
});

const summarizeRisksAndPlansFlow = ai.defineFlow(
  {
    name: 'summarizeRisksAndPlansFlow',
    inputSchema: SummarizeRisksAndPlansInputSchema,
    outputSchema: SummarizeRisksAndPlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
