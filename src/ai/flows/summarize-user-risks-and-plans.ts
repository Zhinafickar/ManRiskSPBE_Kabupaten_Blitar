'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing a single user's risks and continuity plans.
 *
 * - summarizeUserRisksAndPlans - A function that analyzes a specific user's survey and continuity data.
 * - SummarizeUserRisksAndPlansInput - The input type for the function.
 * - SummarizeUserRisksAndPlansOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUserRisksAndPlansInputSchema = z.object({
  userRole: z.string().describe("The user's role or department name."),
  userSurveyData: z.string().describe("A JSON string of all survey data submitted by this specific user."),
  userContinuityData: z.string().describe("A JSON string of all continuity plan data submitted by this specific user."),
});
export type SummarizeUserRisksAndPlansInput = z.infer<typeof SummarizeUserRisksAndPlansInputSchema>;

const SummarizeUserRisksAndPlansOutputSchema = z.object({
  summary: z.string().describe('A concise, analytical summary for the specific user, highlighting their key risks, preparedness level, and any gaps between high-level risks and their continuity plans.'),
});
export type SummarizeUserRisksAndPlansOutput = z.infer<typeof SummarizeUserRisksAndPlansOutputSchema>;


export async function summarizeUserRisksAndPlans(input: SummarizeUserRisksAndPlansInput): Promise<SummarizeUserRisksAndPlansOutput> {
  return summarizeUserRisksAndPlansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUserRisksAndPlansPrompt',
  input: {schema: SummarizeUserRisksAndPlansInputSchema},
  output: {schema: SummarizeUserRisksAndPlansOutputSchema},
  prompt: `Anda adalah seorang analis risiko ahli yang bertugas membuat ringkasan formal untuk laporan resmi di sebuah instansi pemerintah di Indonesia.

Analisis data survei risiko dan rencana kontinuitas untuk departemen berikut: **{{userRole}}**.

**Langkah Analisis:**
1.  **Identifikasi Risiko Prioritas:** Tentukan risiko paling signifikan berdasarkan 'riskLevel' (misalnya, 'Bahaya', 'Sedang'). Catat kategori 'riskEvent' yang paling sering muncul.
2.  **Evaluasi Kesiapan Kontinuitas:** Bandingkan risiko prioritas yang teridentifikasi dengan rencana kontinuitas yang telah dibuat ('userContinuityData'). Identifikasi apakah ada risiko prioritas tinggi yang belum memiliki rencana kontinuitas yang sesuai.
3.  **Sintesis Temuan:** Gabungkan poin-poin ini menjadi ringkasan yang padat, formal, dan analitis (2-3 kalimat) yang cocok untuk laporan resmi. Gunakan bahasa yang baku dan objektif. Hindari sapaan langsung seperti "Anda" atau "departemen Anda". Mulailah dengan temuan paling kritis.

**Contoh Ringkasan Formal:**
"Berdasarkan analisis data, risiko utama yang teridentifikasi di {{userRole}} berkaitan dengan [Kategori Risiko Utama]. Terdapat beberapa risiko dengan tingkat 'Bahaya' yang memerlukan perhatian segera, di mana sebagian belum memiliki rencana kontinuitas yang memadai."

**Data untuk Analisis:**
-   **Data Survei Pengguna:** {{userSurveyData}}
-   **Data Kontinuitas Pengguna:** {{userContinuityData}}

Sediakan output Anda dalam format JSON yang diminta.`,
});

const summarizeUserRisksAndPlansFlow = ai.defineFlow(
  {
    name: 'summarizeUserRisksAndPlansFlow',
    inputSchema: SummarizeUserRisksAndPlansInputSchema,
    outputSchema: SummarizeUserRisksAndPlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
