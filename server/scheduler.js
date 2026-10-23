/**
 * Automated Medication Reminder Scheduler & Cron Job
 * Handles scheduled WhatsApp reminders and compliance escalation
 */

const { db } = require('./db');
const {
  sendWhatsAppMessage,
  createReminderMessage,
  createPmoAlertMessage
} = require('./whatsappService');

class MedicationScheduler {
  constructor() {
    this.timer = null;
    this.intervalMs = 60 * 1000; // Check every 60 seconds
    this.isRunning = false;
    this.lastTickTime = null;
    this.stats = {
      remindersSent: 0,
      escalationsTriggered: 0,
      ticksRun: 0
    };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Scheduler] Automated TB Reminder Cron Job started (1-min interval).');

    // Run first tick immediately
    this.runTick();

    // Set recurring timer
    this.timer = setInterval(() => {
      this.runTick();
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[Scheduler] Cron Job stopped.');
  }

  /**
   * Run one scheduler evaluation cycle
   * Can also be called directly by POST /api/scheduler/tick for interactive testing
   */
  async runTick(manualOverrideTime = null) {
    this.stats.ticksRun++;
    const now = new Date();
    this.lastTickTime = now.toISOString();

    const todayStr = now.toISOString().split('T')[0];
    const currentHourMin = manualOverrideTime || now.toTimeString().split(' ')[0].slice(0, 5); // e.g. "08:00"

    const results = {
      evaluatedAt: this.lastTickTime,
      currentHourMin,
      remindersSent: [],
      escalations: []
    };

    try {
      // 1. Fetch all active patients
      const patients = db.prepare(`SELECT * FROM patients`).all();

      for (const patient of patients) {
        // Fetch schedules for patient
        const schedules = db.prepare(`
          SELECT * FROM medication_schedules
          WHERE patient_id = ? AND is_active = 1
        `).all(patient.id);

        for (const schedule of schedules) {
          // Check if schedule time matches current time or was due today
          const scheduleTime = schedule.time_of_day;

          // Check if already reminded or confirmed today
          const existingLog = db.prepare(`
            SELECT * FROM adherence_logs
            WHERE patient_id = ? AND scheduled_date = ? AND scheduled_time = ?
          `).get(patient.id, todayStr, scheduleTime);

          // If no log yet and time matches (or manual test)
          if (!existingLog && scheduleTime === currentHourMin) {
            // Create pending adherence log
            db.prepare(`
              INSERT INTO adherence_logs (patient_id, scheduled_date, scheduled_time, status, notes)
              VALUES (?, ?, ?, 'tidak_ada_data', 'Menunggu konfirmasi minum obat')
            `).run(patient.id, todayStr, scheduleTime);

            // Send WhatsApp reminder
            const message = createReminderMessage(patient, schedule);
            await sendWhatsAppMessage({
              patientId: patient.id,
              phoneNumber: patient.phone_number,
              message,
              trigger: 'automated_cron_reminder'
            });

            this.stats.remindersSent++;
            results.remindersSent.push({
              patientId: patient.id,
              patientName: patient.name,
              phone: patient.phone_number,
              scheduleTime
            });
          }
        }

        // 2. Escalation & Verification Check (Check unconfirmed logs past 2 hours)
        // If patient hasn't confirmed and time has passed, flag 'belum_minum' & alert PMO
        const pendingLogs = db.prepare(`
          SELECT * FROM adherence_logs
          WHERE patient_id = ? AND scheduled_date = ? AND status = 'tidak_ada_data'
        `).all(patient.id, todayStr);

        for (const pLog of pendingLogs) {
          // If schedule time was more than 2 hours ago (or flagged)
          const [sHour, sMin] = pLog.scheduled_time.split(':').map(Number);
          const [cHour, cMin] = currentHourMin.split(':').map(Number);
          const diffMinutes = (cHour * 60 + cMin) - (sHour * 60 + sMin);

          if (diffMinutes >= 120) { // 2 hours grace period
            // Mark as belum_minum
            db.prepare(`
              UPDATE adherence_logs
              SET status = 'belum_minum',
                  confirmation_method = 'system_timeout',
                  notes = 'Batas waktu 2 jam terlampaui tanpa konfirmasi'
              WHERE id = ?
            `).run(pLog.id);

            // Update patient adherence status to 'tidak_patuh'
            db.prepare(`
              UPDATE patients
              SET adherence_status = 'tidak_patuh'
              WHERE id = ?
            `).run(patient.id);

            // Send Escalation Alert to PMO
            const pmoAlert = createPmoAlertMessage(patient);
            await sendWhatsAppMessage({
              patientId: patient.id,
              phoneNumber: patient.pmo_phone,
              message: pmoAlert,
              trigger: 'pmo_escalation_alert'
            });

            this.stats.escalationsTriggered++;
            results.escalations.push({
              patientId: patient.id,
              patientName: patient.name,
              pmoName: patient.pmo_name,
              pmoPhone: patient.pmo_phone,
              reason: 'Overdue by > 2 hours without confirmation'
            });
          }
        }
      }

      return results;
    } catch (err) {
      console.error('[Scheduler Error]', err);
      return { error: err.message };
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      lastTickTime: this.lastTickTime,
      stats: this.stats
    };
  }
}

const schedulerInstance = new MedicationScheduler();

module.exports = {
  scheduler: schedulerInstance
};
