/**
 * Central State Engine for Sistem Informasi Puskesmas Terpadu (SIMPus)
 * Manages LocalStorage persistence, reactive events, and cross-role synchronization.
 */

const STORAGE_KEY = 'simpus_terpadu_state_v2';

export const POLI_LIST = [
  {
    id: 'poli_umum',
    code: 'A',
    name: 'Poli Umum',
    fullName: 'Poli Pengobatan Umum & Penyakit Akut',
    room: 'Ruang Pemeriksaan 1',
    doctor: 'dr. Sarah Anindita, Sp.KKLP',
    schedule: '08:00 - 12:00 WIB',
    quota: 30,
    currentWait: 4,
    badgeColor: '#0284c7'
  },
  {
    id: 'poli_gigi',
    code: 'B',
    name: 'Poli Gigi & Mulut',
    fullName: 'Poli Kesehatan Gigi & Mulut',
    room: 'Ruang Gigi Lantai 1',
    doctor: 'drg. Maya Kusuma, Sp.KG',
    schedule: '08:30 - 12:30 WIB',
    quota: 15,
    currentWait: 2,
    badgeColor: '#0d9488'
  },
  {
    id: 'poli_kia',
    code: 'C',
    name: 'Poli KIA & KB',
    fullName: 'Poli Kesehatan Ibu, Anak & KB',
    room: 'Ruang KIA & Imunisasi',
    doctor: 'Bdn. Rina Rahayu, S.Tr.Keb',
    schedule: '08:00 - 12:00 WIB',
    quota: 25,
    currentWait: 3,
    badgeColor: '#ec4899'
  },
  {
    id: 'poli_tb',
    code: 'D',
    name: 'Poli TB / Paru (DOTS)',
    fullName: 'Klinik DOTS Paru & Tuberkulosis Terpadu',
    room: 'Klinik Khusus DOTS Paru',
    doctor: 'dr. Budi Setiawan / Bu Sari, S.Kep',
    schedule: '08:00 - 11:30 WIB',
    quota: 20,
    currentWait: 1,
    badgeColor: '#e11d48'
  },
  {
    id: 'poli_lansia',
    code: 'E',
    name: 'Poli Lansia & PTM',
    fullName: 'Poli Geriatri & Penyakit Tidak Menular (Hipertensi/Diabetes)',
    room: 'Ruang Pemeriksaan 2',
    doctor: 'dr. Hendra Pratama',
    schedule: '08:00 - 12:00 WIB',
    quota: 20,
    currentWait: 2,
    badgeColor: '#8b5cf6'
  }
];

export const INITIAL_PHARMACY_STOCK = [
  {
    id: 1,
    name: 'Paket OAT 4KDT Kategori 1 (FDC Intensif)',
    category: 'Obat Program TB',
    form: 'Tablet Salut Selaput',
    activeSubstance: 'Rifampisin 150mg + Isoniazid 75mg + Pirazinamid 400mg + Etambutol 275mg',
    stock: 240,
    unit: 'Tablet',
    minStock: 60,
    batchNo: 'B-TB26-09A',
    expiryDate: '2027-11-30',
    location: 'Lemari Program TB Lt.1',
    status: 'aman'
  },
  {
    id: 2,
    name: 'Paket OAT 2KDT Kategori 1 (FDC Lanjutan)',
    category: 'Obat Program TB',
    form: 'Tablet',
    activeSubstance: 'Rifampisin 150mg + Isoniazid 150mg',
    stock: 180,
    unit: 'Tablet',
    minStock: 50,
    batchNo: 'B-TB26-04L',
    expiryDate: '2027-08-15',
    location: 'Lemari Program TB Lt.1',
    status: 'aman'
  },
  {
    id: 3,
    name: 'Amlodipine 5 mg',
    category: 'Antihipertensi',
    form: 'Tablet',
    activeSubstance: 'Amlodipine Besilate 5mg',
    stock: 450,
    unit: 'Tablet',
    minStock: 100,
    batchNo: 'AML-2026-11',
    expiryDate: '2028-04-10',
    location: 'Rak B-02',
    status: 'aman'
  },
  {
    id: 4,
    name: 'Amlodipine 10 mg',
    category: 'Antihipertensi',
    form: 'Tablet',
    activeSubstance: 'Amlodipine Besilate 10mg',
    stock: 35,
    unit: 'Tablet',
    minStock: 50,
    batchNo: 'AML-2026-12',
    expiryDate: '2027-05-20',
    location: 'Rak B-02',
    status: 'menipis'
  },
  {
    id: 5,
    name: 'Metformin HCl 500 mg',
    category: 'Antidiabetes Oral',
    form: 'Tablet Salut Selaput',
    activeSubstance: 'Metformin Hydrochloride 500mg',
    stock: 280,
    unit: 'Tablet',
    minStock: 80,
    batchNo: 'MET-2601',
    expiryDate: '2027-12-12',
    location: 'Rak B-05',
    status: 'aman'
  },
  {
    id: 6,
    name: 'Paracetamol 500 mg',
    category: 'Analgesik & Antipiretik',
    form: 'Kaplet',
    activeSubstance: 'Paracetamol 500mg',
    stock: 850,
    unit: 'Kaplet',
    minStock: 200,
    batchNo: 'PCT-2608',
    expiryDate: '2028-09-01',
    location: 'Rak A-01',
    status: 'aman'
  },
  {
    id: 7,
    name: 'Amoxicillin Trihydrate 500 mg',
    category: 'Antibiotik Generik',
    form: 'Kapsul',
    activeSubstance: 'Amoxicillin 500mg',
    stock: 22,
    unit: 'Kapsul',
    minStock: 50,
    batchNo: 'AMX-2603',
    expiryDate: '2027-03-30',
    location: 'Rak C-03 (Lemari Antibiotik)',
    status: 'kritis'
  },
  {
    id: 8,
    name: 'Vitamin B6 (Piridoksin HCl) 10 mg',
    category: 'Vitamin & Suplemen Saraf',
    form: 'Tablet',
    activeSubstance: 'Pyridoxine HCl 10mg',
    stock: 320,
    unit: 'Tablet',
    minStock: 60,
    batchNo: 'VITB6-26',
    expiryDate: '2028-02-14',
    location: 'Rak D-01',
    status: 'aman'
  },
  {
    id: 9,
    name: 'Antasida Doen Tablet Kunyah',
    category: 'Gastrointestinal',
    form: 'Tablet Kunyah',
    activeSubstance: 'Aluminium Hidroksida 200mg + Magnesium Hidroksida 200mg',
    stock: 310,
    unit: 'Tablet',
    minStock: 100,
    batchNo: 'ANT-2605',
    expiryDate: '2028-01-20',
    location: 'Rak A-04',
    status: 'aman'
  },
  {
    id: 10,
    name: 'Cetirizine HCl 10 mg',
    category: 'Antihistamin Alergi',
    form: 'Tablet',
    activeSubstance: 'Cetirizine 10mg',
    stock: 190,
    unit: 'Tablet',
    minStock: 50,
    batchNo: 'CTZ-2602',
    expiryDate: '2027-10-10',
    location: 'Rak C-01',
    status: 'aman'
  },
  {
    id: 11,
    name: 'Oralit Sachet Garam Rehidrasi',
    category: 'Rehidrasi & Diare',
    form: 'Serbuk Larutan Oral',
    activeSubstance: 'Glukosa Anhidrat, Natrium Klorida, Kalium Klorida',
    stock: 120,
    unit: 'Sachet',
    minStock: 50,
    batchNo: 'ORL-2609',
    expiryDate: '2028-06-30',
    location: 'Rak A-06',
    status: 'aman'
  },
  {
    id: 12,
    name: 'Salbutamol Sulfat 2 mg',
    category: 'Bronkodilator Asma',
    form: 'Tablet',
    activeSubstance: 'Salbutamol 2mg',
    stock: 15,
    unit: 'Tablet',
    minStock: 40,
    batchNo: 'SLB-2601',
    expiryDate: '2027-02-28',
    location: 'Rak C-05',
    status: 'kritis'
  }
];

