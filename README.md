# EduSpace — All-in-One Learning Platform

EduSpace adalah aplikasi web pembelajaran terpadu untuk jenjang SMP dan SMA. Guru dan siswa masuk menggunakan akun masing-masing untuk mengelola kelas, membagikan materi, mengerjakan tugas/ujian, berdiskusi, mengikuti video meeting, dan melihat nilai.

> **Status proyek:** frontend siap di-deploy ke GitHub Pages. Fitur autentikasi, database, chat, dan penilaian otomatis memerlukan konfigurasi Firebase. Video meeting menggunakan Jitsi Meet. Repository ini tidak otomatis membuat akun Firebase atau menerbitkan website ke akun GitHub pemilik repository.

## Demo / Live website

Setelah GitHub Pages aktif, alamat website biasanya:

[Buka EduSpace — Live Website](https://USERNAME.github.io/NAMA-REPOSITORY/)

Ganti `USERNAME` dan `NAMA-REPOSITORY` dengan akun dan nama repository GitHub milikmu. Setelah URL final diketahui, ganti tautan ini dengan alamat tersebut agar pengunjung dapat langsung membuka website tanpa mengunduh source code.

## Fitur

- Login dan pendaftaran dengan Firebase Authentication.
- Peran guru dan siswa dengan dashboard berbeda.
- Guru membuat kelas; siswa bergabung memakai kode kelas.
- Materi pembelajaran berupa tautan PDF, dokumen, atau video.
- Tugas/ujian pilihan ganda, beberapa soal per tugas, dan batas tanggal.
- Penilaian otomatis melalui Firebase Cloud Functions; kunci jawaban tidak dikirim ke browser siswa.
- Live chat per kelas menggunakan Firestore realtime listener.
- Video meeting tertanam di halaman EduSpace melalui Jitsi Meet.
- Rekap nilai siswa dan hasil pengerjaan yang dapat dilihat guru.
- Layout responsif untuk desktop dan ponsel.

## Teknologi

- HTML, CSS, JavaScript ES Modules
- Firebase Authentication
- Cloud Firestore + Firestore Security Rules
- Firebase Cloud Functions (Node.js 20)
- Jitsi Meet External API
- GitHub Pages untuk hosting frontend statis

## Struktur folder

```text
eduspace/
├── index.html
├── styles.css
├── app.js
├── firebase-config.example.js
├── firestore.rules
├── firebase.json
├── functions/
│   ├── index.js
│   └── package.json
└── README.md
```

## A. Siapkan Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru, misalnya `eduspace-sekolah`.
2. Tambahkan aplikasi Web (ikon `</>`), lalu salin konfigurasi Firebase.
3. Di Authentication → Sign-in method, aktifkan **Email/Password**.
4. Di Firestore Database, buat database dalam mode production.
5. Salin `firebase-config.example.js` menjadi file baru bernama **`firebase-config.js`**. Isi dengan konfigurasi dari Firebase Console:

```js
export const firebaseConfig = {
  apiKey: "API_KEY_DARI_FIREBASE",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
```

6. Di Firebase Console → Firestore Database → Rules, tempel isi file `firestore.rules`, lalu klik **Publish**.
7. Tambahkan domain GitHub Pages ke Authentication → Settings → Authorized domains. Contoh: `USERNAME.github.io`.

**Catatan konfigurasi:** Firebase Web API key memang berada di frontend dan bukan password rahasia. Keamanan data harus bergantung pada Authentication dan Firestore Security Rules, bukan menyembunyikan API key.

## B. Aktifkan akun guru

Pendaftaran publik selalu membuat akun berperan `student`, meskipun pendaftar memilih opsi guru. Ini disengaja agar pengunjung tidak dapat memberi dirinya sendiri hak akses pengajar.

Untuk mengaktifkan akun guru:

1. Minta calon guru mendaftar terlebih dahulu melalui EduSpace.
2. Buka Firebase Console → Firestore Database → `users`.
3. Cari dokumen dengan ID UID pengguna tersebut (UID dapat dilihat di Authentication → Users).
4. Ubah field `role` dari `student` menjadi `teacher`.
5. Pengguna keluar lalu masuk kembali agar dashboard guru dimuat.

Lakukan langkah ini hanya untuk akun guru yang telah diverifikasi oleh pengelola sekolah. Jangan memberikan akses Console kepada siswa.

## C. Deploy Cloud Functions untuk penilaian otomatis

Penilaian berjalan di server agar kunci jawaban tidak perlu dibagikan ke browser siswa. Deploy Cloud Functions memerlukan Node.js 20 dan Firebase CLI. Untuk deployment Functions, Firebase biasanya meminta project menggunakan paket **Blaze (pay-as-you-go)**. Periksa harga dan batas penggunaan Firebase sebelum mengaktifkannya.

1. Instal Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Dari folder proyek, pilih project Firebase: `firebase use --add`
4. Instal dependensi function:

```bash
cd functions
npm install
cd ..
```

5. Deploy rules dan function:

```bash
firebase deploy --only firestore:rules,functions
```

Jika tidak ingin mengaktifkan Cloud Functions/billing, jangan menganggap ujian sudah aman untuk penilaian otomatis. Gunakan versi latihan tanpa nilai resmi atau implementasikan backend penilaian lain yang aman.

## D. Deploy ke GitHub Pages

1. Buat repository GitHub baru, misalnya `eduspace`.
2. Upload seluruh isi folder proyek ke root repository. Pastikan `index.html`, `app.js`, `styles.css`, dan `firebase-config.js` berada di root yang sama.
3. Buka repository → **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
6. Tunggu proses deployment selesai. GitHub akan menampilkan alamat website, misalnya `https://USERNAME.github.io/eduspace/`.
7. Uji alamat tersebut. Pastikan `firebase-config.js` ikut di-upload dan domain GitHub Pages sudah ditambahkan ke Authorized domains Firebase.
8. Edit bagian **Demo / Live website** di README ini dengan URL final.

Jika menggunakan nama repository khusus `USERNAME.github.io`, URL website biasanya menjadi `https://USERNAME.github.io/` (tanpa nama folder repository).

## E. Uji coba alur penggunaan

1. Buat satu akun guru dan aktifkan perannya melalui Firebase Console.
2. Buat akun siswa dari halaman pendaftaran.
3. Login sebagai guru, buat kelas, lalu bagikan kode kelas kepada siswa.
4. Login sebagai siswa dan gabung menggunakan kode kelas.
5. Guru membagikan materi dan membuat tugas pilihan ganda.
6. Siswa mengerjakan tugas. Hasil penilaian otomatis muncul pada halaman Nilai.
7. Coba kirim pesan melalui Diskusi kelas.
8. Buat nama ruang di halaman Video meeting dan bagikan nama ruang itu kepada anggota kelas.

## Catatan dan batasan

- GitHub Pages hanya menyajikan frontend statis. Data dan autentikasi disimpan di Firebase.
- Materi saat ini dibagikan menggunakan URL eksternal. Upload file langsung belum disediakan; jika diperlukan, tambahkan Firebase Storage beserta Storage Rules.
- Chat saat ini mendukung pesan teks, belum mendukung lampiran, moderasi, atau pelaporan pesan.
- Video meeting memakai layanan publik `meet.jit.si`. Ketersediaan, kebijakan, kapasitas, dan fitur layanan mengikuti Jitsi. Untuk penggunaan sekolah berskala besar atau sensitif, gunakan server Jitsi terkelola/khusus dan kebijakan privasi sekolah.
- Jangan gunakan layanan meeting publik untuk membahas data siswa yang sensitif. Pastikan sekolah memperoleh persetujuan dan mematuhi kebijakan perlindungan data yang berlaku.
- Aplikasi ini merupakan starter project/produk awal, bukan sistem sekolah tersertifikasi. Uji akses, aturan data, beban pengguna, dan kebijakan sekolah sebelum penggunaan produksi.
- Saat ini satu akun siswa hanya dapat mengirim satu submission per tugas. Jika perlu remedial atau percobaan ulang, tambahkan kebijakan percobaan pada backend.

## Lisensi

Silakan gunakan dan kembangkan proyek ini untuk pembelajaran. Tambahkan atribusi jika membagikan versi turunan.
