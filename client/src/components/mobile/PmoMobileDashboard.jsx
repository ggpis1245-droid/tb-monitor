import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  ChevronRight,
  LogOut,
  Pill,
  Sparkles,
  Clock,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSimpusState, getPatientMedicineSchedule, dismissUrgentWarning } from '../../services/puskesmasState';

export default function PmoMobileDashboard({
  currentUser,
  onOpenCompliance,
  onOpenChat,
  onOpenEducation,
  onLogout
}) {
  const [hasAccompaniedToday, setHasAccompaniedToday] = useState(false);
  const [adverseModalOpen, setAdverseModalOpen] = useState(false);
  const [adverseNote, setAdverseNote] = useState('');
  const [adverseSubmitted, setAdverseSubmitted] = useState(false);
  const [activeWarnings, setActiveWarnings] = useState([]);
  const [schedule, setSchedule] = useState(() => getPatientMedicineSchedule(1));

  const loadData = () => {
    const state = getSimpusState();
    const warnings = (state.urgentWarnings || []).filter(
      (w) => (!w.target || w.target === 'pmo' || w.target === 'both') && !w.dismissed
    );
    setActiveWarnings(warnings);
    setSchedule(getPatientMedicineSchedule(1));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('simpus-state-changed', loadData);
    return () => window.removeEventListener('simpus-state-changed', loadData);
  }, []);

  const handleDismiss = (warnId, e) => {
    e.stopPropagation();
    dismissUrgentWarning(warnId);
    setActiveWarnings((prev) => prev.filter((w) => w.id !== warnId));
  };

  const handleAccompanyTaken = () => {
    if (!hasAccompaniedToday) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setHasAccompaniedToday(true);
    }
  };

  const handleSendAdverseReport = (e) => {
    e.preventDefault();
    if (!adverseNote.trim()) return;
    setAdverseSubmitted(true);
    setTimeout(() => {
      setAdverseSubmitted(false);
      setAdverseModalOpen(false);
      setAdverseNote('');
    }, 1500);
  };

  return (
    <div className="tb-screen-dashboard-pasien">
      {/* Header Greeting matching PMO Role */}
      <div className="tb-pasien-greeting-header">
        <div>
          <h2 className="tb-pasien-greeting-title">
            Halo, Ibu Ratna 👋
          </h2>
          <p className="tb-pasien-greeting-sub">
            Keluarga & PMO (Pengawas Menelan Obat)
          </p>
        </div>

        <button
          className="tb-header-right-action"
          onClick={onLogout}
          title="Keluar / Logout Akun PMO"
        >
          <LogOut size={18} color="#dc2626" />
        </button>
      </div>

      {/* Urgent Doctor Warning Banner (targeting PMO/Family) */}
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
              Buka Chat & Tanggapi Peringatan Dokter
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

      {/* Patient Monitored Hero Card */}
      <div className="tb-hero-progress-card" style={{ borderColor: '#bbf7d0' }}>
        <div className="tb-hero-card-header">
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: 8 }}>
              PASIEN TB DALAM PENGAWASAN
            </span>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              Dika Pratama
            </div>
          </div>
          <div className="tb-hero-card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Users size={18} />
          </div>
        </div>

        <div className="tb-hero-day-stat">
          Hari ke-12 dari 180 (Tahap Intensif)
        </div>

        <div className="tb-progress-track">
          <div className="tb-progress-fill" style={{ width: '6.7%', background: '#16a34a' }} />
        </div>

        {/* Doctor Schedule Pill */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 12px', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={15} color="#16a34a" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
              Jadwal Minum Obat: {schedule.times?.join(' & ')} WIB
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>
            {schedule.frequency}
          </span>
        </div>

        <div style={{ marginTop: 14 }}>
          <button
            className={`tb-btn-take-pill ${hasAccompaniedToday ? 'taken' : ''}`}
            onClick={handleAccompanyTaken}
            style={{ height: 46, fontSize: 14 }}
          >
            {hasAccompaniedToday ? (
              <>
                <CheckCircle2 size={18} />
                <span>Pasien Sudah Didampingi Minum Obat Hari Ini</span>
              </>
            ) : (
              <>
                <span>Dampingi Minum Obat Pagi Ini</span>
                <Sparkles size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* PMO Action Grid Menu */}
      <div className="tb-pasien-grid-menu">
        {/* 1. Riwayat Kepatuhan */}
        <div className="tb-grid-menu-card" onClick={onOpenCompliance}>
          <div className="tb-grid-menu-icon indigo">
            <Calendar size={22} />
          </div>
          <div className="tb-grid-menu-title">Riwayat Kepatuhan</div>
          <div className="tb-grid-menu-desc">Pantau kalender konsumsi obat Dika.</div>
        </div>

        {/* 2. Chat Petugas */}
        <div className="tb-grid-menu-card" onClick={onOpenChat}>
          <div className="tb-grid-menu-icon green">
            <MessageSquare size={22} />
          </div>
          <div className="tb-grid-menu-title">Chat Petugas</div>
          <div className="tb-grid-menu-desc">Konsultasi langsung ke Bu Sari.</div>
        </div>

        {/* 3. Pesan & Edukasi */}
        <div className="tb-grid-menu-card" onClick={onOpenEducation}>
          <div className="tb-grid-menu-icon purple">
            <BookOpen size={22} />
          </div>
          <div className="tb-grid-menu-title">Edukasi TB</div>
          <div className="tb-grid-menu-desc">Panduan PMO & nutrisi pasien.</div>
        </div>

        {/* 4. Lapor Kendala */}
        <div className="tb-grid-menu-card" onClick={() => setAdverseModalOpen(true)}>
          <div className="tb-grid-menu-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="tb-grid-menu-title">Lapor Kendala</div>
          <div className="tb-grid-menu-desc">Laporkan mual, ruam, atau keluhan.</div>
        </div>
      </div>

      {/* Modal Lapor Kendala */}
      {adverseModalOpen && (
        <div className="tb-modal-backdrop" onClick={() => setAdverseModalOpen(false)}>
          <div className="tb-bottom-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="tb-drawer-handle" />
            <h3 className="tb-drawer-title">Lapor Efek Samping / Kendala</h3>
            <p className="tb-drawer-sub">Laporan Anda akan langsung diteruskan ke petugas medis Puskesmas.</p>

            {adverseSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Laporan Berhasil Terkirim</h4>
                <p style={{ fontSize: 13, color: '#64748b' }}>Petugas Puskesmas akan segera merespons via chat atau telepon.</p>
              </div>
            ) : (
              <form onSubmit={handleSendAdverseReport}>
                <div className="tb-form-group">
                  <label className="tb-form-label">Deskripsi Kendala yang Dialami Pasien:</label>
                  <textarea
                    className="tb-input-field"
                    style={{ height: 80, padding: 12 }}
                    placeholder="Contoh: Pasien merasa mual setelah minum obat, nafsu makan sedikit berkurang..."
                    value={adverseNote}
                    onChange={(e) => setAdverseNote(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="tb-btn-primary">
                  <span>Kirim Laporan ke Puskesmas</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
