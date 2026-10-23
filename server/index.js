const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initDatabase } = require('./db');
const {
  sendWhatsAppMessage,
  handleIncomingWebhook,
  createReminderMessage,
  gatewayConfig
} = require('./whatsappService');
const { scheduler } = require('./scheduler');

// Initialize database
initDatabase();

// Start cron scheduler
scheduler.start();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded/generated assets if any
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ==========================================
// 1. AUTH & ROLES
// ==========================================
app.get('/api/auth/roles', (req, res) => {
  try {
    const users = db.prepare(`SELECT id, username, name, role, phone_number, avatar_url FROM users`).all();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, role } = req.body;
    let user;
    if (username) {
      user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
    } else if (role) {
      user = db.prepare(`SELECT * FROM users WHERE role = ? LIMIT 1`).get(role);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    // If role is pasien or pmo, also attach patient record
    let patient = null;
    if (user.role === 'pasien') {
      patient = db.prepare(`SELECT * FROM patients WHERE user_id = ?`).get(user.id);
      if (!patient) {
        patient = db.prepare(`SELECT * FROM patients WHERE name LIKE ? LIMIT 1`).get(`%${user.name.split(' ')[0]}%`);
      }
    } else if (user.role === 'pmo') {
      patient = db.prepare(`SELECT * FROM patients WHERE pmo_name LIKE ? LIMIT 1`).get(`%Ratna%`);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          phone_number: user.phone_number,
          avatar_url: user.avatar_url
        },
        patient
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. PATIENT CRUD & SCHEDULES
// ==========================================
// Get all patients with filters & search
app.get('/api/patients', (req, res) => {
  try {
    const { search, status, phase } = req.query;
    let query = `SELECT * FROM patients WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR nik LIKE ? OR phone_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'all') {
      query += ` AND adherence_status = ?`;
      params.push(status);
    }

    if (phase && phase !== 'all') {
      query += ` AND phase = ?`;
      params.push(phase);
    }

    query += ` ORDER BY id ASC`;
    const patients = db.prepare(query).all(...params);

    // Calculate quick stats
    const totalCount = db.prepare(`SELECT COUNT(*) as count FROM patients`).get().count;
    const patuhCount = db.prepare(`SELECT COUNT(*) as count FROM patients WHERE adherence_status = 'patuh'`).get().count;
    const tidakPatuhCount = db.prepare(`SELECT COUNT(*) as count FROM patients WHERE adherence_status = 'tidak_patuh'`).get().count;
    const pantauCount = db.prepare(`SELECT COUNT(*) as count FROM patients WHERE adherence_status = 'dalam_pemantauan'`).get().count;

    res.json({
      success: true,
      data: patients,
      stats: {
        total: totalCount,
        patuh: patuhCount,
        patuhPercentage: totalCount > 0 ? Math.round((patuhCount / totalCount) * 100) : 0,
        tidakPatuh: tidakPatuhCount,
        tidakPatuhPercentage: totalCount > 0 ? Math.round((tidakPatuhCount / totalCount) * 100) : 0,
        dalamPemantauan: pantauCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single patient detail with schedule and recent logs
app.get('/api/patients/:id', (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = db.prepare(`SELECT * FROM patients WHERE id = ?`).get(patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
    }

    const schedules = db.prepare(`SELECT * FROM medication_schedules WHERE patient_id = ?`).all(patientId);
    const recentLogs = db.prepare(`
      SELECT * FROM adherence_logs
      WHERE patient_id = ?
      ORDER BY scheduled_date DESC
      LIMIT 14
    `).all(patientId);

    res.json({
      success: true,
      data: {
        ...patient,
        schedules,
        recentLogs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new TB Patient (Input Data & Jadwal oleh Petugas)
app.post('/api/patients', (req, res) => {
  try {
    const {
      name,
      nik,
      age,
      gender,
      phone_number,
      pmo_name,
      pmo_phone,
      pmo_relation,
      address,
      start_date,
      total_days = 180,
      phase = 'Intensif',
      medication_type = 'FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)',
      dosage_info = '3 Tablet FDC diminum 1 kali sehari',
      schedule_time = '08:00',
      notes = ''
    } = req.body;

    if (!name || !phone_number || !pmo_name || !pmo_phone || !start_date) {
      return res.status(400).json({ success: false, message: 'Harap lengkapi semua data wajib' });
    }

    // Insert patient
    const stmt = db.prepare(`
      INSERT INTO patients (
        nik, name, age, gender, phone_number, pmo_name, pmo_phone, pmo_relation,
        address, start_date, total_days, current_day, phase,
        medication_type, dosage_info, schedule_time, adherence_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 'patuh', ?)
    `);

    const result = stmt.run(
      nik || `3201${Date.now().toString().slice(-12)}`,
      name,
      parseInt(age) || 30,
      gender || 'L',
      phone_number,
      pmo_name,
      pmo_phone,
      pmo_relation || 'Keluarga',
      address || 'Alamat Belum Diisi',
      start_date,
      parseInt(total_days) || 180,
      phase,
      medication_type,
      dosage_info,
      schedule_time,
      notes
    );

    const newPatientId = result.lastInsertRowid;

    // Create medication schedule
    db.prepare(`
      INSERT INTO medication_schedules (patient_id, time_of_day, medicine_name, dosage, instructions)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      newPatientId,
      schedule_time,
      medication_type,
      dosage_info,
      'Diminum rutin setiap hari dengan air putih'
    );

    // Create initial welcome message in WhatsApp logs
    const welcomeMsg = `👋 *Selamat Datang di Sistem Pengingat Obat TB Puskesmas Mekar Jaya!*\n\nHalo *${name}*, Anda telah terdaftar dalam program pengobatan TB 180 hari. Jadwal minum obat harian Anda adalah pukul *${schedule_time} WIB*.\n\nSetiap hari kami akan mengirimkan pengingat otomatis. Anda cukup membalas *"SUDAH"* setelah selesai minum obat. Bersama kita tuntaskan pengobatan sampai sembuh total! 💙`;
    sendWhatsAppMessage({
      patientId: newPatientId,
      phoneNumber: phone_number,
      message: welcomeMsg,
      trigger: 'welcome_registration'
    });

    res.json({
      success: true,
      message: 'Data pasien TB berhasil didaftarkan!',
      data: { id: newPatientId, name }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update patient info
app.put('/api/patients/:id', (req, res) => {
  try {
    const patientId = req.params.id;
    const {
      name, nik, age, gender, phone_number, pmo_name, pmo_phone,
      pmo_relation, address, schedule_time, phase, medication_type,
      dosage_info, adherence_status, notes
    } = req.body;

    db.prepare(`
      UPDATE patients
      SET name = COALESCE(?, name),
          nik = COALESCE(?, nik),
          age = COALESCE(?, age),
          gender = COALESCE(?, gender),
          phone_number = COALESCE(?, phone_number),
          pmo_name = COALESCE(?, pmo_name),
          pmo_phone = COALESCE(?, pmo_phone),
          pmo_relation = COALESCE(?, pmo_relation),
          address = COALESCE(?, address),
          schedule_time = COALESCE(?, schedule_time),
          phase = COALESCE(?, phase),
          medication_type = COALESCE(?, medication_type),
          dosage_info = COALESCE(?, dosage_info),
          adherence_status = COALESCE(?, adherence_status),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(
      name, nik, age, gender, phone_number, pmo_name, pmo_phone,
      pmo_relation, address, schedule_time, phase, medication_type,
      dosage_info, adherence_status, notes, patientId
    );

    // Also update schedule time if provided
    if (schedule_time) {
      db.prepare(`
        UPDATE medication_schedules
        SET time_of_day = ?
        WHERE patient_id = ?
      `).run(schedule_time, patientId);
    }

    res.json({ success: true, message: 'Data pasien berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. ADHERENCE LOGS & TRACKING
// ==========================================
// Get adherence logs for patient with 7-day weekly calendar matrix (Senin - Minggu)
app.get('/api/patients/:id/adherence', (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = db.prepare(`SELECT * FROM patients WHERE id = ?`).get(patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
    }

    // Get weekly window: Monday to Sunday of current week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (dayOfWeek + 6) % 7; // days since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const weekDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const weeklyData = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Query log for this date
      const log = db.prepare(`
        SELECT * FROM adherence_logs
        WHERE patient_id = ? AND scheduled_date = ?
      `).get(patientId, dateStr);

      const isFuture = d > now && dateStr !== now.toISOString().split('T')[0];

      let status = 'tidak_ada_data';
      if (log) {
        status = log.status; // 'minum', 'belum_minum', 'tidak_ada_data'
      } else if (isFuture) {
        status = 'tidak_ada_data';
      }

      weeklyData.push({
        dayName: weekDays[i],
        date: dateStr,
        dayNum: d.getDate(),
        isToday: dateStr === now.toISOString().split('T')[0],
        isFuture,
        status, // 'minum', 'belum_minum', 'tidak_ada_data'
        log: log || null
      });
    }

    // All logs for full history
    const allLogs = db.prepare(`
      SELECT * FROM adherence_logs
      WHERE patient_id = ?
      ORDER BY scheduled_date DESC
    `).all(patientId);

    const totalDaysTaken = allLogs.filter(l => l.status === 'minum').length;

    res.json({
      success: true,
      data: {
        patient,
        weeklyData,
        allLogs,
        summary: {
          totalDays: patient.total_days,
          currentDay: patient.current_day,
          daysTaken: totalDaysTaken,
          adherenceRate: patient.current_day > 0 ? Math.round((totalDaysTaken / patient.current_day) * 100) : 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Patient clicks "Sudah Minum" button in App
app.post('/api/adherence/confirm', (req, res) => {
  try {
    const { patientId, notes = '' } = req.body;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const patient = db.prepare(`SELECT * FROM patients WHERE id = ?`).get(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
    }

    // Check if log exists for today
    const existing = db.prepare(`
      SELECT * FROM adherence_logs
      WHERE patient_id = ? AND scheduled_date = ?
    `).get(patientId, todayStr);

    if (existing) {
      db.prepare(`
        UPDATE adherence_logs
        SET status = 'minum',
            confirmed_at = CURRENT_TIMESTAMP,
            confirmation_method = 'app_button',
            notes = ?
        WHERE id = ?
      `).run(notes || 'Konfirmasi langsung melalui tombol aplikasi', existing.id);
    } else {
      db.prepare(`
        INSERT INTO adherence_logs (patient_id, scheduled_date, scheduled_time, confirmed_at, status, confirmation_method, notes)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'minum', 'app_button', ?)
      `).run(patientId, todayStr, patient.schedule_time || '08:00', notes || 'Konfirmasi langsung melalui tombol aplikasi');
    }

    // Update patient status to 'patuh'
    db.prepare(`UPDATE patients SET adherence_status = 'patuh' WHERE id = ?`).run(patientId);

    // Also send an automated confirmation message on WhatsApp log
    const confirmWaMsg = `✅ *Pencatatan Berhasil:* Anda telah mencatat minum obat hari ke-${patient.current_day} melalui Aplikasi pada pukul ${timeStr} WIB. Luar biasa!`;
    sendWhatsAppMessage({
      patientId: patient.id,
      phoneNumber: patient.phone_number,
      message: confirmWaMsg,
      trigger: 'app_button_confirmation'
    });

    res.json({
      success: true,
      message: 'Hebat! Obat hari ini berhasil dicatat diminum.',
      time: timeStr
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Petugas manually toggles or edits adherence log
app.post('/api/adherence/manual-override', (req, res) => {
  try {
    const { patientId, date, status, notes = 'Diperbarui manual oleh Petugas TB' } = req.body;
    const scheduleTime = '08:00';

    const existing = db.prepare(`
      SELECT * FROM adherence_logs
      WHERE patient_id = ? AND scheduled_date = ?
    `).get(patientId, date);

    if (existing) {
      db.prepare(`
        UPDATE adherence_logs
        SET status = ?,
            confirmation_method = 'manual_petugas',
            notes = ?
        WHERE id = ?
      `).run(status, notes, existing.id);
    } else {
      db.prepare(`
        INSERT INTO adherence_logs (patient_id, scheduled_date, scheduled_time, confirmed_at, status, confirmation_method, notes)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, 'manual_petugas', ?)
      `).run(patientId, date, scheduleTime, status, notes);
    }

    res.json({ success: true, message: 'Status kepatuhan berhasil diperbarui oleh petugas' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. WHATSAPP BOT INTEGRATION & WEBHOOK
// ==========================================
// Endpoint Webhook resmi (dipanggil oleh Fonnte / Twilio / Meta WA API / Simulator)
app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    // Accommodate multiple formats (Fonnte, Twilio, generic)
    const sender = req.body.sender || req.body.from || req.body.From || req.body.phoneNumber;
    const message = req.body.message || req.body.body || req.body.Body || req.body.text;

    if (!sender || !message) {
      return res.status(400).json({ success: false, message: 'Missing sender or message' });
    }

    const result = await handleIncomingWebhook({ sender, message });
    res.json(result);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Manual WhatsApp reminder trigger by Healthcare Staff (Petugas Puskesmas)
app.post('/api/whatsapp/send-reminder', async (req, res) => {
  try {
    const { patientId, customMessage } = req.body;
    const patient = db.prepare(`SELECT * FROM patients WHERE id = ?`).get(patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
    }

    const schedule = db.prepare(`SELECT * FROM medication_schedules WHERE patient_id = ? LIMIT 1`).get(patientId) || {};
    const message = customMessage || createReminderMessage(patient, schedule);

    const result = await sendWhatsAppMessage({
      patientId: patient.id,
      phoneNumber: patient.phone_number,
      message,
      trigger: 'manual_petugas_reminder'
    });

    res.json({
      success: true,
      message: `Pesan pengingat WhatsApp berhasil dikirim ke ${patient.name} (${patient.phone_number})`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch WhatsApp communication logs for simulator or audit
app.get('/api/whatsapp/logs', (req, res) => {
  try {
    const { patientId, limit = 50 } = req.query;
    let query = `
      SELECT w.*, p.name as patient_name
      FROM whatsapp_logs w
      LEFT JOIN patients p ON w.patient_id = p.id
    `;
    const params = [];

    if (patientId) {
      query += ` WHERE w.patient_id = ?`;
      params.push(patientId);
    }

    query += ` ORDER BY w.created_at ASC LIMIT ?`;
    params.push(parseInt(limit));

    const logs = db.prepare(query).all(...params);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. SCHEDULER & CRON CONTROL
// ==========================================
app.get('/api/scheduler/status', (req, res) => {
  res.json({ success: true, data: scheduler.getStatus() });
});

app.post('/api/scheduler/tick', async (req, res) => {
  try {
    const { timeOverride } = req.body;
    const result = await scheduler.runTick(timeOverride);
    res.json({ success: true, message: 'Cron job tick executed successfully', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. ARTICLES & EDUCATION
// ==========================================
app.get('/api/articles', (req, res) => {
  try {
    const { category } = req.query;
    let query = `SELECT * FROM articles`;
    const params = [];

    if (category && category !== 'Semua') {
      query += ` WHERE category = ?`;
      params.push(category);
    }

    query += ` ORDER BY published_date DESC`;
    const articles = db.prepare(query).all(...params);
    res.json({ success: true, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. CONSULTATIONS & REAL-TIME CHAT
// ==========================================
app.get('/api/consultations/:patientId', (req, res) => {
  try {
    const patientId = req.params.patientId;
    const messages = db.prepare(`
      SELECT * FROM consultations
      WHERE patient_id = ?
      ORDER BY created_at ASC
    `).all(patientId);

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/consultations', (req, res) => {
  try {
    const { patientId, senderRole, senderName, message, category = 'umum' } = req.body;

    if (!patientId || !message) {
      return res.status(400).json({ success: false, message: 'Data chat tidak lengkap' });
    }

    const stmt = db.prepare(`
      INSERT INTO consultations (patient_id, sender_role, sender_name, message, category)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(patientId, senderRole, senderName, message, category);

    // Auto-reply simulation if patient sends message and petugas is offline
    let autoReply = null;
    if (senderRole === 'pasien') {
      const lower = message.toLowerCase();
      let replyText = '';
      if (lower.includes('mual') || lower.includes('muntah')) {
        replyText = 'Halo Mas Dika, Bu Sari di sini. Rasa mual sering muncul di minggu-minggu awal pengobatan. Cobalah minum obat bersama air putih hangat dan sedikit makanan padat seperti pisang atau biskuit gandum. Jangan ragu hubungi kami jika mual berlanjut.';
      } else if (lower.includes('merah') || lower.includes('kencing') || lower.includes('urin')) {
        replyText = 'Air seni kemerahan adalah tanda bahwa obat Rifampisin bekerja dengan baik di dalam tubuh dan sepenuhnya tidak berbahaya ya Mas Dika.';
      }

      if (replyText) {
        setTimeout(() => {
          try {
            db.prepare(`
              INSERT INTO consultations (patient_id, sender_role, sender_name, message, category)
              VALUES (?, 'petugas', 'Bu Sari, S.Kep (Perawat TB)', ?, 'keluhan_obat')
            `).run(patientId, replyText);
          } catch (e) {
            console.error('Auto reply error:', e);
          }
        }, 1500);
      }
    }

    res.json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        patientId,
        senderRole,
        senderName,
        message,
        category,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 8. ADMIN PUSKESMAS DASHBOARD & REPORTS
// ==========================================
app.get('/api/reports/admin', (req, res) => {
  try {
    const { period = 'Okt 2026' } = req.query;

    const totalPatients = db.prepare(`SELECT COUNT(*) as count FROM patients`).get().count;
    const patuhCount = db.prepare(`SELECT COUNT(*) as count FROM patients WHERE adherence_status = 'patuh'`).get().count;
    const tidakPatuhCount = db.prepare(`SELECT COUNT(*) as count FROM patients WHERE adherence_status = 'tidak_patuh'`).get().count;
    const selesaiCount = db.prepare(`SELECT COUNT(*) as count FROM patients WHERE current_day >= total_days`).get().count;

    // Line chart data: Adherence rates across October dates
    // 01 Okt to 23 Okt 2026
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

    // Compliance by Wilayah / Kelurahan
    const regionalData = [
      { region: 'Mekar Jaya Barat', total: 12, patuh: 11, rate: 92 },
      { region: 'Mekar Jaya Timur', total: 9, patuh: 8, rate: 89 },
      { region: 'Mekar Jaya Selatan', total: 14, patuh: 12, rate: 86 },
      { region: 'Mekar Jaya Utara', total: 8, patuh: 7, rate: 88 }
    ];

    res.json({
      success: true,
      data: {
        period,
        metrics: {
          totalPatients,
          patuhCount,
          patuhPercentage: totalPatients > 0 ? Math.round((patuhCount / totalPatients) * 100) : 0,
          tidakPatuhCount,
          tidakPatuhPercentage: totalPatients > 0 ? Math.round((tidakPatuhCount / totalPatients) * 100) : 0,
          selesaiPengobatan: selesaiCount,
          dalamPemantauan: totalPatients - selesaiCount
        },
        lineChartData,
        regionalData
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`TB Monitoring & WhatsApp Bot Server running on http://localhost:${PORT}`);
});
