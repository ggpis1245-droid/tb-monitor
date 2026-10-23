/**
 * Client-Side Mock Backend & Storage Provider
 * Enables full offline and GitHub Pages standalone execution.
 * Simulates SQLite DB, WhatsApp Webhook, Cron Scheduler, and Consultations in-browser.
 */

const STORAGE_KEY = 'tb_monitor_state_v1';

const INITIAL_STATE = {
  patients: [
    {
      id: 1,
      nik: '3201123456780001',
      name: 'Dika Pratama',
      age: 24,
      gender: 'L',
      phone_number: '+6281234567890',
      pmo_name: 'Ibu Ratna',
      pmo_phone: '+6281398765432',
      pmo_relation: 'Ibu Kandung',
      address: 'Jl. Anggrek No. 14, Mekar Jaya',
      puskesmas_name: 'Puskesmas Mekar Jaya',
      start_date: '2026-10-12',
      total_days: 180,
      current_day: 12,
      phase: 'Intensif',
      medication_type: 'FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)',
      dosage_info: '3 Tablet FDC sekali minum, dianjurkan pukul 08:00 pagi saat perut kosong',
      schedule_time: '08:00',
      adherence_status: 'patuh',
      notes: 'Pasien memiliki motivasi tinggi untuk sembuh. Mengeluhkan mual ringan di minggu pertama, sudah membaik.'
    },
    {
      id: 2,
      nik: '3201123456780002',
      name: 'Siti Aisyah',
      age: 32,
      gender: 'P',
      phone_number: '+6285611223344',
      pmo_name: 'Ahmad Fauzi',
      pmo_phone: '+6285699887711',
      pmo_relation: 'Suami',
      address: 'Kp. Melati RT 03/02, Mekar Jaya',
      puskesmas_name: 'Puskesmas Mekar Jaya',
      start_date: '2026-09-09',
      total_days: 180,
      current_day: 45,
      phase: 'Intensif',
      medication_type: 'FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)',
      dosage_info: '3 Tablet FDC pagi hari',
      schedule_time: '06:30',
      adherence_status: 'patuh',
      notes: 'Sangat patuh minum obat. Selalu diingatkan suami.'
    },
    {
      id: 3,
      nik: '3201123456780003',
      name: 'Rudi Santoso',
      age: 48,
      gender: 'L',
      phone_number: '+6287855667788',
      pmo_name: 'Budi Santoso',
      pmo_phone: '+6287811224455',
      pmo_relation: 'Adik',
      address: 'Jl. Flamboyan Blok B2, Mekar Jaya',
      puskesmas_name: 'Puskesmas Mekar Jaya',
      start_date: '2026-09-26',
      total_days: 180,
      current_day: 28,
      phase: 'Intensif',
      medication_type: 'FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)',
      dosage_info: '4 Tablet FDC malam hari setelah makan malam',
      schedule_time: '20:00',
      adherence_status: 'tidak_patuh',
      notes: 'Sering lembur kerja pabrik, sempat terlewat minum obat 2 hari terakhir. Perlu kunjungan rumah (home visit).'
    },
    {
      id: 4,
      nik: '3201123456780004',
      name: 'Maya Anggraini',
      age: 21,
      gender: 'P',
      phone_number: '+6282144556677',
      pmo_name: 'Hendra',
      pmo_phone: '+6282199001122',
      pmo_relation: 'Ayah',
      address: 'Perum Mekar Indah Kav. 8',
      puskesmas_name: 'Puskesmas Mekar Jaya',
      start_date: '2026-08-01',
      total_days: 180,
      current_day: 84,
      phase: 'Lanjutan',
      medication_type: 'FDC Lanjutan (Rifampisin + Isoniazid)',
      dosage_info: '2 Tablet FDC 3x seminggu',
      schedule_time: '07:00',
      adherence_status: 'patuh',
      notes: 'Masuk fase lanjutan. Kondisi klinis dan berat badan naik 4 kg.'
    },
    {
      id: 5,
      nik: '3201123456780005',
      name: 'Agus Wijaya',
      age: 55,
      gender: 'L',
      phone_number: '+6281933221100',
      pmo_name: 'Lestari',
      pmo_phone: '+6281988776655',
      pmo_relation: 'Istri',
      address: 'Jl. Kemuning Raya No. 40',
      puskesmas_name: 'Puskesmas Mekar Jaya',
      start_date: '2026-05-05',
      total_days: 180,
      current_day: 172,
      phase: 'Lanjutan',
      medication_type: 'FDC Lanjutan (Rifampisin + Isoniazid)',
      dosage_info: '3 Tablet FDC pagi',
      schedule_time: '08:30',
      adherence_status: 'patuh',
      notes: 'Hampir menyelesaikan pengobatan 180 hari (tinggal 8 hari lagi). Uji dahak evaluasi negatif.'
    }
  ],
  adherenceLogs: [
    { id: 1, patient_id: 1, scheduled_date: '2026-10-18', scheduled_time: '08:00', confirmed_at: '2026-10-18 08:05:00', status: 'minum', confirmation_method: 'whatsapp', notes: 'Tepat waktu' },
    { id: 2, patient_id: 1, scheduled_date: '2026-10-19', scheduled_time: '08:00', confirmed_at: '2026-10-19 08:04:00', status: 'minum', confirmation_method: 'app_button', notes: 'Tepat waktu' },
    { id: 3, patient_id: 1, scheduled_date: '2026-10-20', scheduled_time: '08:00', confirmed_at: '2026-10-20 08:01:00', status: 'minum', confirmation_method: 'whatsapp', notes: 'Tepat waktu' },
    { id: 4, patient_id: 1, scheduled_date: '2026-10-21', scheduled_time: '08:00', confirmed_at: '2026-10-21 08:12:00', status: 'minum', confirmation_method: 'whatsapp', notes: 'Konfirmasi via bot' },
    { id: 5, patient_id: 1, scheduled_date: '2026-10-22', scheduled_time: '08:00', confirmed_at: '2026-10-22 08:03:00', status: 'minum', confirmation_method: 'app_button', notes: 'Tepat waktu' },
    { id: 6, patient_id: 1, scheduled_date: '2026-10-23', scheduled_time: '08:00', confirmed_at: '2026-10-23 08:02:15', status: 'minum', confirmation_method: 'whatsapp', notes: 'Konfirmasi via WhatsApp Bot ("SUDAH")' }
  ],
  consultations: [
    {
      id: 1,
      patient_id: 1,
      sender_role: 'pasien',
      sender_name: 'Dika Pratama',
      message: 'Selamat pagi Bu Sari, saya mau tanya. Setelah minum obat tadi pagi, perut saya terasa agak mual dan air kencing agak berwarna kemerahan. Apakah itu berbahaya?',
      category: 'keluhan_obat',
      created_at: '2026-10-21 09:15:00'
    },
    {
      id: 2,
      patient_id: 1,
      sender_role: 'petugas',
      sender_name: 'Bu Sari, S.Kep',
      message: 'Halo Mas Dika, tenang ya. Air seni berwarna merah atau oranye itu efek samping yang sangat normal dan aman dari obat Rifampisin, bukan tanda bahaya atau pendarahan.',
      category: 'keluhan_obat',
      created_at: '2026-10-21 09:22:00'
    },
    {
      id: 3,
      patient_id: 1,
      sender_role: 'petugas',
      sender_name: 'Bu Sari, S.Kep',
      message: 'Untuk rasa mualnya, coba minum obat dengan air putih hangat dan jangan minum obat dalam keadaan perut benar-benar kosong jika maag terasa. Mas Dika bisa makan sedikit biskuit atau pisang 30 menit sebelum obat.',
      category: 'keluhan_obat',
      created_at: '2026-10-21 09:24:00'
    },
    {
      id: 4,
      patient_id: 1,
      sender_role: 'pasien',
      sender_name: 'Dika Pratama',
      message: 'Alhamdulillah terima kasih banyak Bu Sari, sangat melegakan. Saya akan ikuti sarannya.',
      category: 'umum',
      created_at: '2026-10-21 09:30:00'
    }
  ],
  whatsappLogs: [
    {
      id: 1,
      patient_id: 1,
      phone_number: '+6281234567890',
      direction: 'outgoing',
      message: '🔔 *PENGINGAT MINUM OBAT TB - PUSKESMAS MEKAR JAYA*\n\nHalo *Dika Pratama*! Sekarang pukul 08:00 WIB, saatnya minum obat TB hari ke-12.\n\n💊 *Dosis Hari Ini:* 3 Tablet FDC Kategori 1\n\nSilakan minum dengan air putih, lalu balas pesan ini dengan kata *"SUDAH"* untuk mencatat kepatuhan Anda hari ini. Tetap semangat, TBC pasti sembuh! 💪',
      created_at: '2026-10-23 08:00:01'
    },
    {
      id: 2,
      patient_id: 1,
      phone_number: '+6281234567890',
      direction: 'incoming',
      message: 'SUDAH',
      created_at: '2026-10-23 08:02:14'
    },
    {
      id: 3,
      patient_id: 1,
      phone_number: '+6281234567890',
      direction: 'outgoing',
      message: '✅ *Konfirmasi Diterima!* Terima kasih Dika Pratama. Status minum obat hari ke-12 telah dicatat: *PATUH (08:02 WIB)*. Lanjutkan sampai tuntas 180 hari ya!',
      created_at: '2026-10-23 08:02:16'
    }
  ],
  articles: [
    {
      id: 1,
      title: 'Apa itu TB? Mengenal Gejala dan Penularannya',
      category: 'TB',
      summary: 'Tuberkulosis (TBC) adalah penyakit menular yang disebabkan oleh kuman Mycobacterium tuberculosis. TBC BISA DISEMBUHKAN tuntas!',
      content: 'Tuberkulosis (TBC) merupakan infeksi bakteri yang menyerang organ paru-paru, namun bisa juga mengenai kelenjar getah bening, tulang, atau selaput otak. Gejala utama meliputi batuk berdahak lebih dari 2 minggu, demam sumeng-sumeng di malam hari, keringat malam tanpa aktivitas fisik, penurunan nafsu makan, dan penurunan berat badan secara drastis.\n\nKabar baiknya: TBC bukan penyakit kutukan atau keturunan! TBC dapat disembuhkan secara tuntas asalkan pasien meminum obat secara teratur selama 6 bulan tanpa putus.',
      read_time: '4 menit',
      published_date: '2026-10-18',
      image_badge: 'lungs'
    },
    {
      id: 2,
      title: 'Tips Minum Obat TB Agar Tidak Mual dan Tepat Waktu',
      category: 'Pengobatan',
      summary: 'Kiat praktis mengatasi efek samping ringan seperti rasa mual, lemas, serta trik membiasakan jadwal minum obat harian.',
      content: 'Menjalani pengobatan TB selama 6 bulan memerlukan kedisiplinan tinggi. Berikut adalah tips agar Anda nyaman minum obat:\n\n1. Tetapkan jam yang sama setiap hari (misalnya pukul 08:00 pagi atau sebelum tidur).\n2. Jika merasa mual, minum obat bersama sedikit makanan ringan seperti pisang atau biskuit.\n3. Jangan khawatir jika air seni berwarna merah atau oranye, itu pengaruh zat Rifampisin dan tidak berbahaya.\n4. Gunakan alarm dan selalu aktifkan notifikasi WhatsApp Bot Pengingat dari Puskesmas.\n5. Ingat: Jangan pernah menghentikan obat sendiri meskipun badan sudah merasa segar dan tidak batuk lagi!',
      read_time: '3 menit',
      published_date: '2026-10-15',
      image_badge: 'pill'
    },
    {
      id: 3,
      title: 'Makanan Bergizi untuk Mempercepat Pemulihan Pasien TB',
      category: 'Gizi',
      summary: 'Daftar asupan protein tinggi dan vitamin yang mendukung regenerasi sel paru-paru dan meningkatkan imunitas tubuh.',
      content: 'Nutrisi yang optimal sangat penting untuk mempercepat proses penyembuhan TB. Tubuh membutuhkan asupan energi dan protein tinggi untuk memperbaiki jaringan paru yang rusak.\n\nContoh makanan yang sangat dianjurkan:\n- Telur rebus (sumber protein terbaik dan terjangkau, 1-2 butir per hari)\n- Ikan kembung, tuna, atau lele (kaya asam lemak omega-3)\n- Tempe dan tahu sebagai sumber protein nabati\n- Sayuran hijau (bayam, brokoli) kaya zat besi dan antioksidan\n- Buah-buahan segar (pepaya, jeruk, pisang) kaya vitamin C untuk daya tahan tubuh.\n\nPerbanyak minum air putih minimal 2 liter sehari untuk membantu metabolisme obat di ginjal.',
      read_time: '5 menit',
      published_date: '2026-10-10',
      image_badge: 'apple'
    },
    {
      id: 4,
      title: 'Hindari Rokok dan Alkohol Selama Masa Pengobatan TB',
      category: 'Pengobatan',
      summary: 'Zat beracun dalam rokok dapat memperlambat penyembuhan jaringan paru dan menurunkan efektivitas obat antituberkulosis.',
      content: 'Merokok dan konsumsi alkohol adalah pantangan utama bagi penderita TBC. Asap rokok merusak silia (rambut halus pelindung saluran napas) dan memicu inflamasi kronis pada kantung udara paru (alveoli).\n\nSementara itu, alkohol dapat memperberat kerja hati yang sedang memproses obat anti-TB kuat seperti Isoniazid dan Rifampisin. Dengan berhenti merokok dan menjauhi alkohol, kesembuhan paru-paru Anda akan berlangsung jauh lebih cepat dan mencegah kekambuhan di kemudian hari.',
      read_time: '3 menit',
      published_date: '2026-10-05',
      image_badge: 'shield'
    },
    {
      id: 5,
      title: 'Pentingnya Peran PMO (Pengawas Menelan Obat) dalam Keluarga',
      category: 'TB',
      summary: 'Keluarga adalah garda terdepan penentu kesuksesan sembuh dari TB. Kenali tugas utama seorang PMO yang efektif.',
      content: 'Pengawas Menelan Obat (PMO) bertugas memastikan pasien menelan obat setiap hari sesuai dosis dan jadwal yang ditentukan. Selain mengawasi, PMO memberikan dukungan psikologis, mendampingi saat kontrol rutin ke Puskesmas, serta mengingatkan jika muncul keluhan efek samping.\n\nDukungan hangat dan penuh kasih dari keluarga membuat pasien merasa tidak berjuang sendirian melawan TBC.',
      read_time: '4 menit',
      published_date: '2026-10-01',
      image_badge: 'heart'
    }
  ]
};

