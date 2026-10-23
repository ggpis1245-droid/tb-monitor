import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Send,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function PmoView({ patient, onOpenWhatsAppSim, onRefreshData }) {
  const [adherenceData, setAdherenceData] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState([
    {
      id: 1,
      author: 'Bu Sari (Perawat TB Puskesmas)',
      date: '21 Okt 2026, 09:24',
      text: 'Pasien sempat mual ringan. Sudah diedukasi untuk minum obat dengan air hangat setelah biskuit. Urine merah wajar karena Rifampisin.'
    },
    {
      id: 2,
      author: 'Ibu Ratna (PMO)',
      date: '19 Okt 2026, 08:10',
      text: 'Dika minum obat tepat waktu setelah sarapan pisang. Nafsu makan mulai membaik.'
    }
  ]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [nudgeSuccess, setNudgeSuccess] = useState(false);

  const patientId = patient?.id || 1;

  const loadAdherence = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/adherence`);
      const data = await res.json();
      if (data.success) {
        setAdherenceData(data.data);
      }
    } catch (err) {
      console.error('Error fetching adherence for PMO:', err);
    }
  };

  useEffect(() => {
    loadAdherence();
  }, [patientId]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const item = {
      id: Date.now(),
      author: 'Ibu Ratna (PMO)',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      text: newNote
    };
    setNotesList([item, ...notesList]);
    setNewNote('');
  };

  const handleSendNudge = async () => {
    try {
      await fetch('/api/whatsapp/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          customMessage: `❤️ *Pesan dari PMO (Ibu Ratna):*\n\n"Halo Dika, jangan lupa minum obat TB hari ini ya nak. Ibu sudah siapkan air putih hangat di meja. Tetap semangat, kita tuntaskan sampai sembuh total!"`
        })
      });
      setNudgeSuccess(true);
      setTimeout(() => setNudgeSuccess(false), 4000);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to send PMO reminder:', err);
    }
  };

  const currentDay = patient?.current_day || 12;
  const totalDays = patient?.total_days || 180;
  const progressPercent = Math.min(100, Math.round((currentDay / totalDays) * 100));

  return (
    <div className="pmo-tracking-container">
      {/* PMO Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
        color: '#ffffff',
        padding: '20px 24px',
        borderRadius: 20,
        marginBottom: 20,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#ccfbf1', fontWeight: 600 }}>
          <UserCheck size={16} /> Portal Pengawas Menelan Obat (PMO)
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 4px' }}>
          Pemantauan Harian Pasien: {patient?.name || 'Dika Pratama'}
        </h2>
        <p style={{ fontSize: 13, color: '#e0f2fe', lineHeight: 1.4 }}>
          Dampingi dan pastikan pasien meminum obat setiap hari tanpa terputus selama 180 hari pengobatan.
        </p>
      </div>

      {/* Kartu Profil Pasien beserta Progres Hari Pengobatan */}
      <div className="pmo-patient-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="patient-avatar-circle" style={{ width: 50, height: 50, fontSize: 18 }}>
              {patient?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                {patient?.name || 'Dika Pratama'}
              </h3>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                24 Tahun • Laki-laki • Fase {patient?.phase || 'Intensif'}
              </div>
              <div style={{ fontSize: 11, color: '#0d9488', fontWeight: 700, marginTop: 2 }}>
                Status: {patient?.adherence_status === 'patuh' ? '✅ Kepatuhan Sangat Baik' : '⚠️ Perlu Perhatian Khusus'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-outline-med"
              style={{ padding: '8px 14px', fontSize: 12 }}
              onClick={() => setShowDetailModal(true)}
            >
              Lihat Detail Pasien
            </button>
            <button
              className="btn-primary-med"
              style={{ padding: '8px 16px', fontSize: 12, background: '#25d366' }}
              onClick={handleSendNudge}
            >
              <Send size={14} /> Ingatkan via WA
            </button>
          </div>
        </div>

        {nudgeSuccess && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 14
          }}>
            ✅ Pesan pengingat penuh perhatian dari PMO berhasil dikirim ke WhatsApp {patient?.name}!
          </div>
        )}

        {/* Progress Display */}
        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            <span>Progres Pengobatan TB</span>
            <span style={{ color: '#0284c7' }}>Hari ke-{currentDay} dari {totalDays}</span>
          </div>

          <div className="progress-track" style={{ height: 12 }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 6 }}>
            <span>Mulai: {patient?.start_date || '2026-10-12'}</span>
            <span>Target Selesai: 180 Hari Tuntas</span>
          </div>
        </div>
      </div>

      {/* Kalender Pemantauan Mingguan (Senin–Minggu) */}
      <div className="weekly-calendar-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
              Kalender Pemantauan Mingguan (Senin – Minggu)
            </h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Status visual harian minum obat minggu berjalan
            </p>
          </div>
          <span style={{
            background: '#e0f2fe',
            color: '#0284c7',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700
          }}>
            Jadwal: {patient?.schedule_time || '08:00'} WIB
          </span>
        </div>

        <div className="weekly-calendar-grid">
          {(adherenceData?.weeklyData || []).map((day, idx) => {
            let statusIcon = null;
            let statusClass = 'cal-status-nodata';

            if (day.status === 'minum') {
              statusClass = 'cal-status-minum';
              statusIcon = <CheckCircle2 size={16} />;
            } else if (day.status === 'belum_minum') {
              statusClass = 'cal-status-belum';
              statusIcon = <XCircle size={16} />;
            } else {
              statusClass = 'cal-status-nodata';
              statusIcon = <span style={{ fontSize: 14 }}>—</span>;
            }

            return (
              <div
                key={idx}
                className={`calendar-day-col ${day.isToday ? 'today' : ''}`}
              >
                <span className="cal-day-name">{day.dayName}</span>
                <span className="cal-day-num">{day.dayNum}</span>
                <div className={`cal-status-icon-box ${statusClass}`}>
                  {statusIcon}
                </div>
                {day.isToday && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                    Hari Ini
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="calendar-legend-row">
          <div className="legend-item">
            <div className="cal-status-icon-box cal-status-minum" style={{ width: 18, height: 18, fontSize: 10 }}>
              ✓
            </div>
            <span>Centang Hijau: Minum Obat</span>
          </div>

          <div className="legend-item">
            <div className="cal-status-icon-box cal-status-belum" style={{ width: 18, height: 18, fontSize: 10 }}>
              ✕
            </div>
            <span>Lingkaran Merah: Belum Minum</span>
          </div>

          <div className="legend-item">
            <div className="cal-status-icon-box cal-status-nodata" style={{ width: 18, height: 18, fontSize: 10 }}>
              —
            </div>
            <span>Strip Abu-abu: Tidak Ada Data</span>
          </div>
        </div>
      </div>

      {/* Bagian Catatan Medis & Keluhan Pasien */}
      <div className="medical-notes-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
              Catatan Medis & Perkembangan Pasien
            </h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Merekam keluhan pasien, efek samping obat, dan anjuran petugas kesehatan
            </p>
          </div>
          <FileText size={18} color="#0284c7" />
        </div>

        {/* Notes List */}
        <div style={{ marginBottom: 16 }}>
          {notesList.map((n) => (
            <div key={n.id} className="notes-entry-box">
              <div className="notes-author-time">
                <span>{n.author}</span>
                <span>{n.date}</span>
              </div>
              <div className="notes-body-text">{n.text}</div>
            </div>
          ))}
        </div>

        {/* Input New Note */}
        <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="chat-text-input"
            placeholder="Tambah catatan pemantauan harian oleh PMO..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button type="submit" className="btn-primary-med" style={{ padding: '8px 18px', fontSize: 13 }}>
            Simpan Catatan
          </button>
        </form>
      </div>

      {/* Detail Pasien Modal */}
      {showDetailModal && (
        <div className="modal-overlay-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Detail Lengkap Pasien TB</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div><strong>Nama:</strong> {patient?.name || 'Dika Pratama'}</div>
                <div><strong>NIK:</strong> {patient?.nik || '3201123456780001'}</div>
                <div><strong>Usia:</strong> {patient?.age || 24} Tahun</div>
                <div><strong>Jenis Kelamin:</strong> {patient?.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</div>
                <div><strong>No WA Pasien:</strong> {patient?.phone_number || '+62 812-3456-7890'}</div>
                <div><strong>Nama PMO:</strong> {patient?.pmo_name || 'Ibu Ratna'}</div>
                <div><strong>No WA PMO:</strong> {patient?.pmo_phone || '+62 813-9876-5432'}</div>
                <div><strong>Hubungan PMO:</strong> {patient?.pmo_relation || 'Ibu Kandung'}</div>
                <div><strong>Alamat:</strong> {patient?.address || 'Jl. Anggrek No. 14, Mekar Jaya'}</div>
                <div><strong>Faskes:</strong> {patient?.puskesmas_name || 'Puskesmas Mekar Jaya'}</div>
                <div><strong>Mulai Pengobatan:</strong> {patient?.start_date || '2026-10-12'}</div>
                <div><strong>Fase:</strong> {patient?.phase || 'Intensif'}</div>
              </div>

              <div style={{ marginTop: 16, background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 13 }}>
                <strong>Resep & Dosis Obat:</strong>
                <p style={{ marginTop: 4, color: '#334155' }}>
                  {patient?.medication_type || 'FDC Kat 1 (RHZE)'} — {patient?.dosage_info || '3 Tablet diminum 1x sehari'}
                </p>
              </div>
            </div>
            <div className="modal-footer-bar">
              <button className="btn-primary-med" onClick={() => setShowDetailModal(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
