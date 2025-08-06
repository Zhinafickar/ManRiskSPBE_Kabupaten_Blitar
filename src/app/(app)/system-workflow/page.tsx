
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Workflow, User, Server, Cpu, Database, BarChart3, Users } from 'lucide-react';

export default function SystemWorkflowPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-6 w-6" />
                    Alur Kerja Sistem Manajemen Risiko
                </CardTitle>
                <CardDescription>
                    Penjelasan teknis mengenai arsitektur dan alur data dari frontend hingga backend.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-lg">1. Interaksi Pengguna (Frontend)</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 space-y-2 text-muted-foreground">
                            <p>Sisi klien dibangun menggunakan <strong>Next.js 14</strong> dengan <strong>App Router</strong>, memastikan navigasi yang cepat dan rendering sisi server (SSR) yang efisien. State management global untuk otentikasi ditangani melalui <strong>React Context</strong>.</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Komponen UI</strong>: Menggunakan <strong>ShadCN/UI</strong> dan <strong>Tailwind CSS</strong> untuk membangun antarmuka yang responsif dan konsisten.</li>
                                <li><strong>Manajemen Form</strong>: Validasi input dan state form dikelola oleh <strong>React Hook Form</strong> dengan skema validasi dari <strong>Zod</strong>.</li>
                                <li><strong>Otentikasi</strong>: Proses login dan registrasi menggunakan <strong>Firebase Authentication (Client SDK)</strong>. Status pengguna (login/logout) dipantau secara real-time.</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>
                            <div className="flex items-center gap-3">
                                <Server className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-lg">2. Komunikasi ke Backend</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 space-y-2 text-muted-foreground">
                            <p>Komunikasi antara frontend dan backend memanfaatkan beberapa mekanisme modern yang disediakan oleh Next.js dan Firebase.</p>
                             <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Next.js Server Actions</strong>: Digunakan untuk beberapa operasi backend sederhana, seperti verifikasi token admin, memungkinkan fungsi server dieksekusi langsung dari komponen klien tanpa membuat endpoint API manual.</li>
                                <li><strong>Firebase Client SDK</strong>: Sebagian besar interaksi dengan database (CRUD - Create, Read, Update, Delete) dilakukan melalui <strong>`firebase/firestore`</strong>. Fungsi-fungsi ini diabstraksi dalam file-file service (`src/services/*.ts`) untuk menjaga keterbacaan kode. Ini memungkinkan update data secara real-time di beberapa halaman.</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>
                            <div className="flex items-center gap-3">
                                <Database className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-lg">3. Penyimpanan Data (Backend)</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 space-y-2 text-muted-foreground">
                            <p>Seluruh data persisten aplikasi disimpan di <strong>Google Firestore</strong>, sebuah database NoSQL yang fleksibel dan skalabel.</p>
                             <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Koleksi Utama</strong>: `users`, `surveys`, `continuityPlans`, `roles`, dan `adminTokens` adalah koleksi utama yang menyimpan data aplikasi.</li>
                                <li><strong>Aturan Keamanan</strong>: Akses ke data Firestore diatur oleh <strong>Firestore Security Rules</strong> (didefinisikan dalam `firestore.rules`). Aturan ini memastikan bahwa pengguna hanya dapat membaca/menulis data yang diizinkan sesuai dengan UID (User ID) dan peran mereka.</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>
                            <div className="flex items-center gap-3">
                                <Cpu className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-lg">4. Pemrosesan AI dengan Genkit</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 space-y-2 text-muted-foreground">
                            <p>Fitur-fitur cerdas di aplikasi ini ditenagai oleh <strong>Genkit</strong>, sebuah framework dari Google untuk membangun aplikasi AI.</p>
                             <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Definisi Flow</strong>: Setiap tugas AI (misalnya, menyarankan mitigasi, meringkas risiko) didefinisikan sebagai `flow` dalam direktori `src/ai/flows`. Setiap flow memiliki skema input dan output yang divalidasi oleh <strong>Zod</strong>.</li>
                                <li><strong>Model AI</strong>: Flow ini memanggil model AI generatif (seperti Gemini) melalui plugin `googleAI` yang telah dikonfigurasi di `src/ai/genkit.ts`.</li>
                                <li><strong>Eksekusi</strong>: Komponen klien (misalnya, form survei) memanggil fungsi flow ini sebagai Server Actions, mengirimkan data yang diperlukan, dan menerima output terstruktur dalam format JSON untuk ditampilkan di UI.</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5">
                        <AccordionTrigger>
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-lg">5. Alur Kerja Admin & Superadmin</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 space-y-2 text-muted-foreground">
                            <p>Admin dan Superadmin memiliki kapabilitas yang lebih luas, yang difasilitasi oleh arsitektur yang sama.</p>
                             <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Akses Data Agregat</strong>: Halaman admin dan superadmin (misalnya, "Semua Hasil Survei") melakukan query ke Firestore tanpa filter `userId`, sehingga mengambil semua dokumen dari koleksi yang relevan.</li>
                                <li><strong>Manajemen Pengguna</strong>: Superadmin dapat mengedit atau menghapus data pengguna langsung di koleksi `users`. Perubahan pada peran juga akan memperbarui koleksi `roles` untuk menjaga konsistensi data.</li>
                                <li><strong>Visualisasi Data</strong>: Halaman visualisasi mengambil semua data survei, lalu melakukan agregasi dan kalkulasi di sisi klien menggunakan `react` (`useMemo`) dan menampilkannya dengan library <strong>Recharts</strong>.</li>
                                <li><strong>Analisis AI Global</strong>: Dasbor admin memicu flow Genkit `summarizeRisksAndPlans` yang menganalisis seluruh data survei dan kontinuitas untuk memberikan ringkasan tren risiko secara global.</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
