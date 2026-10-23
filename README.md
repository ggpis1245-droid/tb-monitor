# 🏥 SIMPus Terpadu - Sistem Informasi Manajemen Puskesmas Terpadu Berbasis RBAC

Aplikasi Web **Sistem Informasi Puskesmas Terpadu (SIMPus)** modern, responsif (*mobile-friendly*), dengan standar UI/UX kelas enterprise bertema *Medical Trust Clean Palette* (Biru Medis, Hijau Tosca/Emerald, Putih Bersih, dan Aksen Navy Elegan).

Aplikasi ini dilengkapi sistem **Role-Based Access Control (RBAC)** penuh dengan 3 jenis peran pengguna inti (Pasien, Petugas Puskesmas, PMO) yang saling terhubung secara *real-time*:

---

## 👥 3 Role Pengguna Utama (RBAC)

### 1. 🧑‍⚕️ Role PASIEN (Fokus Kemudahan Akses & Layanan Mandiri)
- **Dashboard Kesehatan**:
  - Kartu profil kesehatan digital (No. Rekam Medis, NIK, No. Kartu BPJS Kesehatan Aktif).
  - Ringkasan jadwal kunjungan kontrol terdekat dengan *countdown*.
  - Status kepatuhan pengobatan (*circular progress*, streak hari beruntun, dan perayaan *confetti* saat minum obat).
  - Pemantauan tanda vital terakhir (Tekanan Darah, Nadi, Suhu, Berat Badan, dan IMT).
- **Fitur Utama**:
  1. **Pendaftaran Antrean Online Mandiri**:
     - Memilih Poliklinik (Poli Umum, Poli Gigi, Poli KIA/KB, Poli TB/Paru DOTS, Poli Lansia & PTM).
     - Memilih tanggal, sesi jam kunjungan (Pagi/Siang), dan jenis penjamin (BPJS Kesehatan / Umum).
     - Menerbitkan **Tiket Antrean Digital Real-time** dengan nomor antrean (misal: `A-004`, `D-002`), barcode/QR visual, indikator estimasi waktu tunggu, dan pelacak alur pelayanan (*Terdaftar ➔ Dipanggil ➔ Diperiksa ➔ Farmasi*).
     - Tombol **Simulasi Panggilan Suara** dan cetak tiket.
  2. **Riwayat Rekam Medis Elektronik (RME)**:
     - Garis waktu (*timeline*) riwayat kunjungan sebelumnya.
     - Detail anamnesis, tanda vital, penegakan diagnosis standar ICD-10 (misal: *A15.0 TB Paru, I10 Hipertensi*), e-resep obat, dan catatan nakes.
     - **Cetak Resume Medis Resmi**: Dokumen lengkap standar Puskesmas ber-KOP resmi, nomor registrasi, dan kolom tanda tangan dokter penanggung jawab.
  3. **Notifikasi Jadwal Kontrol & Pengambilan Obat**:
     - *Feed* notifikasi jadwal kontrol dokter, pengambilan paket obat di loket Farmasi, serta checklist minum obat harian.

---

### 2. 🩺 Role PETUGAS PUSKESMAS (Fokus Manajemen, Efisiensi & Rekam Medis)
- **Dashboard Komando Klinis**:
  - Statistik real-time: Total pasien hari ini, antrean aktif menunggu, pasien sedang diperiksa, dan dokter/nakes *on-duty*.
  - Indikator peringatan stok obat menipis dan notifikasi kendala efek samping dari PMO.
