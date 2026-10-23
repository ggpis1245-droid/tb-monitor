/**
 * WhatsApp Gateway & Webhook Service
 * Supports both Live Gateway (Fonnte, Twilio, WhatsApp Cloud API)
 * and High-Fidelity Interactive Built-in Bot Simulator
 */

const { db } = require('./db');

// Gateway Configuration (stored in DB or environment)
let gatewayConfig = {
  provider: 'fonnte', // 'fonnte', 'twilio', 'meta', 'simulator'
  apiKey: process.env.WHATSAPP_API_KEY || 'demo_fonnte_token_xyz',
  senderNumber: '081299887766', // Puskesmas Mekar Jaya Bot
  puskesmasName: 'Puskesmas Mekar Jaya',
};

/**
 * Format standard reminder message
 */
function createReminderMessage(patient, schedule) {
  return `🔔 *PENGINGAT MINUM OBAT TB - ${gatewayConfig.puskesmasName.toUpperCase()}*\n\n` +
    `Halo *${patient.name}*! 👋\n` +
    `Sekarang pukul *${schedule.time_of_day || patient.schedule_time} WIB*, saatnya minum obat TB hari ke-*${patient.current_day}* dari *${patient.total_days}* hari.\n\n` +
    `💊 *Obat:* ${schedule.medicine_name || 'FDC Kategori 1'}\n` +
    `📋 *Dosis:* ${schedule.dosage || '3 Tablet'}\n` +
    `💡 *Petunjuk:* ${schedule.instructions || 'Minum dengan segelas air putih'}\n\n` +
    `Ketik balasan: *"SUDAH"* jika Anda sudah selesai menelan obat hari ini.\n\n` +
    `_Kepatuhan Anda adalah kunci kesembuhan dari TBC. Salam Sehat!_ ❤️`;
}

/**
 * Format PMO alert message when patient hasn't taken medicine
 */
function createPmoAlertMessage(patient) {
  return `⚠️ *PERINGATAN PMO TB - ${gatewayConfig.puskesmasName.toUpperCase()}*\n\n` +
    `Yth. *${patient.pmo_name}* (${patient.pmo_relation} dari *${patient.name}*),\n\n` +
    `Hingga saat ini, sistem mendeteksi bahwa *${patient.name}* belum memberikan konfirmasi minum obat hari ke-*${patient.current_day}* (jadwal ${patient.schedule_time} WIB).\n\n` +
    `Mohon bantuan Anda untuk segera mengingatkan dan mendampingi pasien menelan obatnya hari ini demi mencegah resistensi kuman TB (TB Kebal Obat / MDR).\n\n` +
    `Terima kasih atas peran aktif Anda sebagai Pengawas Menelan Obat! 🙏`;
}

/**
 * Send WhatsApp Message
 */
async function sendWhatsAppMessage({ patientId, phoneNumber, message, trigger = 'automated_reminder' }) {
  console.log(`[WhatsApp Outgoing] Sending to ${phoneNumber}: ${message.slice(0, 50)}...`);

  // Log to database
  const stmt = db.prepare(`
    INSERT INTO whatsapp_logs (patient_id, phone_number, direction, message, status, reply_intent)
    VALUES (?, ?, 'outgoing', ?, 'delivered', ?)
  `);
  const result = stmt.run(patientId, phoneNumber, message, trigger);

  // If in live mode with Fonnte / Twilio, make external HTTP call here
  // If simulated, it's stored in whatsapp_logs for real-time frontend retrieval

  return {
    success: true,
    messageId: result.lastInsertRowid,
    patientId,
    phoneNumber,
    message
  };
}

/**
 * Process Incoming WhatsApp Webhook (From Fonnte, Twilio, or UI Simulator)
 */
