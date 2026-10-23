import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Search,
  ChevronRight,
  Bell,
  LogOut,
  UserCheck,
  Clock
} from 'lucide-react';
import DoctorScheduleModal from './DoctorScheduleModal';
import DoctorWarningModal from './DoctorWarningModal';

export default function Screen8_OfficerDashboard({
  currentUser,
  onSelectPatient,
  onOpenChat,
  onLogout
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [selectedPatientForSchedule, setSelectedPatientForSchedule] = useState(null);
  const [selectedPatientForWarning, setSelectedPatientForWarning] = useState(null);

  const officerName = currentUser?.name || 'Bu Sari';

  const patientsList = [
    {
      id: 1,
      name: 'Dika Pratama',
      dayCount: 12,
      totalDays: 180,
      status: 'patuh',
      statusLabel: 'Patuh',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      nik: '3201123456780001',
      noBpjs: '0001827364891',
      regimen: 'FDC 4KDT Kategori 1',
      doctor: 'dr. Sarah Anindita, Sp.KKLP'
    },
    {
      id: 2,
      name: 'Siti Aisyah',
      dayCount: 8,
      totalDays: 180,
      status: 'tidak-patuh',
      statusLabel: 'Tidak patuh',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      nik: '3201998877660002',
      noBpjs: '0002938475892',
      regimen: 'FDC 4KDT Kategori 1',
      doctor: 'dr. Sarah Anindita, Sp.KKLP'
    },
    {
      id: 3,
      name: 'Rudi Santoso',
      dayCount: 21,
      totalDays: 180,
      status: 'patuh',
      statusLabel: 'Patuh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      nik: '3201445566770003',
      noBpjs: '0003847596811',
      regimen: 'FDC 2KDT Kategori 1 Lanjutan',
      doctor: 'dr. Budi Setiawan'
    },
    {
      id: 4,
      name: 'Hj. Maryam',
      dayCount: 45,
      totalDays: 180,
      status: 'patuh',
      statusLabel: 'Patuh',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      nik: '3201778899000004',
      noBpjs: '0004859601923',
      regimen: 'FDC 2KDT Kategori 1 Lanjutan',
      doctor: 'dr. Sarah Anindita, Sp.KKLP'
    },
    {
      id: 5,
      name: 'Ahmad Fauzi',
      dayCount: 3,
      totalDays: 180,
      status: 'tidak-patuh',
      statusLabel: 'Tidak patuh',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      nik: '3201334455660005',
      noBpjs: '0005960712834',
      regimen: 'FDC 4KDT Kategori 1',
      doctor: 'dr. Sarah Anindita, Sp.KKLP'
    }
  ];

  const filteredPatients = patientsList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tb-screen-officer">
      {/* Header Greeting matching Mockup Screen 8 */}
      <div className="tb-officer-greeting-box">
        <div className="tb-officer-greeting-text">
          <h2>Selamat pagi, {officerName}</h2>
          <p>Puskesmas Mekar Jaya</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="tb-header-right-action has-badge"
            title="Notifikasi Masuk (3 Pasien Baru)"
            onClick={() => alert('Notifikasi: 1 pasien (Siti Aisyah) belum minum obat hari ini. Rekomendasi kontak via WhatsApp.')}
          >
            <Bell size={18} />
          </button>

          <button
            className="tb-header-right-action"
            onClick={onLogout}
            title="Keluar / Logout Akun Petugas"
          >
            <LogOut size={18} color="#dc2626" />
          </button>
        </div>
      </div>

      {/* 4 Summary Stats Cards (2x2 Grid) matching Mockup Screen 8 */}
      <div className="tb-stats-grid-2x2">
        {/* Total Pasien TB */}
        <div className="tb-stat-card">
          <div className="tb-stat-icon-box blue">
            <Users size={20} />
          </div>
          <div className="tb-stat-info">
            <span className="tb-stat-label">Total Pasien TB</span>
            <span className="tb-stat-val">48</span>
          </div>
        </div>

        {/* Patuh Obat */}
        <div className="tb-stat-card">
          <div className="tb-stat-icon-box green">
            <CheckCircle2 size={20} />
          </div>
          <div className="tb-stat-info">
            <span className="tb-stat-label">Patuh Obat</span>
            <span className="tb-stat-val" style={{ color: '#16a34a' }}>38 (79%)</span>
          </div>
        </div>

        {/* Tidak Patuh */}
        <div className="tb-stat-card">
          <div className="tb-stat-icon-box red">
            <AlertTriangle size={20} />
          </div>
          <div className="tb-stat-info">
            <span className="tb-stat-label">Tidak Patuh</span>
            <span className="tb-stat-val" style={{ color: '#dc2626' }}>10 (21%)</span>
          </div>
        </div>

        {/* Dalam Pemantauan */}
        <div className="tb-stat-card">
          <div className="tb-stat-icon-box purple">
            <Shield size={20} />
          </div>
          <div className="tb-stat-info">
            <span className="tb-stat-label">Dalam Pemantauan</span>
            <span className="tb-stat-val">48</span>
          </div>
        </div>
      </div>

      {/* Section: Daftar Pasien matching Mockup Screen 8 */}
      <div className="tb-section-heading-sm" style={{ marginBottom: 12 }}>
        Daftar Pasien
      </div>

      {/* Search Input */}
      <div className="tb-search-bar">
        <Search size={17} className="tb-search-icon" />
        <input
          type="text"
          className="tb-search-input"
          placeholder="Cari nama pasien..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Patient Rows List */}
      <div className="tb-patient-items-list">
        {filteredPatients.map((p) => (
          <div
            key={p.id}
            className="tb-patient-row-card"
            style={{ flexDirection: 'column', alignItems: 'stretch' }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => onSelectPatient(p)}
            >
              <img
                src={p.avatar}
                alt={p.name}
                className="tb-patient-row-avatar"
              />
              <div className="tb-patient-row-meta">
                <div className="tb-patient-row-name">{p.name}</div>
                <div className="tb-patient-row-sub">
                  <span>Hari ke-{p.dayCount}</span>
                  <span>•</span>
                  <span className={`tb-badge-pill-status ${p.status}`}>
                    {p.statusLabel}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} color="#94a3b8" />
            </div>

            {/* Doctor Actions Row: Atur Jam & Peringatkan */}
            <div className="tb-doctor-actions-row">
              <button
                type="button"
                className="tb-btn-doc-action primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPatientForSchedule(p);
                  setIsScheduleModalOpen(true);
                }}
                title="Tentukan jam berapa saja pasien harus minum obat"
              >
                <Clock size={14} />
                <span>Atur Jam Obat</span>
              </button>

              <button
                type="button"
                className="tb-btn-doc-action warning"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPatientForWarning(p);
                  setIsWarningModalOpen(true);
                }}
                title="Kirim peringatan/chat ke pasien atau keluarga"
              >
                <Bell size={14} />
                <span>Peringatkan / Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Atur Jadwal Obat oleh Dokter */}
      <DoctorScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        patient={selectedPatientForSchedule}
        doctorName={officerName}
        onScheduleSaved={() => {}}
      />

      {/* Modal Kirim Peringatan / Chat oleh Dokter */}
      <DoctorWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        patient={selectedPatientForWarning}
        doctorName={officerName}
        onWarningSent={() => {}}
      />
    </div>
  );
}