- **Fitur Utama**:
  1. **Manajemen Antrean Poli (Meja Panggilan Suara)**:
     - Filter antrean berdasarkan Poli.
     - Tombol **"Panggil Pasien"** dilengkapi nada panggil bel Puskesmas (*hospital chime synthesizer*) dan sintesis suara Bahasa Indonesia (*"Nomor antrean A-004, silakan menuju Poli Umum, Ruang 1"*).
     - Tombol **"Buka RME"** untuk langsung memuat data pasien ke formulir rekam medis.
     - Tombol **"Layar Antrean TV (Ruang Tunggu)"**: Tampilan layar penuh khusus monitor TV ruang tunggu puskesmas dengan informasi 5 Poli dan *running text ticker* edukasi kesehatan.
  2. **Input dan Edit Rekam Medis Elektronik (RME / EHR)**:
     - Formulir klinis terstandarisasi SatuSehat Kemenkes:
       - Identitas pasien & poliklinik tujuan.
       - Anamnesis, keluhan utama & riwayat alergi obat.
       - Pemeriksaan fisik tanda vital dengan **Kalkulator IMT Otomatis** (Sistolik, Diastolik, Nadi, Suhu, RR, BB, TB ➔ Kategori Status Gizi).
       - Diagnosis Kerja ICD-10 (*dropdown search*).
       - **E-Prescription Builder**: Menambahkan resep obat langsung dari stok farmasi puskesmas dengan aturan pakai dan jumlah yang otomatis memotong stok gudang.
  3. **Manajemen Data Pasien & Riwayat Penyakit**:
     - Direktori master pasien dengan pencarian cepat (NIK, Nama, BPJS, No. RM).
     - Formulir pendaftaran pasien baru lengkap dengan nomor kontak dan identitas PMO.
  4. **Manajemen Farmasi (Stok Obat)**:
     - Katalog stok obat esensial dan paket OAT TB (Tablet, Kapsul, Sirup) dengan badge status: *Aman (Hijau)*, *Menipis (Kuning)*, dan *Kritis / Habis (Merah)*.
     - Fitur **"Tambah Stok Masuk"** dan **"Serahkan Obat ke Pasien"** (dispense).
  5. **Meja Respon Kendala PMO**:
     - Membaca laporan efek samping obat dari PMO dan mengirimkan arahan medis balik secara langsung.

---

### 3. 👥 Role PMO / PENGAWAS MENELAN OBAT (Fokus Pemantauan TB & Kepatuhan)
- **Dashboard Kepatuhan**:
  - Pengukur rata-rata tingkat kepatuhan minum obat seluruh pasien binaan (*Adherence Rate %*).
  - Metrik: Pasien patuh hari ini vs belum minum vs mangkir (*high drop-out risk*).
- **Fitur Utama**:
  1. **Daftar Pasien di Bawah Pengawasannya**:
     - Profil lengkap pasien TB binaan (Dika Pratama, Siti Aisyah, Rudi Santoso, Maya Anggraini, Agus Wijaya).
     - Fase pengobatan (*Intensif / Lanjutan*), hari ke-X dari 180 hari DOTS, dosis obat harian, dan alamat.
     - **Matriks Kepatuhan 7 Hari Terakhir**: Indikator titik visual (🟢 Hijau = Patuh, 🔴 Merah = Mangkir).
  2. **Checklist / Laporan Harian Status Minum Obat**:
     - Formulir verifikasi harian: *Sudah Minum (Didampingi)*, *Belum Minum / Ditunda*, atau *Menolak / Mangkir*.
     - Jam minum obat dan catatan kondisi fisik pasien (nafsu makan, keluhan ringan).
     - Menyimpan laporan langsung memperbarui skor kepatuhan dan catatan medis pasien.
  3. **Fitur Lapor Kendala & Efek Samping ke Dokter Puskesmas**:
     - Formulir pengaduan darurat ke dokter puskesmas:
       - Pilihan kategori: *Efek samping sedang (mual berulang, ruam kulit), efek samping berat (kulit/mata kuning/ikterus, gatal alergi berat), atau pasien menolak minum obat*.
       - Tingkat urgensi: *Rendah*, *Sedang*, hingga *🚨 DARURAT (Merah)*.
       - Laporan langsung memunculkan peringatan prioritas di dasbor Petugas Puskesmas dan PMO dapat memantau respon arahan dokter.

---

