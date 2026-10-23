import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Calendar,
  ChevronRight,
  FileText,
  User,
  ShieldCheck,
  Pill,
  Clock,
  Bell,
  X
} from 'lucide-react';
import DoctorScheduleModal from './DoctorScheduleModal';
import DoctorWarningModal from './DoctorWarningModal';
import { getPatientMedicineSchedule } from '../../services/puskesmasState';

export default function Screen7_ComplianceTracking({
  onBack,
  patientData,
  currentUser
}) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState(() => getPatientMedicineSchedule(patientData?.id || 1));

  useEffect(() => {
    const handleUpdate = () => {
      setScheduleData(getPatientMedicineSchedule(patientData?.id || 1));
    };
    window.addEventListener('simpus-state-changed', handleUpdate);
    return () => window.removeEventListener('simpus-state-changed', handleUpdate);
  }, [patientData]);

  const currentPatient = patientData || {
    id: 1,
    name: 'Dika Pratama',
    roleTitle: 'Pasien TB',
    dayCount: 12,
    totalDays: 180,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    nik: '3201123456780001',
    noBpjs: '0001827364891',
    regimen: 'FDC 4KDT Kategori 1 (Rifampisin + Isoniazid + Pirazinamid + Etambutol)',
    doctor: 'dr. Sarah Anindita, Sp.KKLP'
  };

  const weekDays = [
    { day: 'Sen', num: 6, status: 'taken' },
    { day: 'Sel', num: 7, status: 'taken' },
    { day: 'Rab', num: 8, status: 'taken' },
    { day: 'Kam', num: 9, status: 'taken' },
    { day: 'Jum', num: 10, status: 'taken' },
    { day: 'Sab', num: 11, status: 'taken' },
    { day: 'Min', num: 12, status: 'taken' }
  ];

  return (
    <div className="tb-screen-compliance">
      {/* Header with Back Arrow matching Mockup Screen 7 */}
      <div className="tb-screen-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="tb-header-left">
          <button className="tb-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="tb-header-title">Riwayat Kepatuhan</h2>
        </div>
      </div>

      {/* Patient Profile Card matching Mockup Screen 7 */}
      <div className="tb-compliance-patient-card">
        <img
          src={currentPatient.avatar}
          alt={currentPatient.name}
          className="tb-compliance-avatar"
        />
        <div className="tb-compliance-patient-info">
          <h3>{currentPatient.name}</h3>
          <p>{currentPatient.roleTitle}</p>
          <p style={{ fontWeight: 700, color: '#2563eb', marginTop: 2 }}>
            Hari ke-{currentPatient.dayCount} dari {currentPatient.totalDays}
          </p>
        </div>
      </div>

      {/* 7-Day Day Strip (Sen - Min) matching Mockup Screen 7 */}
      <div className="tb-week-strip-box">
        <div className="tb-week-days-grid">
          {weekDays.map((d, idx) => (
            <div key={idx} className="tb-week-day-col">
              <span className="tb-week-day-name">{d.day}</span>
              <span className="tb-week-day-num">{d.num}</span>
              <div className={`tb-week-day-status-icon ${d.status}`}>
                {d.status === 'taken' && <Check size={14} strokeWidth={3} />}
                {d.status === 'missed' && <X size={14} strokeWidth={3} />}
                {d.status === 'empty' && '-'}
              </div>
            </div>
          ))}
        </div>

        {/* Legend matching Mockup Screen 7 */}
        <div className="tb-week-legend">
          <div className="tb-legend-item">
            <Check size={13} color="#16a34a" strokeWidth={3} />
            <span>Minum obat</span>
          </div>
          <div className="tb-legend-item">
            <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #dc2626', display: 'inline-block' }} />
            <span>Belum minum</span>
          </div>
          <div className="tb-legend-item">
            <span>- Tidak ada data</span>
          </div>
        </div>
      </div>

      {/* Catatan Dokter/Petugas matching Mockup Screen 7 */}
      <div className="tb-notes-card">
        <h4>Catatan</h4>
        <div className="tb-notes-date-tag">10 Okt 2026</div>
        <div className="tb-notes-text">
          Pasien mengeluh mual ringan. Diberikan saran: minum setelah makan.
        </div>
      </div>

      {/* Active Medicine Schedule by Doctor */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={16} color="#2563eb" />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#1e40af' }}>
              Jadwal Minum Obat Pasien
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '2px 8px', borderRadius: 10 }}>
            {scheduleData.frequency}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#1e293b', marginBottom: 4 }}>
          Jam: <strong style={{ color: '#2563eb', fontSize: 15 }}>{scheduleData.times.join(', ')} WIB</strong> ({scheduleData.periodLabel})
        </div>
        <div style={{ fontSize: 11.5, color: '#64748b' }}>
          Anjuran: {scheduleData.instructions}
        </div>
      </div>

      {/* Doctor Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <button
          type="button"
          className="tb-btn-doc-action primary"
          style={{ padding: '10px 12px', justifyContent: 'center' }}
          onClick={() => setIsScheduleModalOpen(true)}
          title="Tentukan jam berapa saja pasien harus minum obat"
        >
          <Clock size={15} />
          <span>Atur Jam Obat</span>
        </button>

        <button
          type="button"
          className="tb-btn-doc-action warning"
          style={{ padding: '10px 12px', justifyContent: 'center' }}
          onClick={() => setIsWarningModalOpen(true)}
          title="Kirim peringatan/chat ke pasien atau keluarga"
        >
          <Bell size={15} />
          <span>Peringatkan / Chat</span>
        </button>
      </div>

      {/* Button: Lihat Detail Pasien */}
      <button
        className="tb-btn-primary"
        onClick={() => setIsDetailModalOpen(true)}
      >
        <span>Lihat detail pasien</span>
        <ChevronRight size={18} />
      </button>

      {/* Modal Atur Jadwal Obat */}
      <DoctorScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        patient={currentPatient}
        doctorName={currentUser?.name || currentPatient.doctor}
        onScheduleSaved={(newSched) => setScheduleData(newSched)}
      />

      {/* Modal Peringatkan / Chat */}
      <DoctorWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        patient={currentPatient}
        doctorName={currentUser?.name || currentPatient.doctor}
        onWarningSent={() => {}}
      />

      {/* Detail Patient Modal */}
      {isDetailModalOpen && (
        <div className="tb-modal-backdrop" onClick={() => setIsDetailModalOpen(false)}>
          <div className="tb-bottom-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="tb-drawer-handle" />
            
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Detail Klinis Pasien TB
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Data terintegrasi SIMPus & Kemenkes SatuSehat
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>NAMA LENGKAP:</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{currentPatient.name}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>NIK / NO. BPJS:</span>
                <div style={{ fontSize: 13, color: '#334155' }}>{currentPatient.nik} • {currentPatient.noBpjs}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>REGIMEN OBAT PROGRAM:</span>
                <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>{currentPatient.regimen}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>DOKTER PENANGGUNG JAWAB:</span>
                <div style={{ fontSize: 13, color: '#334155' }}>{currentPatient.doctor}</div>
              </div>
            </div>

            <button
              className="tb-btn-primary"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
