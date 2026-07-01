# Dokumentasi Backend: Sistem Reservasi Ruangan (BookingRoam)

Dokumen ini berisi panduan lengkap tentang cara menjalankan server backend, penjelasan arsitektur, serta daftar fitur-fitur yang tersedia di dalam sistem.

---

## 🚀 Cara Menjalankan Project

Ikuti langkah-langkah di bawah ini untuk menghidupkan server backend di komputer lokal Anda:

### 1. Persiapan Database (MySQL/MariaDB)
1. Buka aplikasi XAMPP, pastikan **Apache** dan **MySQL** sudah dalam keadaan *Start*.
2. Buka browser dan akses `http://localhost/phpmyadmin`.
3. Buat database baru bernama **`bookingroam_db`**.

### 2. Konfigurasi Environment
Pastikan Anda berada di dalam folder `backend/`, lalu periksa file `.env`. Pastikan konfigurasi database sudah sesuai:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bookingroam_db
JWT_SECRET=supersecretkey_untuk_bookingroam
```

### 3. Migrasi Schema Database (Drizzle ORM)
Untuk membuat seluruh tabel ke dalam MySQL secara otomatis, jalankan perintah berikut di terminal (pastikan Anda berada di direktori `backend`):
```bash
npm run db:push
```

### 4. Inisialisasi Akun Admin
Karena tidak ada fitur daftar Admin di aplikasi, jalankan *seed script* untuk membuat akun Super Admin pertama secara otomatis:
```bash
npx tsx seed.ts
```
*(Akun yang terbuat: `admin@bookingroam.com` / password: `admin123`)*

### 5. Menjalankan Server
Untuk menghidupkan server dalam mode pengembangan (*auto-restart* setiap kali ada perubahan kode), ketik perintah:
```bash
npm run dev
```
*(Server akan berjalan di `http://localhost:3000`)*

---

## ⚙️ Daftar Fitur & Spesifikasi API

Backend ini murni berperan sebagai **REST API** yang mengirimkan data JSON, dan diamankan menggunakan **JWT Bearer Token** serta sistem **Role-Based Access Control (RBAC)**.

### 1. Modul Autentikasi (`/api/auth`)
*   **Registrasi User (`POST /register`)**: Mengizinkan pengguna publik mendaftar. Role secara otomatis akan di-set menjadi `user`.
*   **Login (`POST /login`)**: Verifikasi email dan password (menggunakan algoritma hashing `bcrypt`). Menghasilkan *JWT Token* yang akan dipakai untuk mengakses fitur-fitur lainnya.

### 2. Modul Manajemen Ruangan (`/api/rooms`)
*   **Lihat Semua Ruangan (`GET /`)**: Dapat diakses oleh siapa saja. Menampilkan data seluruh ruangan beserta fasilitas dan statusnya.
*   **Tambah Ruangan (`POST /`)**: *[Hanya Admin]* Digunakan admin untuk menambahkan daftar ruang rapat baru.
*   **Edit Ruangan (`PUT /:id`)**: *[Hanya Admin]* Mengubah nama, kapasitas, atau fasilitas ruangan.
*   **Hapus Ruangan (`DELETE /:id`)**: *[Hanya Admin]* Menghapus ruangan. **Sistem Keamanan:** Ruangan *TIDAK BISA* dihapus jika masih ada reservasi aktif yang terhubung.

### 3. Modul Reservasi (`/api/reservations`)
*   **Lihat Riwayat Sendiri (`GET /me`)**: *[Role User]* Menampilkan semua riwayat pengajuan reservasi milik user yang sedang login.
*   **Lihat Semua Reservasi (`GET /`)**: *[Hanya Admin]* Menampilkan seluruh reservasi dari semua user. Bisa difilter berdasarkan status (`pending`, `approved`, `rejected`).
*   **Ajukan Reservasi (`POST /`)**: *[Role User]* Memesan ruangan dengan menentukan *start_time* dan *end_time*. **Validasi Cerdas:** Server akan menolak secara otomatis jika mendeteksi jadwal yang bertabrakan (*overlap*) di ruangan yang sama.
*   **Persetujuan / Penolakan (`PUT /:id/approve` & `PUT /:id/reject`)**: *[Hanya Admin]* Admin berhak menyetujui atau menolak reservasi. Jika ditolak, admin bisa memasukkan "alasan penolakan".
*   **Pembatalan (`PUT /:id/cancel`)**: *[Role User]* User hanya bisa membatalkan reservasinya sendiri, selama statusnya belum *approved* atau *rejected*.

### 4. Modul Notifikasi (`/api/notifications`)
*   **Sistem Notifikasi Otomatis (Internal):** Setiap kali admin menyetujui (`approve`) atau menolak (`reject`) reservasi, sistem otomatis menciptakan data notifikasi untuk user yang bersangkutan.
*   **Ambil Notifikasi (`GET /`)**: Mengambil daftar pesan/notifikasi masuk untuk user yang sedang login.
*   **Tandai Sudah Dibaca (`PUT /:id/read`)**: Mengubah status notifikasi menjadi "sudah dibaca".

---

## 🛠 Teknologi yang Digunakan
*   **Bahasa Pemrograman:** TypeScript (di atas platform Node.js)
*   **Framework API:** Express.js
*   **Database & ORM:** MySQL (via XAMPP) & Drizzle ORM
*   **Keamanan:** JsonWebToken (JWT) & BcryptJS
*   **Dev Tools:** ts-node-dev (untuk Hot-Reloading)
