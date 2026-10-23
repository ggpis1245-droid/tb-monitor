import React, { useState } from 'react';
import { X, UserPlus, Calendar, Clock, Phone, Shield, FileText } from 'lucide-react';

export default function NewPatientModal({ isOpen, onClose, onPatientCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    age: '',
    gender: 'L',
    phone_number: '+628',
    pmo_name: '',
    pmo_phone: '+628',
    pmo_relation: 'Ibu Kandung',
    address: '',
    start_date: new Date().toISOString().split('T')[0],
    total_days: 180,
    phase: 'Intensif',
    medication_type: 'FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)',
    dosage_info: '3 Tablet FDC diminum 1 kali sehari sebelum makan',
    schedule_time: '08:00',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone_number || !formData.pmo_name || !formData.pmo_phone) {
      setError('Harap isi semua kolom wajib (Nama, No WA Pasien & PMO).');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        if (onPatientCreated) onPatientCreated(data.data);
        onClose();
      } else {
        setError(data.message || 'Gagal menambahkan pasien');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-backdrop" onClick={onClose}>
      <div
        className="modal-dialog-box"
        style={{ maxWidth: 620 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                Registrasi Pasien TB Baru
              </h3>
              <p style={{ fontSize: 11, color: '#64748b' }}>
                Program Pengobatan TB DOTS 180 Hari Puskesmas Mekar Jaya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} color="#64748b" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-content">
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 16
              }}>
                {error}
              </div>
            )}

            <div style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              1. Identitas Pasien
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="form-group-field">
                <label className="form-label">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input-text"
                  placeholder="Contoh: Dika Pratama"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="form-label">NIK Pasien</label>
                <input
                  type="text"
                  name="nik"
                  className="form-input-text"
                  placeholder="3201..."
                  value={formData.nik}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12 }}>
              <div className="form-group-field">
                <label className="form-label">Usia (Tahun)</label>
                <input
                  type="number"
                  name="age"
                  className="form-input-text"
                  placeholder="24"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group-field">
                <label className="form-label">Jenis Kelamin</label>
                <select
                  name="gender"
                  className="form-select-dropdown"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div className="form-group-field">
                <label className="form-label">Nomor WhatsApp Pasien *</label>
                <input
                  type="text"
                  name="phone_number"
                  className="form-input-text"
                  placeholder="+62 812..."
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group-field">
              <label className="form-label">Alamat Lengkap</label>
              <input
                type="text"
                name="address"
                className="form-input-text"
                placeholder="Jl. / RT / RW, Kelurahan"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div style={{ fontSize: 13, fontWeight: 800, color: '#0d9488', marginTop: 18, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              2. Data Pengawas Menelan Obat (PMO)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: 12 }}>
              <div className="form-group-field">
                <label className="form-label">Nama PMO / Keluarga *</label>
                <input
                  type="text"
                  name="pmo_name"
                  className="form-input-text"
                  placeholder="Contoh: Ibu Ratna"
                  value={formData.pmo_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="form-label">No WhatsApp PMO *</label>
                <input
                  type="text"
                  name="pmo_phone"
                  className="form-input-text"
                  placeholder="+62 813..."
                  value={formData.pmo_phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="form-label">Hubungan</label>
                <input
                  type="text"
                  name="pmo_relation"
                  className="form-input-text"
                  placeholder="Ibu / Suami"
                  value={formData.pmo_relation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 800, color: '#2563eb', marginTop: 18, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              3. Jadwal & Resep Obat TB (180 Hari)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group-field">
                <label className="form-label">Tanggal Mulai Pengobatan</label>
                <input
                  type="date"
                  name="start_date"
                  className="form-input-text"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="form-label">Jam Jadwal Minum Obat (WIB) *</label>
                <input
                  type="time"
                  name="schedule_time"
                  className="form-input-text"
                  value={formData.schedule_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group-field">
                <label className="form-label">Tahap Pengobatan</label>
                <select
                  name="phase"
                  className="form-select-dropdown"
                  value={formData.phase}
                  onChange={handleChange}
                >
                  <option value="Intensif">Fase Intensif (2 Bulan Pertama)</option>
                  <option value="Lanjutan">Fase Lanjutan (4 Bulan Terakhir)</option>
                </select>
              </div>

              <div className="form-group-field">
                <label className="form-label">Jenis Obat FDC</label>
                <select
                  name="medication_type"
                  className="form-select-dropdown"
                  value={formData.medication_type}
                  onChange={handleChange}
                >
                  <option value="FDC Kat 1 (Rifampisin, Isoniazid, Pirazinamid, Etambutol)">
                    FDC Kategori 1 (RHZE)
                  </option>
                  <option value="FDC Lanjutan (Rifampisin + Isoniazid)">
                    FDC Lanjutan (RH)
                  </option>
                  <option value="Obat TB Lepasan (Kombinasi Manual)">
                    Obat TB Lepasan
                  </option>
                </select>
              </div>
            </div>

            <div className="form-group-field">
              <label className="form-label">Catatan Tambahan Petugas</label>
              <textarea
                name="notes"
                className="form-textarea"
                rows="2"
                placeholder="Keluhan awal, riwayat alergi, petunjuk khusus..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer-bar">
            <button
              type="button"
              className="btn-outline-med"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary-med"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan & Aktifkan Bot WA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
