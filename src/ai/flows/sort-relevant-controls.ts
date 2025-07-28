'use server';
/**
 * @fileOverview This file defines a Genkit flow for intelligently sorting ISO 27001 controls.
 *
 * - sortRelevantControls - A function that reorders lists of controls based on risk context.
 * - SortRelevantControlsInput - The input type for the function.
 * - SortRelevantControlsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {
    SortRelevantControlsInputSchema,
    SortRelevantControlsOutputSchema,
    type SortRelevantControlsInput,
    type SortRelevantControlsOutput,
} from '@/types/controls';
import {
  ORGANIZATIONAL_CONTROLS,
  PEOPLE_CONTROLS,
  PHYSICAL_CONTROLS,
  TECHNOLOGICAL_CONTROLS
} from '@/constants/data';


export async function sortRelevantControls(input: SortRelevantControlsInput): Promise<SortRelevantControlsOutput> {
  return sortRelevantControlsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sortRelevantControlsPrompt',
  input: {schema: SortRelevantControlsInputSchema},
  output: {schema: SortRelevantControlsOutputSchema},
  prompt: `Anda adalah seorang analis risiko ahli ISO 27001. Tugas Anda adalah menyortir daftar kendali keamanan secara cerdas berdasarkan relevansinya terhadap skenario risiko tertentu.

Analisis konteks risiko yang diberikan:
-   **Kategori Risiko:** {{riskEvent}}
-   **Risiko:** {{impactArea}}
-   **Area Dampak:** {{areaDampak}}
-   **Penyebab:** {{cause}}
-   **Dampak:** {{impact}}
-   **Tingkat Risiko:** {{riskLevel}}

Anda diberi empat daftar kendali lengkap: Organisasi, Orang, Fisik, dan Teknologi.
Untuk setiap daftar, Anda HARUS mengembalikan daftar kendali **asli yang lengkap**, tetapi diurutkan ulang sehingga kendali yang paling relevan untuk memitigasi risiko spesifik yang dijelaskan di atas muncul di bagian atas. Jangan menambah atau menghapus kendali apa pun dari daftar asli.

**Contoh Logika:**
- Jika risikonya tentang "Pencurian data sensitif oleh staf", daftar "Kontrol Orang" harus memprioritaskan kendali seperti "6.1 Penyaringan", "6.2 Syarat dan ketentuan kerja", dan "6.6 Perjanjian kerahasiaan...".
- Jika risikonya tentang "Serangan virus", daftar "Kontrol Teknologi" harus memprioritaskan "8.7 Perlindungan terhadap malware" dan "8.20 Keamanan jaringan".
- Jika risikonya tentang "Bencana alam" seperti banjir, daftar "Kontrol Fisik" harus memprioritaskan "7.5 Melindungi dari ancaman fisik dan lingkungan" dan "7.11 Utilitas pendukung".

Kembalikan empat daftar yang telah disortir dalam format JSON yang ditentukan.

**Daftar Kendali Lengkap (sebagai referensi Anda untuk memastikan semua item dikembalikan):**

**Kontrol Organisasi:**
${[...ORGANIZATIONAL_CONTROLS].join('\n')}

**Kontrol Orang:**
${[...PEOPLE_CONTROLS].join('\n')}

**Kontrol Fisik:**
${[...PHYSICAL_CONTROLS].join('\n')}

**Kontrol Teknologi:**
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
