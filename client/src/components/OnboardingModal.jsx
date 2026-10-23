import React, { useState } from 'react';
import { Stethoscope, User, Users, ShieldCheck, Activity, ArrowRight, X } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, onSelectRole }) {
  const [activeTab, setActiveTab] = useState('onboarding'); // 'onboarding', 'login', 'register', 'role_select'
  const [selectedRole, setSelectedRole] = useState('pasien');

  if (!isOpen) return null;

  const roles = [
    {
      id: 'pasien',
      title: 'Pasien TB',
      desc: 'Pantau pengobatan dan terima pengingat obat.',
      icon: <Activity size={22} />,
      color: '#0284c7',
      user: 'Dika Pratama'
    },
    {
      id: 'pmo',
      title: 'Keluarga / PMO (Pengawas Menelan Obat)',
      desc: 'Dampingi dan bantu ingatkan pengobatan.',
      icon: <Users size={22} />,
      color: '#0d9488',
      user: 'Ibu Ratna'
    },
    {
      id: 'petugas',
      title: 'Petugas Kesehatan',
      desc: 'Kelola data pasien dan pemantauan harian.',
      icon: <Stethoscope size={22} />,
      color: '#2563eb',
      user: 'Bu Sari, S.Kep'
    },
    {
      id: 'admin',
      title: 'Admin Puskesmas',
      desc: 'Akses dashboard agregat dan laporan epidemiologi.',
      icon: <ShieldCheck size={22} />,
      color: '#7c3aed',
      user: 'Pak Bahrul, SKM'
    }
  ];

  return (
    <div className="modal-overlay-backdrop" onClick={onClose}>
      <div className="modal-dialog-box" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <X size={18} color="#64748b" />
          </button>

          {activeTab === 'onboarding' && (
            <div className="onboarding-screen" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
              <div className="lungs-illustration-wrapper">
                <img
                  src="/lungs_illustration.jpg"
                  alt="Ilustrasi Paru-Paru Medis Sehat"
                  className="lungs-illustration-img"
                  onError={(e) => {
                    // Fallback to a clean SVG lungs icon if image loading error
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              <div className="onboarding-badge">
                <Stethoscope size={14} /> Puskesmas Mekar Jaya • DOTS TB
              </div>

              <h2 className="onboarding-title">
                TBC Bisa Sembuh Jika Obat Diminum Rutin
              </h2>

              <p className="onboarding-subtitle">
                Dukungan digital untuk pengobatan TB yang lebih mudah dan terpantau dengan integrasi WhatsApp Pengingat Otomatis.
              </p>

              <div className="onboarding-action-buttons">
                <button
                  className="btn-primary-med"
                  onClick={() => setActiveTab('role_select')}
                >
                  Masuk Sekarang <ArrowRight size={18} />
                </button>
                <button
                  className="btn-outline-med"
                  onClick={() => setActiveTab('role_select')}
                >
                  Daftar Pasien Baru
                </button>
              </div>

              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                Program Eliminasi Tuberkulosis Nasional • Kemenkes RI
              </div>
            </div>
          )}

          {activeTab === 'role_select' && (
            <div style={{ padding: 24 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span className="onboarding-badge">Pilih Peran Pengguna</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 6, color: '#0f172a' }}>
                  Masuk Sebagai Apa Hari Ini?
                </h3>
                <p style={{ fontSize: 13, color: '#64748b' }}>
                  Pilih salah satu peran untuk mengakses dashboard khusus:
                </p>
              </div>

              <div className="role-selection-grid">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className={`role-card-item ${selectedRole === r.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(r.id)}
                  >
                    <div className="role-icon-box" style={{ background: `${r.color}15`, color: r.color }}>
                      {r.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="role-info-title">{r.title}</div>
                      <div className="role-info-desc">{r.desc}</div>
                      <div style={{ fontSize: 11, color: r.color, fontWeight: 700, marginTop: 4 }}>
                        Demo akun: {r.user}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                <button
                  className="btn-outline-med"
                  style={{ flex: 1 }}
                  onClick={() => setActiveTab('onboarding')}
                >
                  Kembali
                </button>
                <button
                  className="btn-primary-med"
                  style={{ flex: 2 }}
                  onClick={() => {
                    onSelectRole(selectedRole);
                    onClose();
                  }}
                >
                  Masuk ke Dashboard <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
