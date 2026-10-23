import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Pill,
  BookOpen,
  ClipboardList,
  Headphones,
  LogOut,
  User,
  Heart,
  AlertTriangle,
  MessageSquare,
  X,
  Clock
} from 'lucide-react';
import { getSimpusState, getPatientMedicineSchedule, dismissUrgentWarning } from '../../services/puskesmasState';

export default function Screen3_PatientDashboard({
  currentUser,
  adherenceDay = 12,
  totalDays = 180,
  onOpenReminder,
  onOpenEducation,
  onOpenCompliance,
  onOpenChat,
  onLogout
}) {
  const patientId = currentUser?.id || 1;
  const patientName = currentUser?.name?.split(' ')[0] || 'Dika';
  const progressPercent = Math.round((adherenceDay / totalDays) * 100);

  const [activeWarnings, setActiveWarnings] = useState([]);
  const [schedule, setSchedule] = useState(() => getPatientMedicineSchedule(patientId));

  const loadData = () => {
    const state = getSimpusState();
    const warnings = (state.urgentWarnings || []).filter(
      (w) => (!w.target || w.target === 'pasien' || w.target === 'both') && !w.dismissed
    );
    setActiveWarnings(warnings);
    setSchedule(getPatientMedicineSchedule(patientId));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('simpus-state-changed', loadData);
    return () => window.removeEventListener('simpus-state-changed', loadData);
  }, [patientId]);

  const handleDismiss = (warnId, e) => {
    e.stopPropagation();
    dismissUrgentWarning(warnId);
    setActiveWarnings((prev) => prev.filter((w) => w.id !== warnId));
  };

  return (
    <div className="tb-screen-dashboard-pasien">
      {/* Header Greeting matching Mockup Screen 3 */}
      <div className="tb-pasien-greeting-header">
        <div>
          <h2 className="tb-pasien-greeting-title">
            Halo, {patientName} 👋
          </h2>
          <p className="tb-pasien-greeting-sub">
            Jangan lupa minum obat hari ini ya!
          </p>
        </div>

        <button
          className="tb-header-right-action"
          onClick={onLogout}
          title="Keluar / Logout Akun"
        >
          <LogOut size={18} color="#dc2626" />
        </button>
      </div>

      {/* Urgent Doctor Warning Banner (if doctor sent a warning) */}
      {activeWarnings.map((w) => (
        <div key={w.id} className="tb-urgent-warning-banner" onClick={onOpenChat} style={{ cursor: 'pointer' }}>
          <div className="tb-warning-icon-box">
            <AlertTriangle size={20} />
          </div>
          <div className="tb-warning-content">
            <div className="tb-warning-doctor-title">
              {w.doctorName || 'dr. Sarah Anindita (Dokter Puskesmas)'}
            </div>
            <div className="tb-warning-msg">
              "{w.message}"
            </div>
            <div className="tb-warning-action-link">
              <MessageSquare size={13} style={{ display: 'inline', marginRight: 4 }} />
              Buka Chat & Tanggapi Peringatan
            </div>
          </div>
          <button
            className="tb-warning-close-btn"
            onClick={(e) => handleDismiss(w.id, e)}
            title="Tutup banner peringatan"
          >
            <X size={15} />
          </button>
        </div>
      ))}

      {/* Main Hero Card: Pengobatan TB (Hari ke-12 dari 180) */}
      <div className="tb-hero-progress-card">
        <div className="tb-hero-card-header">
          <div className="tb-hero-card-title">Pengobatan TB</div>
          <div className="tb-hero-card-icon">
            <Calendar size={18} />
          </div>
        </div>

        <div className="tb-hero-day-stat">
          Hari ke-{adherenceDay} dari {totalDays}
        </div>

        <div className="tb-progress-track">
          <div
            className="tb-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="tb-hero-card-footer">
          Obat diminum {adherenceDay}/{totalDays} hari ({progressPercent}%)
        </div>
      </div>

      {/* 4 Touch Menu Grid Cards (2x2) matching Mockup Screen 3 */}
      <div className="tb-pasien-grid-menu">
        {/* 1. Pengingat Obat */}
        <div
          className="tb-grid-menu-card"
          onClick={onOpenReminder}
        >
          <div className="tb-grid-menu-icon blue">
            <Pill size={22} />
          </div>
          <div className="tb-grid-menu-title">Pengingat Obat</div>
          <div className="tb-grid-menu-desc">
            Jadwal: <strong style={{ color: '#2563eb' }}>{schedule.times?.join(', ')} WIB</strong> ({schedule.frequency})
          </div>
        </div>

        {/* 2. Pesan & Edukasi */}
        <div
          className="tb-grid-menu-card"
          onClick={onOpenEducation}
        >
          <div className="tb-grid-menu-icon purple">
            <BookOpen size={22} />
          </div>
          <div className="tb-grid-menu-title">Pesan & Edukasi</div>
          <div className="tb-grid-menu-desc">
            Informasi seputar TB
          </div>
        </div>

        {/* 3. Riwayat Minum Obat */}
        <div
          className="tb-grid-menu-card"
          onClick={onOpenCompliance}
        >
          <div className="tb-grid-menu-icon indigo">
            <ClipboardList size={22} />
          </div>
          <div className="tb-grid-menu-title">Riwayat Minum Obat</div>
          <div className="tb-grid-menu-desc">
            Lihat catatan harian
          </div>
        </div>

        {/* 4. Kontak Petugas */}
        <div
          className="tb-grid-menu-card"
          onClick={onOpenChat}
        >
          <div className="tb-grid-menu-icon green">
            <Headphones size={22} />
          </div>
          <div className="tb-grid-menu-title">Kontak Petugas</div>
          <div className="tb-grid-menu-desc">
            Hubungi jika ada keluhan
          </div>
        </div>
      </div>
    </div>
  );
}