export const INITIAL_QUEUES = [
  {
    id: 'q-1',
    queueNumber: 'A-001',
    poliId: 'poli_umum',
    poliName: 'Poli Umum',
    patientId: 201,
    patientName: 'Bapak Hartono',
    nik: '3201112233440001',
    bpjsNumber: '0001293847561',
    paymentType: 'BPJS Kesehatan',
    complaint: 'Demam 3 hari, pusing dan pegal-pegal linu',
    registeredAt: '08:05 WIB',
    status: 'selesai',
    calledAt: '08:15 WIB',
    doctor: 'dr. Sarah Anindita, Sp.KKLP'
  },
  {
    id: 'q-2',
    queueNumber: 'A-002',
    poliId: 'poli_umum',
    poliName: 'Poli Umum',
    patientId: 202,
    patientName: 'Ibu Ningsih',
    nik: '3201112233440002',
    bpjsNumber: '0001882233441',
    paymentType: 'BPJS Kesehatan',
    complaint: 'Nyeri ulu hati kambuh setelah makan pedas, mual',
    registeredAt: '08:12 WIB',
    status: 'selesai',
    calledAt: '08:30 WIB',
    doctor: 'dr. Sarah Anindita, Sp.KKLP'
  },
  {
    id: 'q-3',
    queueNumber: 'A-003',
    poliId: 'poli_umum',
    poliName: 'Poli Umum',
    patientId: 203,
    patientName: 'Ahmad Maulana (19 th)',
    nik: '3201112233440003',
    bpjsNumber: '0001773344552',
    paymentType: 'BPJS Kesehatan',
    complaint: 'Batuk kering, radang tenggorokan sulit menelan',
    registeredAt: '08:25 WIB',
    status: 'dipanggil',
    calledAt: '08:45 WIB',
    doctor: 'dr. Sarah Anindita, Sp.KKLP'
  },
  {
    id: 'q-4',
    queueNumber: 'A-004',
    poliId: 'poli_umum',
    poliName: 'Poli Umum',
    patientId: 204,
    patientName: 'Wawan Gunawan',
    nik: '3201112233440004',
    bpjsNumber: '0001664455663',
    paymentType: 'Mandiri / Umum',
    complaint: 'Gatal-gatal biduran di kedua lengan dan punggung',
    registeredAt: '08:38 WIB',
    status: 'menunggu',
    calledAt: null,
    doctor: 'dr. Sarah Anindita, Sp.KKLP'
  },
  {
    id: 'q-5',
    queueNumber: 'B-001',
    poliId: 'poli_gigi',
    poliName: 'Poli Gigi & Mulut',
    patientId: 205,
    patientName: 'Dewi Lestari',
    nik: '3201112233440005',
    bpjsNumber: '0001556677884',
    paymentType: 'BPJS Kesehatan',
    complaint: 'Gigi geraham belakang berlubang dan ngilu saat minum dingin',
    registeredAt: '08:30 WIB',
    status: 'dipanggil',
    calledAt: '08:50 WIB',
    doctor: 'drg. Maya Kusuma, Sp.KG'
  },
  {
    id: 'q-6',
    queueNumber: 'C-001',
    poliId: 'poli_kia',
    poliName: 'Poli KIA & KB',
    patientId: 206,
    patientName: 'Ibu Annisa & Bayi Kenzo',
    nik: '3201112233440006',
    bpjsNumber: '0001447788995',
    paymentType: 'BPJS Kesehatan',
    complaint: 'Imunisasi DPT-HB-Hib 2 dan Polio tetes bulan ke-3',
    registeredAt: '08:40 WIB',
    status: 'menunggu',
    calledAt: null,
    doctor: 'Bdn. Rina Rahayu, S.Tr.Keb'
  },
  {
    id: 'q-7',
    queueNumber: 'D-001',
    poliId: 'poli_tb',
    poliName: 'Poli TB / Paru (DOTS)',
    patientId: 3,
    patientName: 'Rudi Santoso',
    nik: '3201123456780003',
    bpjsNumber: '0001338899006',
    paymentType: 'BPJS Kesehatan',
    complaint: 'Kontrol rutin TB Paru bulan ke-1 & pengambilan paket obat 4KDT lanjutan',
    registeredAt: '08:15 WIB',
    status: 'selesai',
    calledAt: '08:35 WIB',
    doctor: 'dr. Budi Setiawan / Bu Sari, S.Kep'
  },
  {
    id: 'q-8',
    queueNumber: 'D-002',
    poliId: 'poli_tb',
    poliName: 'Poli TB / Paru (DOTS)',
    patientId: 1, // Dika Pratama
    patientName: 'Dika Pratama',
    nik: '3201123456780001',
    bpjsNumber: '0001827364891',
    paymentType: 'BPJS Kesehatan',
    complaint: 'Kontrol evaluasi TB hari ke-12 dan konsultasi efek samping mual ringan',
    registeredAt: '08:42 WIB',
    status: 'menunggu',
    calledAt: null,
    doctor: 'dr. Budi Setiawan / Bu Sari, S.Kep'
  },
  {
    id: 'q-9',
    queueNumber: 'E-001',
    poliId: 'poli_lansia',
    poliName: 'Poli Lansia & PTM',
    patientId: 5,
    patientName: 'Agus Wijaya (55 th)',
    nik: '3201123456780005',
    bpjsNumber: '0001229900117',
    paymentType: 'BPJS Kesehatan',
    complaint: 'Pemeriksaan tensi rutin prolanis dan kontrol hipertensi bulanan',
    registeredAt: '08:20 WIB',
    status: 'menunggu',
    calledAt: null,
    doctor: 'dr. Hendra Pratama'
  }
];