## 📺 Fitur Layanan Unggulan Lainnya
- **Layar Monitor Antrean TV Ruang Tunggu**: Mode tampilan layar penuh bergaya monitor TV rumah sakit/puskesmas modern yang menampilkan nomor antrean aktif di 5 Poli secara simultan dan teks berjalan (*running news ticker*).
- **Sistem Suara & Nada Panggil Otomatis**: Menghasilkan nada lonceng Puskesmas (*3-tone hospital chime*) via Web Audio API dan panggilan suara Bahasa Indonesia via Web Speech API.
- **Bot WhatsApp Simulator 2-Arah**: Menguji pengingat minum obat interaktif via WhatsApp dan konfirmasi balas pesan ("SUDAH").
- **Cetak Resume Medis Resmi**: Dokumen standar pelayanan rekam medis puskesmas siap cetak atau simpan ke PDF.

---

## 🌐 Akses Online Langsung (GitHub Pages)

Aplikasi ini dapat diakses langsung oleh siapa saja tanpa instalasi melalui tautan GitHub Pages:
👉 **[https://ggpis1245-droid.github.io/tb-monitor/](https://ggpis1245-droid.github.io/tb-monitor/)**

> [!NOTE]
> Aplikasi bersifat *responsive mobile-first* sehingga dapat dibuka langsung dari browser smartphone (Chrome, Safari, dsb.) maupun peramban desktop laptop/PC.

---

## ⚙️ Cara Mengaktifkan GitHub Pages di Repository

Jika Anda ingin memperbarui atau memastikan GitHub Pages aktif:
1. Buka repository Anda di GitHub: **[https://github.com/ggpis1245-droid/tb-monitor](https://github.com/ggpis1245-droid/tb-monitor)**
2. Masuk ke menu **Settings** (Pengaturan) di kanan atas repository.
3. Pada sidebar kiri, pilih menu **Pages** (di bawah bagian *Code and automation*).
4. Di bagian **Build and deployment** > **Source**:
   - **Pilihan 1 (Rekomendasi - Otomatis)**: Pilih **GitHub Actions**. Workflow `.github/workflows/deploy.yml` akan otomatis mem-build dan mempublikasikan aplikasi setiap kali ada `git push`.
   - **Pilihan 2 (Instan)**: Pilih **Deploy from a branch** ➔ Branch: `main` ➔ Folder: `/ (root)` atau `/docs` ➔ Klik **Save**.
5. Tunggu sekitar 1-2 menit hingga status berubah menjadi hijau *"Your site is live at..."*.

---

## 👥 Akun Login Demo (Semua Role Terisolasi)

Gunakan akun berikut untuk menguji masing-masing dashboard:

| Peran (Role) | Identitas (Email / Username) | Kata Sandi | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Pasien TB** | `pasien@puskesmas.go.id` atau `dika` | `123` | Dashboard pasien, tiket antrean, pengingat minum obat dokter, banner peringatan |
| **Petugas / Dokter** | `petugas@puskesmas.go.id` atau `sarah` / `petugas` | `123` | Manajemen pasien, atur jam minum obat, kirim peringatan/chat ke pasien & PMO |
| **Keluarga / PMO** | `pmo@puskesmas.go.id` atau `ratna` / `pmo` | `123` | Pendampingan minum obat, pantau kalender, terima peringatan dokter |
| **Admin Puskesmas**| `admin@puskesmas.go.id` atau `admin` | `123` | Rekapitulasi data puskesmas & grafik tren kesembuhan TB |

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal (Development)

### Prasyarat
- Node.js (v18 atau lebih baru)
- npm

### Langkah Menjalankan
```bash
# 1. Masuk ke folder proyek
cd "d:\apk tb"

# 2. Install dependencies (jika belum)
npm install
npm --prefix client install

# 3. Jalankan aplikasi web
npm run dev
```

Buka peramban di:
- **Aplikasi Web SIMPus (Client)**: `http://localhost:3000/`
- **Backend API & SQLite**: `http://localhost:5000/`

---

## 📦 Build & Update GitHub Pages Manual
Untuk mem-build versi produksi dan memperbarui file hosting di root & `docs/`:
```bash
npm --prefix client run build
powershell -Command "Copy-Item -Path 'client/dist/*' -Destination '.' -Recurse -Force; Copy-Item -Path 'client/dist/*' -Destination 'docs' -Recurse -Force"
git add .
git commit -m "Update aplikasi dan deploy ke GitHub Pages"
git push origin main
```
