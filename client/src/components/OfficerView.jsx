import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Send,
  Calendar,
  Clock,
  Phone,
  Filter,
  Eye,
  RefreshCw,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

export default function OfficerView({
  onOpenNewPatient,
  onOpenWhatsAppSim,
  onSelectPatient,
  onRefreshTrigger
}) {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    patuh: 0,
    patuhPercentage: 0,
    tidakPatuh: 0,
    tidakPatuhPercentage: 0,
    dalamPemantauan: 0
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      let url = `/api/patients?search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPatients(data.data || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching patients for officer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, statusFilter, onRefreshTrigger]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Trigger WhatsApp reminder directly to patient
  const handleSendReminder = async (patient) => {
    try {
      const res = await fetch('/api/whatsapp/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Pengingat WhatsApp otomatis dikirim ke ${patient.name} (${patient.phone_number})`);
      }
    } catch (err) {
      console.error('Failed to send reminder:', err);
    }
  };

  // Manual verification toggle by officer
  const handleToggleAdherence = async (patient, newStatus) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await fetch('/api/adherence/manual-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          date: todayStr,
          status: newStatus,
          notes: `Diverifikasi langsung oleh Bu Sari (Petugas TB Puskesmas)`
        })
      });
      showToast(`Status kepatuhan ${patient.name} berhasil diubah.`);
      fetchPatients();
    } catch (err) {
      console.error('Failed to override adherence:', err);
    }
  };

  return (
    <div className="officer-dashboard-layout">
      {/* Officer Header with Quick Actions */}
      <div style={{
        background: '#ffffff',
        padding: '20px 24px',
        borderRadius: 20,
        border: '1px solid #e2e8f0',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Puskesmas Mekar Jaya • Unit TB DOTS
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
            Dashboard Petugas Kesehatan
          </h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Kelola data pasien TB, pantau status minum obat harian, dan kirim pengingat WhatsApp
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary-med"
            onClick={onOpenNewPatient}
          >
            <UserPlus size={16} /> Input Pasien TB Baru
          </button>
        </div>
      </div>

      {toastMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 700,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={18} color="#10b981" /> {toastMessage}
        </div>
      )}

      {/* Kartu Ringkasan Statistik */}
      <div className="stats-summary-grid">
        {/* Total Pasien TB */}
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-metric-value">{stats.total}</div>
            <div className="stat-metric-label">Total Pasien TB</div>
          </div>
        </div>

        {/* Patuh Obat */}
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-metric-value">
              {stats.patuh}
              <span className="stat-percentage-badge badge-green">
                {stats.patuhPercentage}%
              </span>
            </div>
            <div className="stat-metric-label">Patuh Obat</div>
          </div>
        </div>

        {/* Tidak Patuh */}
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <XCircle size={26} />
          </div>
          <div>
            <div className="stat-metric-value">
              {stats.tidakPatuh}
              <span className="stat-percentage-badge badge-red">
                {stats.tidakPatuhPercentage}%
              </span>
            </div>
            <div className="stat-metric-label">Tidak Patuh (Perlu Follow-up)</div>
          </div>
        </div>

        {/* Dalam Pemantauan */}
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Activity size={26} />
          </div>
          <div>
            <div className="stat-metric-value">{stats.dalamPemantauan}</div>
            <div className="stat-metric-label">Dalam Pemantauan Aktif</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="table-toolbar-box">
        <div className="search-input-wrapper">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Cari nama pasien, NIK, atau no WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Filter Status:</span>
          {['all', 'patuh', 'tidak_patuh'].map((st) => (
            <button
              key={st}
              className={`cat-pill-btn ${statusFilter === st ? 'active' : ''}`}
              style={{ padding: '6px 14px', fontSize: 12 }}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'all' ? 'Semua Status' : st === 'patuh' ? 'Patuh (Hijau)' : 'Tidak Patuh (Merah)'}
            </button>
          ))}
          <button
            onClick={fetchPatients}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '6px 10px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
            title="Refresh Data"
          >
            <RefreshCw size={14} color="#64748b" />
          </button>
        </div>
      </div>

      {/* Daftar Pasien TB */}
      <div className="patient-data-table-card">
        <table className="med-table">
          <thead>
            <tr>
              <th>Foto & Nama Pasien</th>
              <th>Hari Pengobatan</th>
              <th>Jadwal Minum</th>
              <th>Pengawas (PMO)</th>
              <th>Status Kepatuhan</th>
              <th>Aksi Pemantauan</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Tidak ada data pasien yang sesuai pencarian.
                </td>
              </tr>
            ) : (
              patients.map((p) => {
                const isPatuh = p.adherence_status === 'patuh';
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="patient-cell-profile">
                        <div className="patient-avatar-circle">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {p.age} th • {p.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        Hari ke-{p.current_day} dari {p.total_days}
                      </div>
                      <div style={{ fontSize: 11, color: '#0284c7' }}>
                        Fase {p.phase}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                        <Clock size={13} color="#0284c7" /> {p.schedule_time} WIB
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {p.dosage_info?.slice(0, 20)}...
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{p.pmo_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {p.pmo_relation} • {p.pmo_phone}
                      </div>
                    </td>

                    <td>
                      <span className={`status-badge-pill ${isPatuh ? 'patuh' : 'tidak_patuh'}`}>
                        {isPatuh ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {isPatuh ? 'Patuh' : 'Tidak Patuh'}
                      </span>
                    </td>

                    <td>
                      <div className="action-btn-row">
                        <button
                          className="btn-icon-action"
                          onClick={() => setSelectedPatientModal(p)}
                          title="Lihat Detail & Riwayat Lengkap"
                        >
                          <Eye size={14} /> Detail
                        </button>

                        <button
                          className="btn-icon-action"
                          style={{ color: '#059669', borderColor: '#a7f3d0' }}
                          onClick={() => handleSendReminder(p)}
                          title="Kirim Pesan Pengingat WhatsApp Sekarang"
                        >
                          <Send size={14} /> WA
                        </button>

                        {!isPatuh ? (
                          <button
                            className="btn-icon-action"
                            style={{ color: '#10b981', background: '#ecfdf5' }}
                            onClick={() => handleToggleAdherence(p, 'minum')}
                            title="Tandai Sudah Minum Manual"
                          >
                            ✓ Verifikasi
                          </button>
                        ) : (
                          <button
                            className="btn-icon-action"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleToggleAdherence(p, 'belum_minum')}
                            title="Tandai Belum Minum"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Detail Modal for Officer */}
      {selectedPatientModal && (
        <div className="modal-overlay-backdrop" onClick={() => setSelectedPatientModal(null)}>
          <div className="modal-dialog-box" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="patient-avatar-circle">
                  {selectedPatientModal.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>{selectedPatientModal.name}</h3>
                  <p style={{ fontSize: 11, color: '#64748b' }}>
                    NIK: {selectedPatientModal.nik} • {selectedPatientModal.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientModal(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginBottom: 16 }}>
                <div><strong>No WhatsApp:</strong> {selectedPatientModal.phone_number}</div>
                <div><strong>Alamat:</strong> {selectedPatientModal.address}</div>
                <div><strong>Pengawas (PMO):</strong> {selectedPatientModal.pmo_name} ({selectedPatientModal.pmo_relation})</div>
                <div><strong>No WhatsApp PMO:</strong> {selectedPatientModal.pmo_phone}</div>
                <div><strong>Tanggal Mulai:</strong> {selectedPatientModal.start_date}</div>
                <div><strong>Jadwal Minum:</strong> {selectedPatientModal.schedule_time} WIB</div>
                <div><strong>Fase TB:</strong> {selectedPatientModal.phase}</div>
                <div><strong>Obat:</strong> {selectedPatientModal.medication_type}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Catatan Klinis Pasien:</div>
                <div style={{ fontSize: 12, color: '#475569' }}>
                  {selectedPatientModal.notes || 'Tidak ada catatan klinis khusus.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-primary-med"
                  style={{ flex: 1 }}
                  onClick={() => {
                    handleSendReminder(selectedPatientModal);
                    setSelectedPatientModal(null);
                  }}
                >
                  <Send size={15} /> Kirim Pengingat WhatsApp
                </button>
                <button
                  className="btn-outline-med"
                  style={{ flex: 1 }}
                  onClick={() => {
                    if (onSelectPatient) onSelectPatient(selectedPatientModal);
                    setSelectedPatientModal(null);
                  }}
                >
                  Buka di Profil Pasien &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
