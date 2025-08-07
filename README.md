# Manajemen Risiko SPBE OPD Kabupaten Blitar

Repositori ini berisi source code dari sistem web untuk manajemen risiko. Aplikasi ini dikembangkan menggunakan **Next.js 14**, **Firebase**, dan **Genkit**.

- Lihat file konfigurasi rule firestore database: [firestore Database Rules](./Other/rulefirestoredatabase.rule) (Masukkan di "Firestore Database" bagian Rulenya)

- Contoh konfigurasi .env: [.env.example](./Other/.env.example)
---

## 0. Landasan Kerangka Kerja Internasional

Sistem ini dibangun di atas praktik terbaik dan standar internasional untuk memastikan pendekatan yang terstruktur dan komprehensif terhadap manajemen risiko.

### Identifikasi Risiko (ISO 31000 & COBIT 5)
Daftar kategori risiko dan risiko spesifik yang tersedia di formulir mengadopsi prinsip dari **ISO 31000** (Manajemen Risiko) dan **COBIT 5 for Risk**. Hal ini memastikan bahwa semua area potensial risiko dalam konteks teknologi informasi dan pemerintahan telah tercakup secara sistematis.

### Kontrol & Mitigasi (ISO 27001)
Opsi kontrol kendali yang dapat dipilih (Organisasi, Orang, Fisik, Teknologi) diambil langsung dari **lampiran A standar ISO 27001:2022**. Ini membantu pengguna dalam memilih tindakan mitigasi yang relevan dan diakui secara global untuk mengamankan aset informasi.  

### Kelangsungan Bisnis (ISO 22301)
Proses pembuatan rencana kontinuitas terinspirasi dari prinsip-prinsip dalam **ISO 22301**, dengan fokus pada:
- Identifikasi aktivitas pemulihan kritis
- **RTO** (*Recovery Time Objective*)
- **RPO** (*Recovery Point Objective*)  

Semua aspek tersebut ditujukan untuk risiko yang telah dinilai secara sistematis.

---

## 1. Interaksi Pengguna (Frontend)

Sisi klien dibangun menggunakan **Next.js 14** dengan **App Router**, memungkinkan navigasi cepat dan rendering sisi server (SSR) yang efisien. State global dikelola melalui **React Context** khususnya untuk autentikasi pengguna.

- **UI Components**: Dibangun dengan [ShadCN/UI](https://ui.shadcn.com/) dan **Tailwind CSS** untuk tampilan responsif dan konsisten.
- **Manajemen Form**: Validasi dan kontrol form menggunakan **React Hook Form** dan **Zod** untuk skema validasi.
- **Otentikasi Pengguna**: Login dan registrasi ditangani melalui **Firebase Authentication (Client SDK)**, dengan status pengguna dipantau secara real-time.

---

## 2. Komunikasi ke Backend

Aplikasi memanfaatkan fitur-fitur modern dari **Next.js** dan **Firebase** untuk komunikasi antara frontend dan backend:

- **Next.js Server Actions**: Digunakan untuk operasi server sederhana seperti verifikasi token admin secara langsung dari komponen klien, tanpa endpoint API manual.
- **Firebase Client SDK**: Sebagian besar operasi **CRUD** dilakukan terhadap Firestore, dan telah diabstraksi dalam file layanan untuk menjaga modularitas dan keterbacaan.
- **Real-time Update**: Beberapa halaman dapat menampilkan data yang selalu up-to-date berkat fitur snapshot dari Firestore.

---

## 3. Penyimpanan Data (Backend)

Data aplikasi disimpan secara persisten di **Google Firestore**, sebuah database NoSQL yang fleksibel dan skalabel.

- **Koleksi Utama**:
  - `users`
  - `surveys`
  - `continuityPlans`
  - `roles`
- **Aturan Keamanan**: Akses ke Firestore diatur menggunakan **Firestore Security Rules** untuk memastikan hanya pengguna yang berwenang yang dapat membaca atau menulis data sesuai UID dan peran mereka.

---

## 4. Pemrosesan AI dengan Genkit

Fitur cerdas dalam sistem ini didukung oleh [**Genkit**](https://ai.google.dev/genkit), framework dari Google untuk workflow AI yang efisien.

- **Flow AI**: Proses seperti menyarankan mitigasi atau meringkas risiko didefinisikan sebagai `flow` yang tervalidasi input/output-nya menggunakan **Zod**.
- **Model AI**: Flow memanggil model AI generatif seperti **Gemini** melalui plugin `googleAI`.
- **Eksekusi AI**: Flow AI dipanggil melalui **Server Actions**, mengirimkan data dari klien dan mengembalikan hasil berupa JSON terstruktur untuk ditampilkan di UI.

---

## 5. Alur Kerja Admin & Superadmin

Admin dan Superadmin memiliki kapabilitas lanjutan untuk mengelola data secara menyeluruh:

- **Akses Data Agregat**: Halaman admin dapat mengambil semua dokumen dari koleksi Firestore tanpa filter `userId`, untuk keperluan monitoring global.
- **Manajemen Pengguna**: Superadmin memiliki hak untuk mengedit atau menghapus data pengguna, termasuk memperbarui peran di koleksi `roles`.
- **Visualisasi Data**: Data hasil survei ditampilkan menggunakan **Recharts**, dengan agregasi data yang diproses di sisi klien menggunakan React `useMemo`.
- **Analisis AI Global**: Halaman dashboard admin memicu flow `summarizeRisksAndPlans` untuk menghasilkan ringkasan tren risiko dan rencana kontinuitas berdasarkan seluruh data survei.

---

## 6. Alur Kerja Pengguna (User Workflow)

Alur kerja pengguna dirancang untuk memandu mereka melalui proses manajemen risiko secara sistematis, dari identifikasi hingga pelaporan.

- **Dashboard Pengguna**: Setelah login, pengguna melihat ringkasan aktivitas mereka. Data ini diambil dari koleksi `surveys` dan `continuityPlans` di Firestore, difilter berdasarkan `userId` pengguna yang login.
- **Input Survei**: Pengguna mengisi formulir di halaman `/user/survey-1`. Data dari formulir ini, termasuk pilihan kontrol dan mitigasi (yang dibantu oleh flow AI `suggestMitigation` dan `sortRelevantControls`), disimpan sebagai dokumen baru di koleksi `surveys`.
- **Input Rencana Kontinuitas**: Pengguna memilih risiko dari survei mereka untuk dijadikan dasar rencana kontinuitas. Flow AI `suggestContinuityPlan` dapat dipanggil untuk memberikan rekomendasi. Hasilnya disimpan sebagai dokumen di koleksi `continuityPlans`.
- **Tinjauan Hasil & Laporan**: Halaman seperti "Grafik" dan "Laporan Akhir" menampilkan seluruh data milik pengguna secara agregat. Visualisasi menggunakan **Recharts** dan ringkasan dibantu oleh flow AI `summarizeUserRisksAndPlans`.

---

## Teknologi yang Digunakan

- **Next.js 14 (App Router, Server Actions)**
- **Firebase (Authentication, Firestore)**
- **Genkit + Google AI Plugin**
- **Tailwind CSS + ShadCN/UI**
- **React Hook Form + Zod**
- **Recharts (visualisasi data)**

---

## Status Proyek

 *Masih dalam tahap pengembangan aktif.*

---

## Instalasi

Ingin coba membuat untuk Daerah Lain? cek disini
[Tutorial Download sampai akses](./Other/tutorial.md)

---

## Lisensi

Proyek ini menggunakan [MIT License](LICENSE).