function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATE));
      return INITIAL_STATE;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_STATE;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

/**
 * Handle Mock API requests
 */
export async function handleMockApiRequest(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const state = getState();
  const parsedUrl = new URL(url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  let body = {};
  if (options.body) {
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    } catch (e) {}
  }

  // 1. GET /api/auth/roles
  if (pathname === '/api/auth/roles' && method === 'GET') {
    return {
      success: true,
      data: [
        { id: 1, username: 'dika', name: 'Dika Pratama', role: 'pasien', phone_number: '+6281234567890' },
        { id: 2, username: 'ratna', name: 'Ibu Ratna', role: 'pmo', phone_number: '+6281398765432' },
        { id: 3, username: 'sari', name: 'Bu Sari, S.Kep', role: 'petugas', phone_number: '+6281299887766' },
        { id: 4, username: 'admin', name: 'Pak Bahrul, SKM', role: 'admin', phone_number: '+6281122334455' }
      ]
    };
  }

  // 2. GET /api/patients
  if (pathname === '/api/patients' && method === 'GET') {
    const search = (searchParams.get('search') || '').toLowerCase();
    const status = searchParams.get('status');

    let list = state.patients;
    if (search) {
      list = list.filter(p => p.name.toLowerCase().includes(search) || p.nik.includes(search) || p.phone_number.includes(search));
    }
    if (status && status !== 'all') {
      list = list.filter(p => p.adherence_status === status);
    }

    const total = state.patients.length;
    const patuh = state.patients.filter(p => p.adherence_status === 'patuh').length;
    const tidakPatuh = state.patients.filter(p => p.adherence_status === 'tidak_patuh').length;
    const dalamPemantauan = state.patients.filter(p => p.adherence_status === 'dalam_pemantauan').length;

    return {
      success: true,
      data: list,
      stats: {
        total,
        patuh,
        patuhPercentage: total > 0 ? Math.round((patuh / total) * 100) : 0,
        tidakPatuh,
        tidakPatuhPercentage: total > 0 ? Math.round((tidakPatuh / total) * 100) : 0,
        dalamPemantauan
      }
    };
  }

  // 3. GET /api/patients/:id
  const patientDetailMatch = pathname.match(/^\/api\/patients\/(\d+)$/);
  if (patientDetailMatch && method === 'GET') {
    const id = parseInt(patientDetailMatch[1]);
    const patient = state.patients.find(p => p.id === id) || state.patients[0];
    const logs = state.adherenceLogs.filter(l => l.patient_id === id);
    return {
      success: true,
      data: {
        ...patient,
        recentLogs: logs.slice(-14)
      }
    };
  }

  // 4. POST /api/patients (Register new)
  if (pathname === '/api/patients' && method === 'POST') {
    const newId = state.patients.length + 1;
    const newPatient = {
      id: newId,
      ...body,
      current_day: 1,
      total_days: parseInt(body.total_days) || 180,
      adherence_status: 'patuh'
    };
    state.patients.push(newPatient);
    saveState(state);
    return {
      success: true,
      message: 'Data pasien TB berhasil didaftarkan!',
      data: newPatient
    };
  }

  // 5. GET /api/patients/:id/adherence
  const adherenceMatch = pathname.match(/^\/api\/patients\/(\d+)\/adherence$/);
  if (adherenceMatch && method === 'GET') {
    const patientId = parseInt(adherenceMatch[1]);
    const patient = state.patients.find(p => p.id === patientId) || state.patients[0];

    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const weekDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const weeklyData = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const log = state.adherenceLogs.find(l => l.patient_id === patientId && l.scheduled_date === dateStr);
      const isFuture = d > now && dateStr !== now.toISOString().split('T')[0];

      let status = 'tidak_ada_data';
      if (log) {
        status = log.status;
      } else if (isFuture) {
        status = 'tidak_ada_data';
      }

      weeklyData.push({
        dayName: weekDays[i],
        date: dateStr,
        dayNum: d.getDate(),
        isToday: dateStr === now.toISOString().split('T')[0],
        isFuture,
        status,
        log: log || null
      });
    }

    const patientLogs = state.adherenceLogs.filter(l => l.patient_id === patientId);
    const daysTaken = patientLogs.filter(l => l.status === 'minum').length;

    return {
      success: true,
      data: {
        patient,
        weeklyData,
        allLogs: patientLogs,
        summary: {
          totalDays: patient.total_days,
          currentDay: patient.current_day,
          daysTaken,
          adherenceRate: patient.current_day > 0 ? Math.round((daysTaken / patient.current_day) * 100) : 0
        }
      }
    };
  }

  // 6. POST /api/adherence/confirm ("Sudah Minum" button)
  if (pathname === '/api/adherence/confirm' && method === 'POST') {
    const patientId = body.patientId || 1;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);

    const existingIndex = state.adherenceLogs.findIndex(l => l.patient_id === patientId && l.scheduled_date === todayStr);
    if (existingIndex >= 0) {
      state.adherenceLogs[existingIndex].status = 'minum';
      state.adherenceLogs[existingIndex].confirmed_at = `${todayStr} ${timeStr}`;
      state.adherenceLogs[existingIndex].confirmation_method = 'app_button';
    } else {
      state.adherenceLogs.push({
        id: state.adherenceLogs.length + 1,
        patient_id: patientId,
        scheduled_date: todayStr,
        scheduled_time: '08:00',
        confirmed_at: `${todayStr} ${timeStr}`,
        status: 'minum',
        confirmation_method: 'app_button',
        notes: 'Konfirmasi langsung melalui tombol aplikasi'
      });
    }

    // Set patient adherence status to patuh
    const p = state.patients.find(x => x.id === patientId);
    if (p) p.adherence_status = 'patuh';

    saveState(state);
    return {
      success: true,
      message: 'Hebat! Obat hari ini berhasil dicatat diminum.',
      time: timeStr
    };
  }

  // 7. POST /api/adherence/manual-override
  if (pathname === '/api/adherence/manual-override' && method === 'POST') {
    const { patientId, date, status, notes } = body;
    const existingIndex = state.adherenceLogs.findIndex(l => l.patient_id === patientId && l.scheduled_date === date);
    if (existingIndex >= 0) {
      state.adherenceLogs[existingIndex].status = status;
      state.adherenceLogs[existingIndex].notes = notes;
    } else {
      state.adherenceLogs.push({
        id: state.adherenceLogs.length + 1,
        patient_id: patientId,
        scheduled_date: date,
        scheduled_time: '08:00',
        status,
        notes: notes || 'Verifikasi manual oleh petugas'
      });
    }
    const p = state.patients.find(x => x.id === patientId);
    if (p) p.adherence_status = status === 'minum' ? 'patuh' : 'tidak_patuh';

    saveState(state);
    return { success: true, message: 'Status berhasil diperbarui' };
  }

  // 8. POST /api/whatsapp/webhook (Two-way WhatsApp Bot)
  if (pathname === '/api/whatsapp/webhook' && method === 'POST') {
    const sender = body.sender || '+6281234567890';
    const message = (body.message || '').trim();
    const lower = message.toLowerCase();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    let intent = 'UNKNOWN';
    let replyText = '';

    if (lower === 'sudah' || lower === '1' || lower.includes('sudah minum')) {
      intent = 'CONFIRM_MEDICATION';
      const pIndex = state.patients.findIndex(p => p.id === 1);
      if (pIndex >= 0) state.patients[pIndex].adherence_status = 'patuh';

      const logIndex = state.adherenceLogs.findIndex(l => l.patient_id === 1 && l.scheduled_date === todayStr);
      if (logIndex >= 0) {
        state.adherenceLogs[logIndex].status = 'minum';
        state.adherenceLogs[logIndex].confirmed_at = `${todayStr} ${timeStr}`;
        state.adherenceLogs[logIndex].confirmation_method = 'whatsapp';
      } else {
        state.adherenceLogs.push({
          id: state.adherenceLogs.length + 1,
          patient_id: 1,
          scheduled_date: todayStr,
          scheduled_time: '08:00',
          confirmed_at: `${todayStr} ${timeStr}`,
          status: 'minum',
          confirmation_method: 'whatsapp',
          notes: `Dikonfirmasi via WhatsApp: "${message}"`
        });
      }

      replyText = `✅ *Konfirmasi Berhasil Dicatat!*\n\nTerima kasih *Dika Pratama*. Status minum obat hari ke-12 telah terverifikasi: *PATUH (Pukul ${timeStr} WIB)*.\n\nLuar biasa, tetap jaga semangat dan minum obat rutin setiap hari sampai tuntas 180 hari ya! 💪💊`;
    } else if (lower.includes('belum') || lower === '2') {
      intent = 'DELAY_MEDICATION';
      replyText = `⚠️ *Harap Segera Diminum ya!*\n\nHalo *Dika Pratama*, obat TB sangat penting diminum tepat waktu agar kuman tidak kebal obat.\n\nJika sudah diminum, segera balas *"SUDAH"* ya.`;
    } else if (lower.includes('mual') || lower.includes('muntah') || lower.includes('merah') || lower.includes('lemas')) {
      intent = 'REPORT_SYMPTOM';
      state.consultations.push({
        id: state.consultations.length + 1,
        patient_id: 1,
        sender_role: 'pasien',
        sender_name: 'Dika Pratama',
        message: `[Keluhan via WhatsApp]: ${message}`,
        category: 'keluhan_obat',
        created_at: `${todayStr} ${timeStr}`
      });
      replyText = `🩺 *Keluhan Anda Telah Diteruskan ke Petugas TB*\n\nTerima kasih Dika. Pesan keluhan Anda telah kami sampaikan ke *Bu Sari (Perawat TB Puskesmas)*.\n\n_Catatan Medis:_ Air seni kemerahan adalah tanda normal dari obat Rifampisin. Jika mual, minum obat setelah makan sedikit biskuit atau pisang.`;
    } else {
      intent = 'GENERAL_QUERY';
      replyText = `Halo *Dika Pratama*! 👋\nKetik:\n• *"SUDAH"* untuk konfirmasi minum obat hari ini\n• *"JADWAL"* untuk melihat jadwal & sisa hari pengobatan\n• Ketik keluhan Anda untuk konsultasi dengan Bu Sari.`;
    }

    // Append to whatsapp logs
    state.whatsappLogs.push({
      id: state.whatsappLogs.length + 1,
      patient_id: 1,
      phone_number: sender,
      direction: 'incoming',
      message: message,
      created_at: `${todayStr} ${timeStr}`
    });

    state.whatsappLogs.push({
      id: state.whatsappLogs.length + 1,
      patient_id: 1,
      phone_number: sender,
      direction: 'outgoing',
      message: replyText,
      created_at: `${todayStr} ${timeStr}`
    });

    saveState(state);
    return {
      success: true,
      intent,
      patient: { id: 1, name: 'Dika Pratama' },
      botReply: replyText
    };
  }

  // 9. POST /api/whatsapp/send-reminder
  if (pathname === '/api/whatsapp/send-reminder' && method === 'POST') {
    const patientId = body.patientId || 1;
    const p = state.patients.find(x => x.id === patientId) || state.patients[0];
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const reminderMsg = body.customMessage || `🔔 *PENGINGAT MINUM OBAT TB - PUSKESMAS MEKAR JAYA*\n\nHalo *${p.name}*! Sekarang pukul *${p.schedule_time} WIB*, saatnya minum obat TB hari ke-*${p.current_day}* dari *${p.total_days}* hari.\n\n💊 *Dosis:* 3 Tablet FDC Kategori 1\n\nKetik balasan *"SUDAH"* jika sudah menelan obat hari ini. Semangat sembuh! ❤️`;

    state.whatsappLogs.push({
      id: state.whatsappLogs.length + 1,
      patient_id: p.id,
      phone_number: p.phone_number,
      direction: 'outgoing',
      message: reminderMsg,
      created_at: `${now.toISOString().split('T')[0]} ${timeStr}`
    });

    saveState(state);
    return {
      success: true,
      message: `Pesan pengingat dikirim ke ${p.name}`
    };
  }

  // 10. GET /api/whatsapp/logs
  if (pathname === '/api/whatsapp/logs' && method === 'GET') {
    return {
      success: true,
      data: state.whatsappLogs
    };
  }

  // 11. GET /api/articles
  if (pathname === '/api/articles' && method === 'GET') {
    const category = searchParams.get('category');
    let list = state.articles;
    if (category && category !== 'Semua') {
      list = list.filter(a => a.category === category);
    }
    return { success: true, data: list };
  }

  // 12. GET /api/consultations/:patientId
  const consultMatch = pathname.match(/^\/api\/consultations\/(\d+)$/);
  if (consultMatch && method === 'GET') {
    const patientId = parseInt(consultMatch[1]);
    const list = state.consultations.filter(c => c.patient_id === patientId);
    return { success: true, data: list };
  }

  // 13. POST /api/consultations
  if (pathname === '/api/consultations' && method === 'POST') {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
    const newChat = {
      id: state.consultations.length + 1,
      patient_id: body.patientId || 1,
      sender_role: body.senderRole || 'pasien',
      sender_name: body.senderName || 'Dika Pratama',
      message: body.message,
      category: body.category || 'umum',
      created_at: `${now.toISOString().split('T')[0]} ${timeStr}`
    };
    state.consultations.push(newChat);

    // Auto reply simulation for side-effects
    if (body.senderRole === 'pasien') {
      const lower = (body.message || '').toLowerCase();
      let autoReply = '';
      if (lower.includes('mual') || lower.includes('muntah')) {
        autoReply = 'Halo Mas Dika, Bu Sari di sini. Rasa mual sering muncul di minggu-minggu awal pengobatan. Cobalah minum obat bersama air putih hangat dan sedikit makanan padat seperti pisang atau biskuit gandum.';
      } else if (lower.includes('merah') || lower.includes('kencing') || lower.includes('urin')) {
        autoReply = 'Air seni kemerahan adalah tanda bahwa obat Rifampisin bekerja dengan baik di dalam tubuh dan sepenuhnya tidak berbahaya ya Mas Dika.';
      }

      if (autoReply) {
        setTimeout(() => {
          const s = getState();
          s.consultations.push({
            id: s.consultations.length + 1,
            patient_id: body.patientId || 1,
            sender_role: 'petugas',
            sender_name: 'Bu Sari, S.Kep (Perawat TB)',
            message: autoReply,
            category: 'keluhan_obat',
            created_at: `${now.toISOString().split('T')[0]} ${timeStr}`
          });
          saveState(s);
        }, 1200);
      }
    }

    saveState(state);
    return { success: true, data: newChat };
  }

  // 14. GET /api/reports/admin
  if (pathname === '/api/reports/admin' && method === 'GET') {
    const totalPatients = state.patients.length;
    const patuhCount = state.patients.filter(p => p.adherence_status === 'patuh').length;
    const tidakPatuhCount = state.patients.filter(p => p.adherence_status === 'tidak_patuh').length;
    const selesaiCount = state.patients.filter(p => p.current_day >= p.total_days).length;

    const lineChartData = [
      { date: '01 Okt', rate: 94 },
      { date: '04 Okt', rate: 92 },
      { date: '07 Okt', rate: 96 },
      { date: '10 Okt', rate: 89 },
      { date: '13 Okt', rate: 93 },
      { date: '16 Okt', rate: 95 },
      { date: '19 Okt', rate: 88 },
      { date: '21 Okt', rate: 91 },
      { date: '23 Okt', rate: 96 }
    ];

    const regionalData = [
      { region: 'Mekar Jaya Barat', total: 12, patuh: 11, rate: 92 },
      { region: 'Mekar Jaya Timur', total: 9, patuh: 8, rate: 89 },
      { region: 'Mekar Jaya Selatan', total: 14, patuh: 12, rate: 86 },
      { region: 'Mekar Jaya Utara', total: 8, patuh: 7, rate: 88 }
    ];

    return {
      success: true,
      data: {
        period: searchParams.get('period') || 'Okt 2026',
        metrics: {
          totalPatients,
          patuhCount,
          patuhPercentage: totalPatients > 0 ? Math.round((patuhCount / totalPatients) * 100) : 0,
          tidakPatuhCount,
          tidakPatuhPercentage: totalPatients > 0 ? Math.round((tidakPatuhCount / totalPatients) * 100) : 0,
          selesaiPengobatan: selesaiCount || 1,
          dalamPemantauan: totalPatients - (selesaiCount || 1)
        },
        lineChartData,
        regionalData
      }
    };
  }

  // Fallback
  return { success: true, message: 'OK' };
}

/**
 * Universal Fetch Interceptor for Static Hosting (GitHub Pages / Standalone)
 */
export function setupFetchInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;

    // Only intercept /api/ routes
    if (url.startsWith('/api') || url.includes('/api/')) {
      // If we are on github.io or express server is not responding, use in-browser mock backend
      const isGitHubPages = window.location.hostname.includes('github.io');

      if (isGitHubPages) {
        // Direct mock response on GitHub Pages
        const mockResult = await handleMockApiRequest(url, init);
        return new Response(JSON.stringify(mockResult), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // If local, attempt real fetch first, fallback to mock if backend offline
      try {
        const response = await originalFetch(input, init);
        if (response.ok) return response;
        // If 404 on static server
        if (response.status === 404) {
          const mockResult = await handleMockApiRequest(url, init);
          return new Response(JSON.stringify(mockResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return response;
      } catch (err) {
        // Network error (backend server offline) -> seamlessly use mock!
        const mockResult = await handleMockApiRequest(url, init);
        return new Response(JSON.stringify(mockResult), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return originalFetch(input, init);
  };

  console.log('[TB Monitor] Universal API Interceptor active (GitHub Pages & Local ready).');
}