export const INITIAL_EHR_RECORDS = [
  {
    id: 'ehr-1',
    patientId: 1,
    patientName: 'Dika Pratama',
    nik: '3201123456780001',
    noRm: 'RM-2026-0814',
    gender: 'Laki-laki',
    age: 24,
    visitDate: '2026-10-12',
    poliId: 'poli_tb',
    poliName: 'Poli TB / Paru (DOTS)',
    doctorName: 'dr. Sarah Anindita, Sp.KKLP',
    anamnesis: 'Pasien datang dengan batuk berdahak sudah > 3 minggu, demam malam hari (sumeng-sumeng), keringat malam tanpa aktivitas fisik, nafsu makan turun drastis, penurunan BB 3.5 kg dalam 1 bulan.',
    allergies: 'Tidak ada riwayat alergi obat',
    vitalSigns: {
      systolic: 115,
      diastolic: 75,
      heartRate: 82,
      respiratoryRate: 20,
      temperature: 37.4,
      weight: 55,
      height: 168,
      bmi: '19.5',
      bmiCategory: 'Normal (BB Kurang Ringan)'
    },
    primaryDiagnosis: 'A15.0 - Tuberkulosis Paru Terkonfirmasi Bakteriologis (BTA +2, TCM MTB Detected Sensitive Rifampicin)',
    secondaryDiagnosis: 'R63.0 - Anoreksia & Penurunan Berat Badan',
    clinicalNotes: 'Mulai Program Terapi DOTS Kategori 1 Fase Intensif (2RHZE) 180 hari. Pasien diedukasi etika batuk, pemakaian masker bedah, dan penunjukan Ibu Kandung (Ibu Ratna) sebagai PMO resmi.',
    prescriptions: [
      {
        medicineName: 'Paket OAT 4KDT Kategori 1 (FDC Intensif)',
        dosage: '3 Tablet sekali minum',
        frequency: '1x sehari pagi hari (perut kosong)',
        quantity: 84,
        instructions: 'Minum dengan air putih hangat, 1 jam sebelum sarapan'
      },
      {
        medicineName: 'Vitamin B6 (Piridoksin HCl) 10 mg',
        dosage: '1 Tablet',
        frequency: '1x sehari',
        quantity: 28,
        instructions: 'Pencegahan neuropati perifer imbas Isoniazid'
      }
    ],
    status: 'selesai'
  },
  {
    id: 'ehr-2',
    patientId: 1,
    patientName: 'Dika Pratama',
    nik: '3201123456780001',
    noRm: 'RM-2026-0814',
    gender: 'Laki-laki',
    age: 24,
    visitDate: '2026-10-19',
    poliId: 'poli_tb',
    poliName: 'Poli TB / Paru (DOTS)',
    doctorName: 'dr. Budi Setiawan',
    anamnesis: 'Kontrol evaluasi minggu ke-1 pengobatan TB. Batuk berdahak mulai berkurang, dahak lebih mudah dikeluarkan. Mengeluh mual ringan pada hari ke-3 & 4 setelah minum obat, serta air seni berwarna kemerahan.',
    allergies: 'Tidak ada riwayat alergi obat',
    vitalSigns: {
      systolic: 118,
      diastolic: 76,
      heartRate: 78,
      respiratoryRate: 18,
      temperature: 36.7,
      weight: 55.8,
      height: 168,
      bmi: '19.8',
      bmiCategory: 'Normal'
    },
    primaryDiagnosis: 'A15.0 - Tuberkulosis Paru (Evaluasi Hari ke-7 DOTS)',
    secondaryDiagnosis: 'K29.7 - Gastritis fungsional ringan imbas OAT',
    clinicalNotes: 'Edukasi bahwa urin merah adalah efek samping wajar dari zat Rifampisin. Disarankan minum obat bersama biskuit atau pisang jika mual berulang. Kepatuhan dipantau via Bot WhatsApp & PMO.',
    prescriptions: [
      {
        medicineName: 'Antasida Doen Tablet Kunyah',
        dosage: '1 Tablet dikunyah',
        frequency: '3x sehari jika mual',
        quantity: 10,
        instructions: 'Kunyah halus 30 menit sebelum minum obat TB jika lambung perih'
      }
    ],
    status: 'selesai'
  },
  {
    id: 'ehr-3',
    patientId: 2,
    patientName: 'Siti Aisyah',
    nik: '3201123456780002',
    noRm: 'RM-2026-0612',
    gender: 'Perempuan',
    age: 32,
    visitDate: '2026-10-15',
    poliId: 'poli_umum',
    poliName: 'Poli Umum',
    doctorName: 'dr. Sarah Anindita, Sp.KKLP',
    anamnesis: 'Pasien kontrol hipertensi berkala. Mengaku tidak ada pusing, tidak ada pandangan kabur, rutin minum obat amlodipine tiap malam sebelum tidur.',
    allergies: 'Alergi penisilin (gatal-gatal)',
    vitalSigns: {
      systolic: 130,
      diastolic: 84,
      heartRate: 76,
      respiratoryRate: 18,
      temperature: 36.5,
      weight: 62,
      height: 158,
      bmi: '24.8',
      bmiCategory: 'Normal Tinggi'
    },
    primaryDiagnosis: 'I10 - Hipertensi Esensial Terkontrol',
    secondaryDiagnosis: '-',
    clinicalNotes: 'Target tekanan darah tercapai baik (<140/90 mmHg). Lanjutkan diet rendah garam, kurangi makanan santan dan olahan asin.',
    prescriptions: [
      {
        medicineName: 'Amlodipine 5 mg',
        dosage: '1 Tablet',
        frequency: '1x sehari malam hari',
        quantity: 30,
        instructions: 'Minum teratur jam 21:00 sebelum tidur'
      }
    ],
    status: 'selesai'
  }
];

