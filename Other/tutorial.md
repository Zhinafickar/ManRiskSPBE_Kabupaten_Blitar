# Web dengan Next.js + Firebase

Project ini merupakan aplikasi berbasis Next.js yang terintegrasi dengan Firebase Authentication, Firestore Database, dan Gemini API. Aplikasi ini dapat dijalankan secara lokal maupun dideploy ke hosting seperti [Vercel](https://vercel.com/).

---

## Instalasi Auth dan Database (Firebase)

1. **Buat akun dan project di Firebase Console**  
   [https://console.firebase.google.com](https://console.firebase.google.com)

2. **Ambil API key dari Firebase Console dan API Gemini**
   - Masukkan ke dalam file `.env` sesuai contoh di file [`.env.example`](./.env.example)

3. **Aktifkan Authentication dan Firestore Database di Firebase**
   - Masuk ke menu **Build > Authentication** lalu aktifkan sign-in method (misalnya Email/Password)
   - Masuk ke **Build > Firestore Database**, lalu klik **Create Database**

4. **Atur Firestore Database Rules**
   - Salin aturan (rules) dari file berikut:  
     [`Rule Firestore Database`](./rulefirestoredatabase.rule)

---

## 💻 Instalasi Web (Next.js)

### 0. Install Next.js (jika belum)
 
[https://nodejs.org/id](https://nodejs.org/id)

---

### 1. **Download Project dari GitHub**

Clone atau unduh repositori ini dari GitHub.

```bash
git clone https://github.com/Zhinafickar/ManRiskSPBE_Kabupaten_Blitar.git
````

### 2. **Ekstrak** (jika file dalam format `.zip`)

### 3. **Masukkan API Firebase dan Gemini ke file `.env`**

Lihat contoh di:
[`.env.example`](./.env.example)

Buat file `.env` di root project dan salin format tersebut.

---

### 4. **Menjalankan Project di Localhost**

Buka terminal di direktori project dan jalankan perintah berikut:

```bash
npm install
npm run build
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

---

### 5. **Deploy ke Vercel**

Untuk menghosting aplikasi secara online:

```bash
npm install
npm install -g vercel
vercel
vercel --prod
```

> Ikuti instruksi login jika diminta.
> Setelah deploy selesai, kamu akan mendapatkan link URL public dari Vercel.

---

## Tambahan

* Kamu dapat menambahkan **custom domain** melalui dashboard Vercel.
* Jika ingin reset Firebase, pastikan kamu menghapus dokumen di Firestore dan atur ulang Authentication jika diperlukan.

---

## Lisensi

Proyek ini dilindungi oleh lisensi MIT. Silakan gunakan, modifikasi, dan sebarkan dengan menyertakan atribusi kepada pembuat.
