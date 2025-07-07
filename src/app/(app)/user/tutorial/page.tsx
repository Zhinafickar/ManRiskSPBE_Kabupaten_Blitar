import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ClipboardList, Recycle, FileCheck, ArrowRight } from "lucide-react";

export default function TutorialPage({}: {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Tutorial Penggunaan Aplikasi
        </CardTitle>
        <CardDescription>
          Panduan langkah demi langkah untuk menggunakan aplikasi Manajemen Risiko SPBE.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Langkah 1: Mengisi Survei Risiko</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p>Langkah pertama adalah mengidentifikasi dan melaporkan risiko yang ada di unit kerja Anda.</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Buka menu navigasi di sebelah kiri, lalu klik pada bagian <strong>Manajement Risiko</strong>.</li>
                <li>
                  Anda akan melihat dua pilihan untuk menginput data:
                  <ul className="list-disc list-inside pl-6 mt-2 space-y-1">
                    <li><strong>Input Form (Single):</strong> Gunakan ini jika Anda ingin melaporkan satu kejadian risiko secara detail.</li>
                    <li><strong>input Tabel (Multi):</strong> Gunakan ini jika Anda ingin melaporkan beberapa kejadian risiko sekaligus dalam format tabel yang lebih cepat.</li>
                  </ul>
                </li>
                <li>Isi semua kolom yang diperlukan. Perhatikan bahwa Tingkat Risiko akan dihitung secara otomatis setelah Anda memilih Frekuensi dan Besaran Dampak.</li>
                <li>Setelah selesai, klik tombol "Kirim Survei" atau "Kirim Semua".</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
               <div className="flex items-center gap-3">
                <Recycle className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Langkah 2: Membuat Rencana Kontinuitas</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p>Setelah risiko diidentifikasi, Anda perlu membuat rencana untuk menanganinya. Ini memastikan keberlanjutan layanan jika risiko tersebut terjadi.</p>
               <ol className="list-decimal list-inside space-y-2">
                <li>Buka menu navigasi, lalu klik pada bagian <strong>Kontinuitas</strong>.</li>
                <li>Pilih submenu <strong>Input Rencana</strong>.</li>
                <li>Pada formulir, klik dropdown <strong>RISIKO</strong>. Anda hanya akan melihat daftar risiko yang telah Anda laporkan pada Langkah 1 dan yang belum memiliki rencana kontinuitas.</li>
                <li>Isi detail rencana pemulihan, seperti aktivitas, target waktu, dan penanggung jawab (PIC).</li>
                <li>Klik "Simpan Rencana" untuk menyimpan data Anda.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
               <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Langkah 3: Melihat Hasil dan Kesimpulan</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p>Aplikasi ini menyediakan beberapa halaman untuk meninjau data yang telah Anda kirimkan:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                  <span><strong>Hasil Survey Anda:</strong> Di bawah menu "Manajement Risiko", halaman ini menampilkan semua data survei risiko Anda dalam format tabel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                  <span><strong>Rencana Terinput:</strong> Di bawah menu "Kontinuitas", halaman ini menampilkan semua rencana kontinuitas yang telah Anda buat.</span>
                </li>
                 <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                  <span><strong>Grafik:</strong> Menampilkan visualisasi data risiko Anda dalam bentuk diagram lingkaran (pie chart) untuk melihat distribusi tingkat risiko secara cepat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                  <span><strong>Conclusion/Kesimpulan:</strong> Halaman ini memberikan ringkasan lengkap dari semua data Anda, termasuk risiko prioritas yang memerlukan perhatian lebih.</span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