export const INITIAL_PMO_PATIENTS = [
  {
    id: 1,
    name: 'Dika Pratama',
    nik: '3201123456780001',
    noRm: 'RM-2026-0814',
    age: 24,
    gender: 'L',
    phone: '+6281234567890',
    address: 'Jl. Anggrek No. 14, RW 04 Mekar Jaya',
    diagnosis: 'TB Paru BTA(+) Kasus Baru',
    phase: 'Fase Intensif (Bulan ke-1)',
    dayNumber: 12,
    totalDays: 180,
    regimen: 'OAT 4KDT Kategori 1 (3 Tablet/hari)',
    scheduleTime: '08:00 WIB',
    adherenceScore: 98,
    todayStatus: 'sudah_minum',
    lastTakenTime: '08:02 WIB',
    streakDays: 12,
    recentWeek: ['minum', 'minum', 'minum', 'minum', 'minum', 'minum', 'minum'],
    riskLevel: 'Rendah',
    notes: 'Keluarga sangat suportif. Pasien teratur merespon bot WA dan didampingi langsung.'
  },
  {
    id: 2,
    name: 'Siti Aisyah',
    nik: '3201123456780002',
    noRm: 'RM-2026-0612',
    age: 32,
    gender: 'P',
    phone: '+6285611223344',
    address: 'Kp. Melati RT 03/02, Mekar Jaya',
    diagnosis: 'TB Paru Klinis & Hipertensi',
    phase: 'Fase Intensif (Bulan ke-2)',
    dayNumber: 45,
    totalDays: 180,
    regimen: 'OAT 4KDT (3 Tablet) + Amlodipine 5mg',
    scheduleTime: '06:30 WIB',
    adherenceScore: 95,
    todayStatus: 'sudah_minum',
    lastTakenTime: '06:32 WIB',
    streakDays: 20,
    recentWeek: ['minum', 'minum', 'minum', 'minum', 'minum', 'minum', 'minum'],
    riskLevel: 'Rendah',
    notes: 'Didampingi suami. Berat badan sudah naik 2.5 kg.'
  },
  {
    id: 3,
    name: 'Rudi Santoso',
    nik: '3201123456780003',
    noRm: 'RM-2026-0744',
    age: 48,
    gender: 'L',
    phone: '+6287855667788',
    address: 'Jl. Flamboyan Blok B2, Mekar Jaya',
    diagnosis: 'TB Paru Kasus Baru',
    phase: 'Fase Intensif (Bulan ke-1)',
    dayNumber: 28,
    totalDays: 180,
    regimen: 'OAT 4KDT (4 Tablet/hari)',
    scheduleTime: '20:00 WIB',
    adherenceScore: 78,
    todayStatus: 'belum_minum',
    lastTakenTime: null,
    streakDays: 0,
    recentWeek: ['minum', 'mangkir', 'minum', 'minum', 'mangkir', 'minum', 'belum'],
    riskLevel: 'Tinggi (Berisiko Drop-out)',
    notes: 'Pekerja pabrik shift malam, sering terlambat minum obat. Sempat bolong 2 kali minggu ini.'
  },
  {
    id: 4,
    name: 'Maya Anggraini',
    nik: '3201123456780004',
    noRm: 'RM-2026-0421',
    age: 21,
    gender: 'P',
    phone: '+6282144556677',
    address: 'Perum Mekar Indah Kav. 8',
    diagnosis: 'TB Paru Klinis',
    phase: 'Fase Lanjutan (Bulan ke-3)',
    dayNumber: 84,
    totalDays: 180,
    regimen: 'OAT 2KDT Lanjutan (2 Tablet 3x/minggu)',
    scheduleTime: '07:00 WIB',
    adherenceScore: 96,
    todayStatus: 'sudah_minum',
    lastTakenTime: '07:05 WIB',
    streakDays: 32,
    recentWeek: ['minum', 'libur', 'minum', 'libur', 'minum', 'libur', 'minum'],
    riskLevel: 'Rendah',
    notes: 'Kondisi klinis sangat bagus, batuk sudah hilang total.'
  },
  {
    id: 5,
    name: 'Agus Wijaya',
    nik: '3201123456780005',
    noRm: 'RM-2026-0119',
    age: 55,
    gender: 'L',
    phone: '+6281933221100',
    address: 'Jl. Kemuning Raya No. 40',
    diagnosis: 'TB Paru BTA(+)',
    phase: 'Fase Lanjutan (Bulan ke-6 - Tahap Akhir)',
    dayNumber: 172,
    totalDays: 180,
    regimen: 'OAT 2KDT Lanjutan (3 Tablet 3x/minggu)',
    scheduleTime: '08:30 WIB',
    adherenceScore: 99,
    todayStatus: 'sudah_minum',
    lastTakenTime: '08:30 WIB',
    streakDays: 54,
    recentWeek: ['minum', 'libur', 'minum', 'libur', 'minum', 'libur', 'minum'],
    riskLevel: 'Rendah (Menjelang Sembuh Total)',
    notes: 'Tinggal 8 hari lagi pengobatan selesai. Uji dahak evaluasi akhir negatif.'
  }
];