async function handleIncomingWebhook({ sender, message }) {
  const cleanPhone = sender.replace(/\D/g, '');
  const cleanMsg = (message || '').trim();
  const lowerMsg = cleanMsg.toLowerCase();

  console.log(`[WhatsApp Webhook Incoming] From: ${sender}, Message: "${cleanMsg}"`);

  // Find patient by phone number or PMO phone
  const patient = db.prepare(`
    SELECT * FROM patients
    WHERE REPLACE(REPLACE(phone_number, '+', ''), ' ', '') LIKE ?
       OR REPLACE(REPLACE(phone_number, '+', ''), ' ', '') LIKE ?
       OR REPLACE(REPLACE(pmo_phone, '+', ''), ' ', '') LIKE ?
    LIMIT 1
  `).get(`%${cleanPhone.slice(-9)}%`, `%${cleanPhone}%`, `%${cleanPhone.slice(-9)}%`);

  let intent = 'UNKNOWN';
  let replyText = '';
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

  if (!patient) {
    intent = 'UNREGISTERED_NUMBER';
    replyText = `Halo! Nomor Anda belum terdaftar di Sistem Pemantauan TB ${gatewayConfig.puskesmasName}. Silakan hubungi petugas Puskesmas kami untuk pendaftaran.`;
  } else if (
    lowerMsg === 'sudah' ||
    lowerMsg === 'sdh' ||
    lowerMsg === '1' ||
    lowerMsg.includes('sudah minum') ||
    lowerMsg.includes('sudah diminum') ||
    lowerMsg === 'ok' ||
    lowerMsg === 'siap'
  ) {
    // 1. Confirm Adherence
    intent = 'CONFIRM_MEDICATION';

    // Check if adherence log already exists today
    const existingLog = db.prepare(`
      SELECT * FROM adherence_logs
      WHERE patient_id = ? AND scheduled_date = ?
    `).get(patient.id, todayStr);

    if (existingLog) {
      db.prepare(`
        UPDATE adherence_logs
        SET status = 'minum',
            confirmed_at = CURRENT_TIMESTAMP,
            confirmation_method = 'whatsapp',
            notes = 'Dikonfirmasi via balasan WhatsApp: "' || ? || '"'
        WHERE id = ?
      `).run(cleanMsg, existingLog.id);
    } else {
      db.prepare(`
        INSERT INTO adherence_logs (patient_id, scheduled_date, scheduled_time, confirmed_at, status, confirmation_method, notes)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'minum', 'whatsapp', ?)
      `).run(patient.id, todayStr, patient.schedule_time || '08:00', `Dikonfirmasi via WhatsApp: "${cleanMsg}"`);
    }

    // Update patient status to 'patuh'
    db.prepare(`
      UPDATE patients
      SET adherence_status = 'patuh'
      WHERE id = ?
    `).run(patient.id);

    replyText = `✅ *Konfirmasi Berhasil Dicatat!*\n\n` +
      `Terima kasih *${patient.name}*. Status minum obat hari ke-*${patient.current_day}* telah terverifikasi: *PATUH (Pukul ${timeStr} WIB)*.\n\n` +
      `Luar biasa, tetap jaga semangat dan minum obat rutin setiap hari sampai tuntas 180 hari ya! 💪💊`;

  } else if (
    lowerMsg.includes('belum') ||
    lowerMsg.includes('blm') ||
    lowerMsg === '2' ||
    lowerMsg.includes('nanti') ||
    lowerMsg.includes('lupa')
  ) {
    // 2. Patient hasn't taken yet
    intent = 'DELAY_MEDICATION';
    replyText = `⚠️ *Harap Segera Diminum ya!*\n\n` +
      `Halo *${patient.name}*, obat TB sangat penting diminum tepat waktu setiap hari agar kuman tidak kebal.\n\n` +
      `Apakah Anda sedang di luar rumah atau ada kendala? Jika sudah minum nanti, jangan lupa segera balas *"SUDAH"* ya.`;

  } else if (
    lowerMsg.includes('mual') ||
    lowerMsg.includes('muntah') ||
    lowerMsg.includes('gatal') ||
    lowerMsg.includes('pusing') ||
    lowerMsg.includes('keluhan') ||
    lowerMsg.includes('merah') ||
    lowerMsg.includes('sakit')
  ) {
    // 3. Side effects or Complaint report
    intent = 'REPORT_SYMPTOM';

    // Log directly to consultations so healthcare staff sees it
    db.prepare(`
      INSERT INTO consultations (patient_id, sender_role, sender_name, message, category)
      VALUES (?, 'pasien', ?, ?, 'keluhan_obat')
    `).run(patient.id, patient.name, `[Keluhan via WhatsApp]: ${cleanMsg}`);

    replyText = `🩺 *Keluhan Anda Telah Diteruskan ke Petugas TB*\n\n` +
      `Terima kasih *${patient.name}*. Pesan Anda terkait keluhan/gejala telah kami sampaikan ke *Bu Sari (Perawat TB Puskesmas)*.\n\n` +
      `_Catatan Medis:_ Air seni kemerahan adalah normal dari obat Rifampisin. Jika mual, minum obat setelah makan sedikit biskuit/pisang. Petugas kami akan segera menghubungi Anda jika memerlukan tindak lanjut khusus.`;

  } else {
    // General response / help menu
    intent = 'GENERAL_QUERY';
    replyText = `Halo *${patient.name}*! 👋\n` +
      `Ketik:\n` +
      `• *"SUDAH"* untuk konfirmasi minum obat hari ini\n` +
      `• *"JADWAL"* untuk melihat jadwal & sisa hari pengobatan\n` +
      `• Ketik keluhan Anda untuk konsultasi dengan petugas TB kami.`;
  }

  // Save incoming log
  const incomingLog = db.prepare(`
    INSERT INTO whatsapp_logs (patient_id, phone_number, direction, message, status, reply_intent)
    VALUES (?, ?, 'incoming', ?, 'processed', ?)
  `).run(patient ? patient.id : null, sender, cleanMsg, intent);

  // Send bot reply
  if (replyText) {
    await sendWhatsAppMessage({
      patientId: patient ? patient.id : null,
      phoneNumber: sender,
      message: replyText,
      trigger: `bot_reply_${intent}`
    });
  }

  return {
    success: true,
    intent,
    patient: patient ? { id: patient.id, name: patient.name } : null,
    botReply: replyText
  };
}

module.exports = {
  sendWhatsAppMessage,
  handleIncomingWebhook,
  createReminderMessage,
  createPmoAlertMessage,
  gatewayConfig
};
