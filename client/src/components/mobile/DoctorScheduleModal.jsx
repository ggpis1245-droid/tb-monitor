import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Pill,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPatientMedicineSchedule, savePatientMedicineSchedule } from '../../services/puskesmasState';

export default function DoctorScheduleModal({
  isOpen,
  onClose,
  patient,
  doctorName = 'dr. Sarah Anindita, Sp.KKLP',
  onScheduleSaved
}) {
  if (!isOpen) return null;

  const currentPatientId = patient?.id || 1;
  const patientName = patient?.name || 'Dika Pratama';

  const existingSchedule = getPatientMedicineSchedule(currentPatientId);

  const [frequency, setFrequency] = useState(existingSchedule.frequency || '1x sehari');
  const [times, setTimes] = useState(existingSchedule.times || ['08:00']);
  const [periodLabel, setPeriodLabel] = useState(existingSchedule.periodLabel || 'Pagi');
  const [instructions, setInstructions] = useState(
    existingSchedule.instructions || 'Diminum 3 tablet sekaligus, 1 jam sebelum sarapan dengan air putih'
  );
  const [regimen, setRegimen] = useState(
    existingSchedule.regimen || 'FDC 4KDT Kategori 1 (Rifampisin + Isoniazid + Pirazinamid + Etambutol)'
  );
  const [successToast, setSuccessToast] = useState('');

  // Handle frequency change
  const handleFrequencySelect = (freq) => {
    setFrequency(freq);
    if (freq === '1x sehari') {
      setTimes(['08:00']);
      setPeriodLabel('Pagi');
    } else if (freq === '2x sehari') {
      setTimes(['08:00', '20:00']);
      setPeriodLabel('Pagi & Malam');
    } else if (freq === '3x sehari') {
      setTimes(['07:00', '13:00', '20:00']);
      setPeriodLabel('Pagi, Siang & Malam');
    }
  };

  const handleTimeChange = (index, newTime) => {
    const updated = [...times];
    updated[index] = newTime;
    setTimes(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const saved = savePatientMedicineSchedule(currentPatientId, {
      patientName,
      frequency,
      times,
      periodLabel,
      instructions,
      regimen,
      doctorName
    });

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    setSuccessToast(`Jadwal obat berhasil disimpan! Pasien akan menerima pengingat jam: ${times.join(', ')}.`);

    if (onScheduleSaved) onScheduleSaved(saved);

    setTimeout(() => {
      setSuccessToast('');
      onClose();
    }, 1500);
  };

  return (
    <div className="tb-modal-backdrop" onClick={onClose}>
      <div className="tb-bottom-drawer" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="tb-drawer-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: 8 }}>
              KONTROL DOKTER PUSKESMAS
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              Atur Jadwal Minum Obat
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b' }}>
              Pasien: <strong>{patientName}</strong> • {doctorName}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={17} />
          </button>
        </div>

        {successToast && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CheckCircle2 size={18} />
            <span>{successToast}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* 1. Pilih Frekuensi */}
          <div className="tb-form-group">
            <label className="tb-form-label">Frekuensi Minum Obat:</label>
            <div className="tb-frequency-grid">
              <button
                type="button"
                className={`tb-frequency-btn ${frequency === '1x sehari' ? 'active' : ''}`}
                onClick={() => handleFrequencySelect('1x sehari')}
              >
                1x Sehari (Pagi)
              </button>

              <button
                type="button"
                className={`tb-frequency-btn ${frequency === '2x sehari' ? 'active' : ''}`}
                onClick={() => handleFrequencySelect('2x sehari')}
              >
                2x Sehari (Pagi & Malam)
              </button>

              <button
                type="button"
                className={`tb-frequency-btn ${frequency === '3x sehari' ? 'active' : ''}`}
                onClick={() => handleFrequencySelect('3x sehari')}
              >
                3x Sehari (Tiap 8 Jam)
              </button>

              <button
                type="button"
                className={`tb-frequency-btn ${frequency === 'Kustom' ? 'active' : ''}`}
                onClick={() => setFrequency('Kustom')}
              >
                Jadwal Kustom
              </button>
            </div>
          </div>

          {/* 2. Jam Minum Obat (Time Pickers) */}
          <div className="tb-form-group">
            <label className="tb-form-label">
              Tentukan Jam Minum Obat ({times.length} Waktu):
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {times.map((t, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                      Waktu Ke-{idx + 1} ({idx === 0 ? 'Pagi' : idx === 1 ? 'Siang/Malam' : 'Malam'}):
                    </span>
                    <input
                      type="time"
                      value={t}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', padding: '4px 8px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>

                  {/* Quick Pill Buttons */}
                  <div className="tb-time-pills-row">
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Pilihan cepat:</span>
                    {idx === 0 && ['06:00', '07:00', '08:00', '09:00'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        className={`tb-time-pill-btn ${t === p ? 'active' : ''}`}
                        onClick={() => handleTimeChange(idx, p)}
                      >
                        {p}
                      </button>
                    ))}
                    {idx === 1 && ['18:00', '19:00', '20:00', '21:00'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        className={`tb-time-pill-btn ${t === p ? 'active' : ''}`}
                        onClick={() => handleTimeChange(idx, p)}
                      >
                        {p}
                      </button>
                    ))}
                    {idx === 2 && ['12:00', '13:00', '14:00'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        className={`tb-time-pill-btn ${t === p ? 'active' : ''}`}
                        onClick={() => handleTimeChange(idx, p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Regimen Paket Obat */}
          <div className="tb-form-group">
            <label className="tb-form-label">Regimen Paket Obat Program TB:</label>
            <input
              type="text"
              className="tb-input-field"
              value={regimen}
              onChange={(e) => setRegimen(e.target.value)}
              placeholder="Contoh: Paket OAT 4KDT (3 Tablet/hari)"
              required
            />
          </div>

          {/* 4. Anjuran & Petunjuk Khusus Dokter */}
          <div className="tb-form-group">
            <label className="tb-form-label">Anjuran & Petunjuk Khusus Dokter:</label>
            <textarea
              className="tb-input-field"
              style={{ height: 75, padding: 10 }}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Contoh: Diminum 3 tablet sekaligus 1 jam sebelum sarapan pagi. Hindari minum bersamaan dengan susu."
              required
            />
          </div>

          <button type="submit" className="tb-btn-primary" style={{ marginTop: 6 }}>
            <Save size={17} />
            <span>Simpan & Terapkan Jadwal ke Pasien</span>
          </button>
        </form>
      </div>
    </div>
  );
}