export const INITIAL_ADVERSE_REPORTS = [
  {
    id: 'adv-1',
    patientId: 3,
    patientName: 'Rudi Santoso',
    pmoName: 'Ibu Ratna (PMO)',
    category: 'Efek Samping Berat: Gatal & Ruam Kulit Kemerahan',
    severity: 'sedang',
    description: 'Pasien Rudi Santoso mengalami bintik kemerahan dan gatal-gatal di bagian dada serta punggung setelah minum obat 4KDT malam kemarin. Pasien sempat menolak minum obat dosis berikutnya karena takut tambah parah.',
    reportedAt: '2026-10-22 21:15 WIB',
    status: 'ditindaklanjuti',
    doctorResponse: 'dr. Sarah Anindita (23 Okt, 08:30 WIB): Pasien diminta datang ke Poli TB hari ini untuk pemeriksaan alergi OAT. Sementara diberikan Cetirizine 10mg dan pengawasan ketat toleransi pirazinamid.'
  },
  {
    id: 'adv-2',
    patientId: 1,
    patientName: 'Dika Pratama',
    pmoName: 'Ibu Ratna (PMO)',
    category: 'Keluhan Ringan: Mual Setelah Minum Obat Pagi',
    severity: 'rendah',
    description: 'Dika merasa perutnya mual sekitar 20 menit setelah menelan 3 tablet FDC. Tidak ada muntah atau sesak nafas.',
    reportedAt: '2026-10-21 08:40 WIB',
    status: 'selesai',
    doctorResponse: 'dr. Sarah Anindita: Normal pada adaptasi fase awal. Sarankan makan pisang atau biskuit 30 menit sebelum obat dan minum dengan air hangat.'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    forRole: 'pasien',
    title: 'Pengingat Minum Obat Hari ke-12',
    message: 'Halo Dika! Waktunya minum 3 tablet OAT 4KDT pagi ini pukul 08:00 WIB. Jaga kesehatan paru Anda!',
    type: 'medication',
    time: '08:00 WIB Hari Ini',
    read: false
  },
  {
    id: 'notif-2',
    forRole: 'pasien',
    title: 'Tiket Antrean Terdaftar',
    message: 'Nomor antrean D-002 untuk Poli TB/Paru telah terbit. Harap berada di ruang tunggu Klinik DOTS.',
    type: 'queue',
    time: '08:42 WIB Hari Ini',
    read: false
  },
  {
    id: 'notif-3',
    forRole: 'petugas',
    title: '⚠️ Laporan PMO Baru: Kendala Pasien',
    message: 'Ibu Ratna (PMO) melaporkan efek samping ruam dan gatal pada pasien Rudi Santoso (TB-003).',
    type: 'alert',
    time: '22 Okt, 21:15 WIB',
    read: false
  },
  {
    id: 'notif-4',
    forRole: 'petugas',
    title: 'Peringatan Stok Farmasi Menipis',
    message: 'Stok Amoxicillin 500mg tersisa 22 kapsul (di bawah batas minimal 50 kapsul). Perlu restock.',
    type: 'warning',
    time: '23 Okt, 07:30 WIB',
    read: false
  },
  {
    id: 'notif-5',
    forRole: 'pmo',
    title: 'Jadwal Pendampingan Harian',
    message: 'Terdapat 5 pasien TB di bawah pantauan Anda hari ini. 4 pasien sudah minum obat, 1 pasien belum.',
    type: 'info',
    time: '23 Okt, 07:00 WIB',
    read: false
  }
];

export const DEFAULT_USERS = [
  {
    id: 1,
    username: 'dika',
    email: 'dika@pasien.id',
    password: '123',
    role: 'pasien',
    name: 'Dika Pratama',
    nik: '3201123456780001',
    noBpjs: '0001827364891',
    noRm: 'RM-2026-0814',
    phone: '+6281234567890',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    roleTitle: 'Pasien Terdaftar • Program DOTS TB'
  },
  {
    id: 10,
    username: 'petugas',
    email: 'sarah@puskesmas.go.id',
    password: '123',
    role: 'petugas',
    name: 'dr. Sarah Anindita, Sp.KKLP',
    nip: '19880415 201403 2 004',
    phone: '+6281299887766',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    roleTitle: 'Dokter Penanggung Jawab Poli & RME'
  },
  {
    id: 20,
    username: 'pmo',
    email: 'ratna@pmo.id',
    password: '123',
    role: 'pmo',
    name: 'Ibu Ratna (PMO)',
    phone: '+6281398765432',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    roleTitle: 'Pengawas Menelan Obat (Kader RW 04)'
  },
  {
    id: 99,
    username: 'admin',
    email: 'admin@puskesmas.go.id',
    password: '123',
    role: 'admin',
    name: 'Pak Bahrul, SKM',
    phone: '+6281122334455',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    roleTitle: 'Administrator Sistem Informasi Puskesmas'
  }
];

// Helper to safely load state
export function getSimpusState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = {
        users: DEFAULT_USERS,
        queues: INITIAL_QUEUES,
        ehrRecords: INITIAL_EHR_RECORDS,
        pharmacyStock: INITIAL_PHARMACY_STOCK,
        pmoPatients: INITIAL_PMO_PATIENTS,
        adverseReports: INITIAL_ADVERSE_REPORTS,
        notifications: INITIAL_NOTIFICATIONS,
        medicineSchedules: {
          1: {
            patientId: 1,
            patientName: 'Dika Pratama',
            times: ['08:00'],
            frequency: '1x sehari',
            periodLabel: 'Pagi',
            instructions: 'Diminum 3 tablet sekaligus, 1 jam sebelum sarapan dengan air putih',
            regimen: 'FDC 4KDT Kategori 1 (Rifampisin + Isoniazid + Pirazinamid + Etambutol)',
            doctorName: 'dr. Sarah Anindita, Sp.KKLP',
            updatedAt: '23 Okt 2026, 08:00 WIB'
          }
        },
        chatMessages: [
          {
            id: 1,
            threadId: 'patient-1',
            sender: 'officer',
            senderName: 'Bu Sari (Petugas Puskesmas)',
            text: 'Halo, ada keluhan terkait obat atau efek samping yang dirasakan?',
            time: '09:12'
          },
          {
            id: 2,
            threadId: 'patient-1',
            sender: 'patient',
            senderName: 'Dika Pratama',
            text: 'Iya bu, tadi malam saya mual setelah minum obat. Apakah ini normal?',
            time: '09:15'
          },
          {
            id: 3,
            threadId: 'patient-1',
            sender: 'officer',
            senderName: 'dr. Sarah Anindita, Sp.KKLP',
            text: 'Mual bisa terjadi, biasanya akan berkurang setelah beberapa hari. Coba minum obat setelah makan dan minum air putih yang cukup ya.',
            time: '09:18'
          },
          {
            id: 4,
            threadId: 'patient-1',
            sender: 'patient',
            senderName: 'Dika Pratama',
            text: 'Baik, terima kasih banyak bu!',
            time: '09:20'
          }
        ],
        urgentWarnings: [],
        activeUser: null // Initially not logged in, lands on Login Landing Page
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = DEFAULT_USERS;
    } else {
      // Ensure all users have passwords populated even from older localStorage state
      parsed.users = parsed.users.map((u) => {
        const def = DEFAULT_USERS.find(
          (d) => d.id === u.id || (d.email && u.email && d.email.toLowerCase() === u.email.toLowerCase())
        );
        return {
          ...u,
          password: u.password || def?.password || '123'
        };
      });
    }

    if (!parsed.medicineSchedules) {
      parsed.medicineSchedules = {
        1: {
          patientId: 1,
          patientName: 'Dika Pratama',
          times: ['08:00'],
          frequency: '1x sehari',
          periodLabel: 'Pagi',
          instructions: 'Diminum 3 tablet sekaligus, 1 jam sebelum sarapan dengan air putih',
          regimen: 'FDC 4KDT Kategori 1 (Rifampisin + Isoniazid + Pirazinamid + Etambutol)',
          doctorName: 'dr. Sarah Anindita, Sp.KKLP',
          updatedAt: '23 Okt 2026, 08:00 WIB'
        }
      };
    }

    if (!parsed.chatMessages || parsed.chatMessages.length === 0) {
      parsed.chatMessages = [
        {
          id: 1,
          threadId: 'patient-1',
          sender: 'officer',
          senderName: 'Bu Sari (Petugas Puskesmas)',
          text: 'Halo, ada keluhan terkait obat atau efek samping yang dirasakan?',
          time: '09:12'
        },
        {
          id: 2,
          threadId: 'patient-1',
          sender: 'patient',
          senderName: 'Dika Pratama',
          text: 'Iya bu, tadi malam saya mual setelah minum obat. Apakah ini normal?',
          time: '09:15'
        },
        {
          id: 3,
          threadId: 'patient-1',
          sender: 'officer',
          senderName: 'dr. Sarah Anindita, Sp.KKLP',
          text: 'Mual bisa terjadi, biasanya akan berkurang setelah beberapa hari. Coba minum obat setelah makan dan minum air putih yang cukup ya.',
          time: '09:18'
        },
        {
          id: 4,
          threadId: 'patient-1',
          sender: 'patient',
          senderName: 'Dika Pratama',
          text: 'Baik, terima kasih banyak bu!',
          time: '09:20'
        }
      ];
    }

    if (!parsed.urgentWarnings) {
      parsed.urgentWarnings = [];
    }

    return parsed;
  } catch (err) {
    console.error('Error reading SIMPus state from localStorage:', err);
    return {
      users: DEFAULT_USERS,
      queues: INITIAL_QUEUES,
      ehrRecords: INITIAL_EHR_RECORDS,
      pharmacyStock: INITIAL_PHARMACY_STOCK,
      pmoPatients: INITIAL_PMO_PATIENTS,
      adverseReports: INITIAL_ADVERSE_REPORTS,
      notifications: INITIAL_NOTIFICATIONS,
      medicineSchedules: {},
      chatMessages: [],
      urgentWarnings: [],
      activeUser: null
    };
  }
}

