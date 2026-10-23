import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  Pill,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playHospitalChime } from '../../services/soundEffects';
import { getPatientMedicineSchedule } from '../../services/puskesmasState';

export default function Screen4_MedicineReminder({
  onBack,
  onAdherenceUpdated,
  patientId = 1
}) {
  const [schedule, setSchedule] = useState(() => getPatientMedicineSchedule(patientId));
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [hasTakenToday, setHasTakenToday] = useState(false);
  const [takenTimestamp, setTakenTimestamp] = useState('08:00');
  const [showAllSchedulesModal, setShowAllSchedulesModal] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSchedule(getPatientMedicineSchedule(patientId));
    };
    window.addEventListener('simpus-state-changed', handleUpdate);
    return () => window.removeEventListener('simpus-state-changed', handleUpdate);
  }, [patientId]);

  const activeTime = schedule.times && schedule.times[selectedTimeIndex] ? schedule.times[selectedTimeIndex] : (schedule.times?.[0] || '08:00');

  const handleTakeMedicine = () => {
    if (!hasTakenToday) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      playHospitalChime();
      setHasTakenToday(true);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setTakenTimestamp(timeStr);
      if (onAdherenceUpdated) onAdherenceUpdated();
    }
  };

  return (
    <div className="tb-screen-reminder">
      {/* Top Header with Back Arrow */}
      <div className="tb-screen-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="tb-header-left">
          <button className="tb-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="tb-header-title">Pengingat Obat</h2>
        </div>
      </div>

      {/* Blue Notice Banner matching Mockup Screen 4 */}
      <div className="tb-reminder-notice-banner">
        <div className="tb-notice-bell-box">
          <Bell size={18} />
        </div>
        <div className="tb-notice-content">
          <h4>Jangan lupa minum obat!</h4>
          <p>
            Obat TB harus diminum secara teratur setiap hari sampai selesai pengobatan.
          </p>
        </div>
      </div>

      {/* Multiple Time Selectors (if doctor configured > 1 time per day) */}
      {schedule.times && schedule.times.length > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          {schedule.times.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedTimeIndex(idx)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: selectedTimeIndex === idx ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: selectedTimeIndex === idx ? '#eff6ff' : '#ffffff',
                color: selectedTimeIndex === idx ? '#1d4ed8' : '#64748b',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer'
              }}
            >
              Waktu ke-{idx + 1}: {t}
            </button>
          ))}
        </div>
      )}

      {/* Central Time & Pill Illustration */}
      <div className="tb-reminder-clock-wrap">
        <div className="tb-reminder-clock-time">{activeTime}</div>
        <div className="tb-reminder-clock-period">
          {schedule.times?.length > 1
            ? `Waktu ${selectedTimeIndex + 1} (${schedule.periodLabel})`
            : schedule.periodLabel}
        </div>

        <div className={`tb-big-pill-circle ${hasTakenToday ? 'already-taken' : ''}`}>
          <Pill size={44} />
        </div>
      </div>

      {/* Anjuran Dokter Card */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '10px 14px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Clock size={14} color="#2563eb" />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
            Petunjuk Dokter ({schedule.doctorName}):
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
          {schedule.instructions}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="tb-reminder-actions">
        <button
          className={`tb-btn-take-pill ${hasTakenToday ? 'taken' : ''}`}
          onClick={handleTakeMedicine}
        >
          {hasTakenToday ? (
            <>
              <CheckCircle2 size={20} />
              <span>Sudah Minum Hari Ini</span>
            </>
          ) : (
            <>
              <span>Sudah Minum ({activeTime})</span>
              <Sparkles size={18} />
            </>
          )}
        </button>

        <button
          className="tb-link-other-schedules"
          onClick={() => setShowAllSchedulesModal(true)}
        >
          Lihat jadwal lainnya
        </button>
      </div>

      {/* Section: Riwayat Hari Ini matching Mockup Screen 4 */}
      <div className="tb-reminder-today-history">
        <div className="tb-section-heading-sm">Riwayat hari ini</div>
        <div className="tb-history-item-row">
          <div className="tb-history-left">
            <CheckCircle2 size={18} />
            <span>{hasTakenToday ? takenTimestamp : activeTime} WIB - Obat diminum</span>
          </div>
          <ChevronRight size={18} color="#94a3b8" />
        </div>
      </div>

      {/* Modal Detail Jadwal Dokter */}
      {showAllSchedulesModal && (
        <div className="tb-modal-backdrop" onClick={() => setShowAllSchedulesModal(false)}>
          <div className="tb-bottom-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="tb-drawer-handle" />
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Jadwal Lengkap Minum Obat
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 14 }}>
              Ditetapkan oleh {schedule.doctorName} (Poli TB DOTS)
            </p>

            <div style={{ background: '#f8fafc', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>FREKUENSI:</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb' }}>{schedule.frequency}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>JAM MINUM:</span>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  {schedule.times?.map((t, i) => `${t} WIB (${i === 0 ? 'Pagi' : i === 1 ? 'Malam' : 'Siang'})`).join(' • ')}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>PAKET OBAT:</span>
                <div style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{schedule.regimen}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>PETUNJUK ANJURAN:</span>
                <div style={{ fontSize: 13, color: '#334155' }}>{schedule.instructions}</div>
              </div>
            </div>

            <button className="tb-btn-primary" onClick={() => setShowAllSchedulesModal(false)}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
