const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'tb_monitor.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

function initDatabase() {
  db.exec(`
    -- Users Table (Multi-role support: pasien, pmo, petugas, admin)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('pasien', 'pmo', 'petugas', 'admin')) NOT NULL,
      phone_number TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Patients Table
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      nik TEXT UNIQUE,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT CHECK(gender IN ('L', 'P')),
      phone_number TEXT NOT NULL,
      pmo_name TEXT NOT NULL,
      pmo_phone TEXT NOT NULL,
      pmo_relation TEXT DEFAULT 'Keluarga',
      address TEXT,
      puskesmas_name TEXT DEFAULT 'Puskesmas Mekar Jaya',
      start_date DATE NOT NULL,
      total_days INTEGER DEFAULT 180,
      current_day INTEGER DEFAULT 1,
      phase TEXT DEFAULT 'Intensif',
      medication_type TEXT DEFAULT 'FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)',
      dosage_info TEXT DEFAULT '3 Tablet FDC diminum 1 kali sehari sebelum makan',
      schedule_time TEXT DEFAULT '08:00',
      adherence_status TEXT CHECK(adherence_status IN ('patuh', 'tidak_patuh', 'dalam_pemantauan')) DEFAULT 'patuh',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Medication Schedules
    CREATE TABLE IF NOT EXISTS medication_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      time_of_day TEXT NOT NULL, -- e.g. '08:00'
      medicine_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      instructions TEXT DEFAULT 'Diminum 1 jam sebelum makan atau 2 jam setelah makan',
      days_of_week TEXT DEFAULT 'ALL',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Adherence Logs
    CREATE TABLE IF NOT EXISTS adherence_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      scheduled_date DATE NOT NULL,
      scheduled_time TEXT NOT NULL,
      confirmed_at DATETIME,
      status TEXT CHECK(status IN ('minum', 'belum_minum', 'tidak_ada_data')) NOT NULL,
      confirmation_method TEXT CHECK(confirmation_method IN ('whatsapp', 'app_button', 'manual_petugas', 'system_timeout')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Consultations (Chat Realtime antara Pasien TB dan Petugas)
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      sender_role TEXT CHECK(sender_role IN ('pasien', 'petugas', 'system')) NOT NULL,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT DEFAULT 'umum',
      read_status INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Articles & Educational Materials
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT CHECK(category IN ('TB', 'Pengobatan', 'Gizi')) NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      read_time TEXT DEFAULT '3 menit',
      published_date DATE NOT NULL,
      image_badge TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- WhatsApp Logs (Simulator & Real Gateway)
    CREATE TABLE IF NOT EXISTS whatsapp_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      phone_number TEXT NOT NULL,
      direction TEXT CHECK(direction IN ('outgoing', 'incoming')) NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'delivered',
      reply_intent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- System Configuration
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get();
  if (patientCount.count > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial data for Puskesmas Mekar Jaya...');

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (username, password, name, role, phone_number, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const uDika = insertUser.run('dika', '123456', 'Dika Pratama', 'pasien', '+6281234567890', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150').lastInsertRowid;
  const uRatna = insertUser.run('ratna', '123456', 'Ibu Ratna (PMO)', 'pmo', '+6281398765432', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150').lastInsertRowid;
  const uSari = insertUser.run('sari', '123456', 'Bu Sari, S.Kep (Perawat TB)', 'petugas', '+6281299887766', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150').lastInsertRowid;
  const uBahrul = insertUser.run('admin', '123456', 'Pak Bahrul, SKM (Admin Puskesmas)', 'admin', '+6281122334455', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150').lastInsertRowid;

  // 2. Seed Patients
  const insertPatient = db.prepare(`
    INSERT INTO patients (
      user_id, nik, name, age, gender, phone_number, pmo_name, pmo_phone, pmo_relation,
      address, puskesmas_name, start_date, total_days, current_day, phase,
      medication_type, dosage_info, schedule_time, adherence_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Target today: 2026-10-23
  // Dika: Day 12 of 180 (started ~11 days ago: 2026-10-12)
  const pDika = insertPatient.run(
    uDika, '3201123456780001', 'Dika Pratama', 24, 'L', '+6281234567890',
    'Ibu Ratna', '+6281398765432', 'Ibu Kandung',
    'Jl. Anggrek No. 14, Mekar Jaya', 'Puskesmas Mekar Jaya',
    '2026-10-12', 180, 12, 'Intensif',
    'FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)',
    '3 Tablet FDC sekali minum, dianjurkan pukul 08:00 pagi saat perut kosong',
    '08:00', 'patuh', 'Pasien memiliki motivasi tinggi untuk sembuh. Mengeluhkan mual ringan di minggu pertama, sudah membaik.'
  ).lastInsertRowid;

  const pSiti = insertPatient.run(
    null, '3201123456780002', 'Siti Aisyah', 32, 'P', '+6285611223344',
    'Ahmad Fauzi', '+6285699887711', 'Suami',
    'Kp. Melati RT 03/02, Mekar Jaya', 'Puskesmas Mekar Jaya',
    '2026-09-09', 180, 45, 'Intensif',
    'FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)',
    '3 Tablet FDC pagi hari',
    '06:30', 'patuh', 'Sangat patuh minum obat. Selalu diingatkan suami.'
  ).lastInsertRowid;

  const pRudi = insertPatient.run(
    null, '3201123456780003', 'Rudi Santoso', 48, 'L', '+6287855667788',
    'Budi Santoso', '+6287811224455', 'Adik',
    'Jl. Flamboyan Blok B2, Mekar Jaya', 'Puskesmas Mekar Jaya',
    '2026-09-26', 180, 28, 'Intensif',
    'FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)',
    '4 Tablet FDC malam hari setelah makan malam',
    '20:00', 'tidak_patuh', 'Sering lembur kerja pabrik, sempat terlewat minum obat 2 hari terakhir. Perlu kunjungan rumah (home visit).'
  ).lastInsertRowid;

  const pMaya = insertPatient.run(
    null, '3201123456780004', 'Maya Anggraini', 21, 'P', '+6282144556677',
    'Hendra', '+6282199001122', 'Ayah',
    'Perum Mekar Indah Kav. 8', 'Puskesmas Mekar Jaya',
    '2026-08-01', 180, 84, 'Lanjutan',
    'FDC Lanjutan (Rifampisin + Isoniazid)',
    '2 Tablet FDC 3x seminggu',
    '07:00', 'patuh', 'Masuk fase lanjutan. Kondisi klinis dan berat badan naik 4 kg.'
  ).lastInsertRowid;

  const pAgus = insertPatient.run(
    null, '3201123456780005', 'Agus Wijaya', 55, 'L', '+6281933221100',
    'Lestari', '+6281988776655', 'Istri',
    'Jl. Kemuning Raya No. 40', 'Puskesmas Mekar Jaya',
    '2026-05-05', 180, 172, 'Lanjutan',
    'FDC Lanjutan (Rifampisin + Isoniazid)',
    '3 Tablet FDC pagi',
    '08:30', 'patuh', 'Hampir menyelesaikan pengobatan 180 hari (tinggal 8 hari lagi). Uji dahak evaluasi negatif.'
  ).lastInsertRowid;

  // 3. Seed Medication Schedules
  const insertSchedule = db.prepare(`
    INSERT INTO medication_schedules (patient_id, time_of_day, medicine_name, dosage, instructions)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertSchedule.run(pDika, '08:00', 'FDC Kategori 1 (4FDC)', '3 Tablet', 'Diminum sekaligus pada pagi hari, sebaiknya sebelum sarapan');
  insertSchedule.run(pSiti, '06:30', 'FDC Kategori 1 (4FDC)', '3 Tablet', 'Diminum dengan segelas air putih');
  insertSchedule.run(pRudi, '20:00', 'FDC Kategori 1 (4FDC)', '4 Tablet', 'Diminum malam hari sebelum tidur');
  insertSchedule.run(pMaya, '07:00', 'FDC Lanjutan (2FDC)', '2 Tablet', 'Diminum pagi hari');
  insertSchedule.run(pAgus, '08:30', 'FDC Lanjutan (2FDC)', '3 Tablet', 'Diminum pagi hari setelah minum teh tawar');

  // 4. Seed Adherence Logs for Past 14 Days up to today (2026-10-23)
  const insertLog = db.prepare(`
    INSERT INTO adherence_logs (patient_id, scheduled_date, scheduled_time, confirmed_at, status, confirmation_method, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const dateList = [
    '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16',
    '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21',
    '2026-10-22', '2026-10-23'
  ];

  // Dika's logs (12 days total)
  dateList.forEach((dt, idx) => {
    if (idx === dateList.length - 1) {
      // Today (Day 12): let's make it confirmed at 08:02 AM!
      insertLog.run(pDika, dt, '08:00', `${dt} 08:02:15`, 'minum', 'whatsapp', 'Konfirmasi via WhatsApp Bot ("SUDAH")');
    } else {
      insertLog.run(pDika, dt, '08:00', `${dt} 08:05:00`, 'minum', idx % 2 === 0 ? 'app_button' : 'whatsapp', 'Tepat waktu');
    }
  });

  // Siti's logs
  dateList.forEach((dt) => {
    insertLog.run(pSiti, dt, '06:30', `${dt} 06:35:00`, 'minum', 'whatsapp', 'Konfirmasi via WhatsApp Bot');
  });

  // Rudi's logs (missed yesterday and today)
  dateList.forEach((dt, idx) => {
    if (idx >= dateList.length - 2) {
      insertLog.run(pRudi, dt, '20:00', null, 'belum_minum', 'system_timeout', 'Tidak ada balasan pesan pengingat WA');
    } else {
      insertLog.run(pRudi, dt, '20:00', `${dt} 20:45:00`, 'minum', 'whatsapp', 'Konfirmasi terlambat 45 menit');
    }
  });

  // 5. Seed Consultations
  const insertChat = db.prepare(`
    INSERT INTO consultations (patient_id, sender_role, sender_name, message, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertChat.run(pDika, 'pasien', 'Dika Pratama', 'Selamat pagi Bu Sari, saya mau tanya. Setelah minum obat tadi pagi, perut saya terasa agak mual dan air kencing agak berwarna kemerahan. Apakah itu berbahaya?', 'keluhan_obat', '2026-10-21 09:15:00');
  insertChat.run(pDika, 'petugas', 'Bu Sari, S.Kep', 'Halo Mas Dika, tenang ya. Air seni berwarna merah atau oranye itu efek samping yang sangat normal dan aman dari obat Rifampisin, bukan tanda bahaya atau pendarahan.', 'keluhan_obat', '2026-10-21 09:22:00');
  insertChat.run(pDika, 'petugas', 'Bu Sari, S.Kep', 'Untuk rasa mualnya, coba minum obat dengan air putih hangat dan jangan minum obat dalam keadaan perut benar-benar kosong jika maag terasa. Mas Dika bisa makan sedikit biskuit atau pisang 30 menit sebelum obat.', 'keluhan_obat', '2026-10-21 09:24:00');
  insertChat.run(pDika, 'pasien', 'Dika Pratama', 'Alhamdulillah terima kasih banyak Bu Sari, sangat melegakan. Saya akan ikuti sarannya.', 'umum', '2026-10-21 09:30:00');

  // 6. Seed Educational Articles
  const insertArticle = db.prepare(`
    INSERT INTO articles (title, category, summary, content, read_time, published_date, image_badge)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertArticle.run(
    'Apa itu TB? Mengenal Gejala dan Penularannya',
    'TB',
    'Tuberkulosis (TBC) adalah penyakit menular yang disebabkan oleh kuman Mycobacterium tuberculosis. TBC BISA DISEMBUHKAN tuntas!',
    'Tuberkulosis (TBC) merupakan infeksi bakteri yang menyerang organ paru-paru, namun bisa juga mengenai kelenjar getah bening, tulang, atau selaput otak. Gejala utama meliputi batuk berdahak lebih dari 2 minggu, demam sumeng-sumeng di malam hari, keringat malam tanpa aktivitas fisik, penurunan nafsu makan, dan penurunan berat badan secara drastis.\n\nKabar baiknya: TBC bukan penyakit kutukan atau keturunan! TBC dapat disembuhkan secara tuntas asalkan pasien meminum obat secara teratur selama 6 bulan tanpa putus.',
    '4 menit',
    '2026-10-18',
    'lungs'
  );

  insertArticle.run(
    'Tips Minum Obat TB Agar Tidak Mual dan Tepat Waktu',
    'Pengobatan',
    'Kiat praktis mengatasi efek samping ringan seperti rasa mual, lemas, serta trik membiasakan jadwal minum obat harian.',
    'Menjalani pengobatan TB selama 6 bulan memerlukan kedisiplinan tinggi. Berikut adalah tips agar Anda nyaman minum obat:\n\n1. Tetapkan jam yang sama setiap hari (misalnya pukul 08:00 pagi atau sebelum tidur).\n2. Jika merasa mual, minum obat bersama sedikit makanan ringan seperti pisang atau biskuit.\n3. Jangan khawatir jika air seni berwarna merah atau oranye, itu pengaruh zat Rifampisin dan tidak berbahaya.\n4. Gunakan alarm dan selalu aktifkan notifikasi WhatsApp Bot Pengingat dari Puskesmas.\n5. Ingat: Jangan pernah menghentikan obat sendiri meskipun badan sudah merasa segar dan tidak batuk lagi!',
    '3 menit',
    '2026-10-15',
    'pill'
  );

  insertArticle.run(
    'Makanan Bergizi untuk Mempercepat Pemulihan Pasien TB',
    'Gizi',
    'Daftar asupan protein tinggi dan vitamin yang mendukung regenerasi sel paru-paru dan meningkatkan imunitas tubuh.',
    'Nutrisi yang optimal sangat penting untuk mempercepat proses penyembuhan TB. Tubuh membutuhkan asupan energi dan protein tinggi untuk memperbaiki jaringan paru yang rusak.\n\nContoh makanan yang sangat dianjurkan:\n- Telur rebus (sumber protein terbaik dan terjangkau, 1-2 butir per hari)\n- Ikan kembung, tuna, atau lele (kaya asam lemak omega-3)\n- Tempe dan tahu sebagai sumber protein nabati\n- Sayuran hijau (bayam, brokoli) kaya zat besi dan antioksidan\n- Buah-buahan segar (pepaya, jeruk, pisang) kaya vitamin C untuk daya tahan tubuh.\n\nPerbanyak minum air putih minimal 2 liter sehari untuk membantu metabolisme obat di ginjal.',
    '5 menit',
    '2026-10-10',
    'apple'
  );

  insertArticle.run(
    'Hindari Rokok dan Alkohol Selama Masa Pengobatan TB',
    'Pengobatan',
    'Zat beracun dalam rokok dapat memperlambat penyembuhan jaringan paru dan menurunkan efektivitas obat antituberkulosis.',
    'Merokok dan konsumsi alkohol adalah pantangan utama bagi penderita TBC. Asap rokok merusak silia (rambut halus pelindung saluran napas) dan memicu inflamasi kronis pada kantung udara paru (alveoli).\n\nSementara itu, alkohol dapat memperberat kerja hati yang sedang memproses obat anti-TB kuat seperti Isoniazid dan Rifampisin. Dengan berhenti merokok dan menjauhi alkohol, kesembuhan paru-paru Anda akan berlangsung jauh lebih cepat dan mencegah kekambuhan di kemudian hari.',
    '3 menit',
    '2026-10-05',
    'shield'
  );

  insertArticle.run(
    'Pentingnya Peran PMO (Pengawas Menelan Obat) dalam Keluarga',
    'TB',
    'Keluarga adalah garda terdepan penentu kesuksesan sembuh dari TB. Kenali tugas utama seorang PMO yang efektif.',
    'Pengawas Menelan Obat (PMO) bertugas memastikan pasien menelan obat setiap hari sesuai dosis dan jadwal yang ditentukan. Selain mengawasi, PMO memberikan dukungan psikologis, mendampingi saat kontrol rutin ke Puskesmas, serta mengingatkan jika muncul keluhan efek samping.\n\nDukungan hangat dan penuh kasih dari keluarga membuat pasien merasa tidak berjuang sendirian melawan TBC.',
    '4 menit',
    '2026-10-01',
    'heart'
  );

  // 7. Seed WhatsApp Logs (Showing outgoing automated reminder & incoming replies)
  const insertWaLog = db.prepare(`
    INSERT INTO whatsapp_logs (patient_id, phone_number, direction, message, status, reply_intent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertWaLog.run(
    pDika, '+6281234567890', 'outgoing',
    '🔔 *PENGINGAT MINUM OBAT TB - PUSKESMAS MEKAR JAYA*\n\nHalo *Dika Pratama*! Sekarang pukul 08:00 WIB, saatnya minum obat TB hari ke-12.\n\n💊 *Dosis Hari Ini:* 3 Tablet FDC Kategori 1\n\nSilakan minum dengan air putih, lalu balas pesan ini dengan kata *"SUDAH"* untuk mencatat kepatuhan Anda hari ini. Tetap semangat, TBC pasti sembuh! 💪',
    'delivered', null, '2026-10-23 08:00:01'
  );

  insertWaLog.run(
    pDika, '+6281234567890', 'incoming',
    'SUDAH',
    'processed', 'CONFIRM_MEDICATION', '2026-10-23 08:02:14'
  );

  insertWaLog.run(
    pDika, '+6281234567890', 'outgoing',
    '✅ *Konfirmasi Diterima!* Terima kasih Dika Pratama. Status minum obat hari ke-12 telah dicatat: *PATUH (08:02 WIB)*. Lanjutkan sampai tuntas 180 hari ya!',
    'delivered', null, '2026-10-23 08:02:16'
  );

  console.log('Seeding completed successfully!');
}

module.exports = {
  db,
  initDatabase
};