// ----------------- DOCTOR MEDICINE SCHEDULING -----------------
export function getPatientMedicineSchedule(patientId = 1) {
  const state = getSimpusState();
  if (state.medicineSchedules && state.medicineSchedules[patientId]) {
    return state.medicineSchedules[patientId];
  }
  return {
    patientId,
    patientName: 'Dika Pratama',
    times: ['08:00'],
    frequency: '1x sehari',
    periodLabel: 'Pagi',
    instructions: 'Diminum 3 tablet sekaligus, 1 jam sebelum sarapan dengan air putih',
    regimen: 'FDC 4KDT Kategori 1',
    doctorName: 'dr. Sarah Anindita, Sp.KKLP',
    updatedAt: '23 Okt 2026'
  };
}

export function savePatientMedicineSchedule(patientId, newScheduleData) {
  const state = getSimpusState();
  if (!state.medicineSchedules) state.medicineSchedules = {};

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const updatedSchedule = {
    ...getPatientMedicineSchedule(patientId),
    ...newScheduleData,
    patientId,
    updatedAt: `${now.getDate()} Okt ${now.getFullYear()}, ${timeStr}`
  };

  state.medicineSchedules[patientId] = updatedSchedule;

  // Also update in pmoPatients list if exists
  if (state.pmoPatients) {
    state.pmoPatients = state.pmoPatients.map((p) => {
      if (p.id === patientId || p.patientId === patientId) {
        return {
          ...p,
          scheduleTime: updatedSchedule.times.join(' & ') + ' WIB',
          regimen: updatedSchedule.regimen || p.regimen
        };
      }
      return p;
    });
  }

  // Add notification to patient and PMO
  state.notifications.unshift({
    id: `notif-sched-${Date.now()}`,
    forRole: 'pasien',
    title: '⏰ Jadwal Minum Obat Diperbarui Dokter',
    message: `Dokter ${updatedSchedule.doctorName || 'dr. Sarah'} menetapkan jadwal minum obat Anda setiap jam: ${updatedSchedule.times.join(', ')} (${updatedSchedule.frequency}).`,
    type: 'info',
    time: 'Baru saja',
    read: false
  });

  saveSimpusState(state);
  return updatedSchedule;
}

// ----------------- DOCTOR WARNING / CHAT ACTION -----------------
export function sendDoctorWarning({
  patientId = 1,
  target = 'pasien', // 'pasien', 'pmo', or 'both'
  patientName = 'Dika Pratama',
  doctorName = 'dr. Sarah Anindita, Sp.KKLP',
  message,
  urgency = 'high'
}) {
  const state = getSimpusState();
  if (!state.chatMessages) state.chatMessages = [];
  if (!state.urgentWarnings) state.urgentWarnings = [];

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 1. Add to Chat Conversation
  const newChatMsg = {
    id: Date.now(),
    threadId: `patient-${patientId}`,
    sender: 'officer',
    senderName: doctorName,
    text: `⚠️ [Peringatan Dokter]: ${message}`,
    time: timeStr,
    isWarning: true,
    target
  };
  state.chatMessages.push(newChatMsg);

  // 2. Add Urgent Active Warning Banner
  const warningObj = {
    id: `warn-${Date.now()}`,
    patientId,
    patientName,
    doctorName,
    target,
    message,
    urgency,
    time: timeStr,
    dismissed: false
  };
  state.urgentWarnings.unshift(warningObj);

  // 3. Add to notifications
  state.notifications.unshift({
    id: `notif-warn-${Date.now()}`,
    forRole: target === 'pmo' ? 'pmo' : 'pasien',
    title: '⚠️ Peringatan Minum Obat dari Dokter',
    message: `${doctorName}: "${message}"`,
    type: 'warning',
    time: 'Baru saja',
    read: false
  });

  saveSimpusState(state);
  return { success: true, warning: warningObj, chatMessage: newChatMsg };
}

export function dismissUrgentWarning(warningId) {
  const state = getSimpusState();
  if (state.urgentWarnings) {
    state.urgentWarnings = state.urgentWarnings.filter((w) => w.id !== warningId);
    saveSimpusState(state);
  }
}

