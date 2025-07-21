import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ClipboardList, Recycle, FileCheck, ArrowRight, Printer, Info } from "lucide-react";

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
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Langkah 1: Pelajari Referensi & Informasi Penting</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p>Sebelum memulai, sangat disarankan untuk memahami dasar-dasar yang digunakan dalam aplikasi ini. Informasi ini akan membantu Anda mengisi formulir dengan lebih akurat.</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Buka menu navigasi di sebelah kiri, lalu klik pada bagian <strong>Informasi Penting</strong>.</li>
                <li>
                  Pelajari halaman-halaman berikut:
                  <ul className="list-disc list-inside pl-6 mt-2 space-y-1">
                    <li><strong>Referensi Perhitungan:</strong> Memahami bagaimana tingkat risiko (Bahaya, Sedang, Rendah, Minor) ditentukan berdasarkan matriks 5x5.</li>
                    <li><strong>Referensi Inputan:</strong> Melihat semua daftar Kategori Risiko, Risiko Spesifik, Kontrol Kendali, dan Opsi Mitigasi yang tersedia di dalam sistem.</li>
                    <li><strong>Tutorial:</strong> Halaman yang sedang Anda baca saat ini.</li>
                    <li><strong>OPD Lain:</strong> Melihat status pengisian dari Organisasi Perangkat Daerah (OPD) lainnya.</li>
                  </ul>
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Langkah 2: Mengisi Survei Risiko</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p>Tahap selanjutnya adalah mengidentifikasi dan melaporkan risiko yang ada di unit kerja Anda. Semakin lengkap data yang Anda masukkan, semakin akurat analisisnya.</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Buka menu navigasi, lalu klik pada bagian <strong>Manajemen Risiko</strong>.</li>
                <li>
                  Pilih <strong>Input Form</strong> untuk melaporkan satu kejadian risiko secara rinci.
                </li>
                <li>Isi semua kolom yang diperlukan. Manfaatkan tombol <strong>"✨ Beri Saran (AI)"</strong> untuk mendapatkan bantuan mengisi kolom Penyebab dan Dampak, atau <strong>"🔄 Sortir Pilihan dengan AI"</strong> untuk mengurutkan daftar kontrol berdasarkan relevansi.</li>
                <li>Perhatikan bahwa <strong>Tingkat Risiko</strong> akan dihitung secara otomatis setelah Anda memilih Frekuensi dan Besaran Dampak.</li>
                <li>Setelah selesai, klik tombol "Kirim Survei". Anda dapat melihat hasil input Anda di menu <strong>Hasil Survey Anda</strong>.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>
               <div className="flex items-center gap-3">
                <Recycle className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Langkah 3: Membuat Rencana Kontinuitas</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p>Setelah risiko dilaporkan, Anda perlu membuat rencana untuk menanganinya. Ini memastikan layanan tetap berjalan jika risiko tersebut terjadi.</p>
               <ol className="list-decimal list-inside space-y-2">
                <li>Buka menu navigasi, lalu klik pada bagian <strong>Kontinuitas</strong>, dan pilih submenu <strong>Input Rencana</strong>.</li>
                <li>Pada formulir, klik dropdown <strong>RISIKO</strong> untuk memilih salah satu risiko yang telah Anda laporkan pada Langkah 2.</li>
                <li>Isi detail rencana pemulihan, seperti aktivitas, target waktu, dan Penanggung Jawab (PIC). Anda juga bisa menggunakan saran dari AI.</li>
                <li>Isi juga nilai <strong>RTO (Recovery Time Objective)</strong> dan <strong>RPO (Recovery Point Objective)</strong>.</li>
                <li>Klik "Simpan Semua Rencana" untuk menyimpan data Anda. Anda dapat menambahkan beberapa rencana untuk satu risiko yang sama.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>
               <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Langkah 4: Meninjau Hasil dan Laporan</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <p>Aplikasi ini menyediakan beberapa halaman untuk meninjau dan menganalisis data yang telah Anda kirimkan:</p>
              <ul className="list-none space-y-3">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                  <span><strong>Hasil Survey Anda & Rencana Terinput:</strong> Di bawah menu "Manajemen Risiko" dan "Kontinuitas", Anda dapat melihat semua data yang telah dikirim dalam format tabel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                  <span><strong>Grafik:</strong> Menampilkan visualisasi data risiko Anda dalam bentuk diagram lingkaran (pie chart) untuk melihat distribusi tingkat risiko secara cepat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                  <span><strong>Laporan Akhir:</strong> Ini adalah halaman terpenting. Halaman ini memberikan ringkasan lengkap dari semua data Anda dalam format laporan yang siap cetak, termasuk analisis, tabel, grafik, dan kesimpulan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Printer className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
                  <span><strong>Mencetak Laporan:</strong> Di halaman "Laporan Akhir", gunakan tombol <strong>"Cetak Laporan"</strong> untuk menghasilkan dokumen PDF atau mencetaknya langsung.</span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