export function loginUser(identifier, password, targetRole = null) {
  const state = getSimpusState();
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPw = String(password || '').trim();

  if (!cleanId) {
    return { success: false, message: 'Harap masukkan Email, Username, atau NIK Anda.' };
  }
  if (!cleanPw) {
    return { success: false, message: 'Harap masukkan Kata Sandi Anda.' };
  }

  // 1. Search in users database
  const allUsers = state.users && state.users.length > 0 ? state.users : DEFAULT_USERS;
  const user = allUsers.find((u) => {
    return (
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.nik && u.nik === cleanId)
    );
  });

  // If user does not exist, return error
  if (!user) {
    return {
      success: false,
      message: 'Akun dengan Email / Username / NIK tersebut tidak ditemukan. Silakan periksa kembali atau daftar akun baru.'
    };
  }

  // 2. Strict password validation
  const expectedPassword = String(user.password || '123').trim();
  if (cleanPw !== expectedPassword) {
    return {
      success: false,
      message: 'Kata sandi yang Anda masukkan salah! Silakan periksa kembali kata sandi Anda.'
    };
  }

  // 3. Check role compatibility only if targetRole was explicitly provided
  if (targetRole && user.role !== targetRole) {
    return {
      success: false,
      message: `Akun ini terdaftar sebagai peran "${user.role.toUpperCase()}", bukan "${targetRole.toUpperCase()}".`
    };
  }

  // Login successful!
  state.activeUser = user;
  saveSimpusState(state);
  return { success: true, user };
}

export function registerNewUser({
  name,
  nik,
  email,
  username,
  phone,
  password,
  role = 'pasien'
}) {
  const state = getSimpusState();
  if (!state.users) state.users = [...DEFAULT_USERS];

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanUsername = username ? username.trim().toLowerCase() : (cleanEmail.split('@')[0] || `user_${Date.now()}`);
  const cleanPassword = String(password || '123').trim();

  // Check if email or username already exists
  const existing = state.users.find(
    (u) =>
      (u.email && u.email.toLowerCase() === cleanEmail) ||
      (u.username && u.username.toLowerCase() === cleanUsername)
  );

  if (existing) {
    return {
      success: false,
      message: 'Email atau Username ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.'
    };
  }

  const newUser = {
    id: Date.now(),
    name,
    nik: nik || '3201' + Math.floor(100000000000 + Math.random() * 900000000000),
    email: cleanEmail,
    username: cleanUsername,
    phone: phone || '+628123456789',
    password: cleanPassword,
    role,
    noRm: role === 'pasien' ? `RM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    noBpjs: role === 'pasien' ? '000' + Math.floor(1000000000 + Math.random() * 9000000000) : undefined,
    avatar: role === 'pasien'
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      : role === 'petugas'
      ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'
      : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    roleTitle: role === 'pasien'
      ? 'Pasien Terdaftar'
      : role === 'petugas'
      ? 'Petugas Medis Puskesmas'
      : 'Pengawas Menelan Obat (PMO)'
  };

  state.users.push(newUser);
  state.activeUser = newUser;

  // Add welcome notification
  state.notifications.unshift({
    id: `notif-reg-${Date.now()}`,
    forRole: role,
    title: `Selamat Datang di SIMPus, ${name}!`,
    message: `Akun Anda berhasil didaftarkan sebagai ${newUser.roleTitle}. Akses layanan digital Puskesmas kini aktif.`,
    type: 'info',
    time: 'Baru saja',
    read: false
  });

  saveSimpusState(state);
  return { success: true, user: newUser };
}

export function logoutCurrentUser() {
  const state = getSimpusState();
  state.activeUser = null;
  saveSimpusState(state);
  return true;
}

export function saveSimpusState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('simpus-state-changed', { detail: state }));
  } catch (err) {
    console.error('Error saving SIMPus state:', err);
  }
}

export function resetSimpusState() {
  localStorage.removeItem(STORAGE_KEY);
  const state = getSimpusState();
  window.dispatchEvent(new CustomEvent('simpus-state-changed', { detail: state }));
  return state;
}

// ----------------- QUEUE ACTIONS -----------------
export function registerNewQueueTicket({
  poliId,
  patientName = 'Dika Pratama',
  nik = '3201123456780001',
  bpjsNumber = '0001827364891',
  paymentType = 'BPJS Kesehatan',
  complaint = 'Pemeriksaan rutin dan konsultasi dokter',
  doctorName
}) {
  const state = getSimpusState();
  const poli = POLI_LIST.find((p) => p.id === poliId) || POLI_LIST[0];

  // Count existing tickets for this poli today to get sequential number
  const existingForPoli = state.queues.filter((q) => q.poliId === poli.id);
  const nextNum = existingForPoli.length + 1;
  const queueNumber = `${poli.code}-${String(nextNum).padStart(3, '0')}`;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const newTicket = {
    id: `q-${Date.now()}`,
    queueNumber,
    poliId: poli.id,
    poliName: poli.name,
    patientId: state.activeUser.id || 1,
    patientName,
    nik,
    bpjsNumber,
    paymentType,
    complaint,
    registeredAt: timeStr,
    status: 'menunggu', // 'menunggu', 'dipanggil', 'sedang_diperiksa', 'farmasi', 'selesai'
    calledAt: null,
    doctor: doctorName || poli.doctor
  };

  state.queues.push(newTicket);

  // Add notification for petugas
  state.notifications.unshift({
    id: `notif-${Date.now()}`,
    forRole: 'petugas',
    title: `Antrean Baru: ${queueNumber} (${poli.name})`,
    message: `Pasien ${patientName} mendaftar antrean online untuk ${poli.name}.`,
    type: 'queue',
    time: timeStr,
    read: false
  });

  // Add notification for patient
  state.notifications.unshift({
    id: `notif-p-${Date.now()}`,
    forRole: 'pasien',
    title: `Tiket Antrean Diterbitkan: ${queueNumber}`,
    message: `Nomor antrean Anda adalah ${queueNumber} untuk ${poli.name}. Mohon pantau layar antrean.`,
    type: 'queue',
    time: timeStr,
    read: false
  });

  saveSimpusState(state);
  return newTicket;
}

export function updateQueueStatus(queueId, newStatus) {
  const state = getSimpusState();
  const idx = state.queues.findIndex((q) => q.id === queueId);
  if (idx !== -1) {
    state.queues[idx].status = newStatus;
    if (newStatus === 'dipanggil') {
      const now = new Date();
      state.queues[idx].calledAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    }
    saveSimpusState(state);
    return state.queues[idx];
  }
  return null;
}

// ----------------- EHR (REKAM MEDIS) ACTIONS -----------------
export function saveNewEhrRecord(ehrData) {
  const state = getSimpusState();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const newRecord = {
    id: `ehr-${Date.now()}`,
    patientId: ehrData.patientId || 1,
    patientName: ehrData.patientName,
    nik: ehrData.nik || '3201123456780001',
    noRm: ehrData.noRm || 'RM-2026-0814',
    gender: ehrData.gender || 'Laki-laki',
    age: ehrData.age || 24,
    visitDate: dateStr,
    poliId: ehrData.poliId || 'poli_umum',
    poliName: ehrData.poliName || 'Poli Umum',
    doctorName: ehrData.doctorName || 'dr. Sarah Anindita, Sp.KKLP',
    anamnesis: ehrData.anamnesis,
    allergies: ehrData.allergies || 'Tidak ada riwayat alergi',
    vitalSigns: ehrData.vitalSigns || {
      systolic: 120,
      diastolic: 80,
      heartRate: 80,
      respiratoryRate: 18,
      temperature: 36.6,
      weight: 56,
      height: 168,
      bmi: '19.8',
      bmiCategory: 'Normal'
    },
    primaryDiagnosis: ehrData.primaryDiagnosis,
    secondaryDiagnosis: ehrData.secondaryDiagnosis || '-',
    clinicalNotes: ehrData.clinicalNotes || 'Pasien diedukasi patuh minum obat dan istirahat teratur.',
    prescriptions: ehrData.prescriptions || [],
    status: 'selesai'
  };

  state.ehrRecords.unshift(newRecord);

  // If patient had an active queue, mark as farmasi or selesai
  if (ehrData.queueId) {
    const qIdx = state.queues.findIndex((q) => q.id === ehrData.queueId);
    if (qIdx !== -1) {
      state.queues[qIdx].status = ehrData.prescriptions?.length > 0 ? 'farmasi' : 'selesai';
    }
  }

  // Deduct pharmacy stock automatically if prescriptions exist
  if (ehrData.prescriptions && ehrData.prescriptions.length > 0) {
    ehrData.prescriptions.forEach((rx) => {
      const med = state.pharmacyStock.find((m) => m.name.toLowerCase().includes(rx.medicineName.toLowerCase()) || rx.medicineName.toLowerCase().includes(m.name.toLowerCase()));
      if (med) {
        med.stock = Math.max(0, med.stock - (rx.quantity || 10));
        if (med.stock <= med.minStock) {
          med.status = med.stock <= 20 ? 'kritis' : 'menipis';
        }
      }
    });

    // Notify patient
    state.notifications.unshift({
      id: `notif-rx-${Date.now()}`,
      forRole: 'pasien',
      title: 'Resep Obat Elektronik Diterbitkan',
      message: `Dokter telah meresepkan obat untuk Anda. Silakan menuju loket Farmasi Puskesmas.`,
      type: 'medication',
      time: 'Baru saja',
      read: false
    });
  }

  saveSimpusState(state);
  return newRecord;
}

// ----------------- PHARMACY ACTIONS -----------------
export function updatePharmacyStock(medicineId, amount, type = 'add', reason = '') {
  const state = getSimpusState();
  const med = state.pharmacyStock.find((m) => m.id === medicineId);
  if (med) {
    if (type === 'add') {
      med.stock += Number(amount);
    } else if (type === 'subtract') {
      med.stock = Math.max(0, med.stock - Number(amount));
    } else {
      med.stock = Number(amount);
    }

    if (med.stock > med.minStock) {
      med.status = 'aman';
    } else if (med.stock <= 20) {
      med.status = 'kritis';
    } else {
      med.status = 'menipis';
    }

    saveSimpusState(state);
    return med;
  }
  return null;
}

// ----------------- PMO (PENGAWAS MINUM OBAT) ACTIONS -----------------
export function logPmoDailyCompliance({
  patientId,
  status, // 'minum', 'belum', 'mangkir'
  takenTime,
  notes
}) {
  const state = getSimpusState();
  const p = state.pmoPatients.find((item) => item.id === patientId);
  if (p) {
    p.todayStatus = status === 'minum' ? 'sudah_minum' : (status === 'mangkir' ? 'mangkir' : 'belum_minum');
    if (status === 'minum') {
      p.lastTakenTime = takenTime || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      p.streakDays += 1;
      p.adherenceScore = Math.min(100, p.adherenceScore + 1);
      p.recentWeek[p.recentWeek.length - 1] = 'minum';
    } else if (status === 'mangkir') {
      p.streakDays = 0;
      p.adherenceScore = Math.max(50, p.adherenceScore - 5);
      p.recentWeek[p.recentWeek.length - 1] = 'mangkir';
      p.riskLevel = 'Tinggi (Berisiko Drop-out)';

      // Trigger notification to petugas
      state.notifications.unshift({
        id: `notif-drop-${Date.now()}`,
        forRole: 'petugas',
        title: `⚠️ Pasien TB Mangkir Minum Obat: ${p.name}`,
        message: `PMO melaporkan pasien ${p.name} tidak minum obat hari ini. Catatan: ${notes || 'Perlu kunjungan/telepon konfirmasi'}`,
        type: 'alert',
        time: 'Baru saja',
        read: false
      });
    }

    if (notes) {
      p.notes = notes;
    }

    saveSimpusState(state);
    return p;
  }
  return null;
}

export function submitPmoAdverseReport({
  patientId,
  patientName,
  category,
  severity = 'sedang',
  description
}) {
  const state = getSimpusState();
  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const newReport = {
    id: `adv-${Date.now()}`,
    patientId: patientId || 1,
    patientName: patientName || 'Dika Pratama',
    pmoName: 'Ibu Ratna (PMO)',
    category,
    severity, // 'rendah', 'sedang', 'darurat'
    description,
    reportedAt: timeStr,
    status: 'menunggu_tanggapan',
    doctorResponse: null
  };

  state.adverseReports.unshift(newReport);

  // Dispatch high-priority alert for Petugas Puskesmas
  state.notifications.unshift({
    id: `notif-adv-${Date.now()}`,
    forRole: 'petugas',
    title: `🚨 LAPORAN KENDALA PMO: ${patientName}`,
    message: `[Urgensi ${severity.toUpperCase()}] ${category}: ${description.substring(0, 90)}...`,
    type: 'alert',
    time: 'Baru saja',
    read: false
  });

  saveSimpusState(state);
  return newReport;
}

export function respondToPmoReport(reportId, doctorResponse) {
  const state = getSimpusState();
  const rep = state.adverseReports.find((r) => r.id === reportId);
  if (rep) {
    rep.status = 'ditindaklanjuti';
    rep.doctorResponse = `dr. Sarah Anindita (Petugas Puskesmas): ${doctorResponse}`;

    // Notify PMO
    state.notifications.unshift({
      id: `notif-pmo-${Date.now()}`,
      forRole: 'pmo',
      title: `Tanggapan Dokter untuk Laporan: ${rep.patientName}`,
      message: doctorResponse,
      type: 'info',
      time: 'Baru saja',
      read: false
    });

    saveSimpusState(state);
    return rep;
  }
  return null;
}
