import React from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  User,
  HeartPulse,
  Pill
} from 'lucide-react';

export default function PrintResumeModal({ isOpen, onClose, record, patient }) {
  if (!isOpen || (!record && !patient)) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentPatient = patient || {
    name: record?.patientName || 'Dika Pratama',
    nik: record?.nik || '3201123456780001',
    noRm: record?.noRm || 'RM-2026-0814',
    gender: record?.gender || 'Laki-laki',
    age: record?.age || 24,
    phone_number: '+6281234567890',
    address: 'Jl. Anggrek No. 14, RW 04 Mekar Jaya'
  };

  return (
    <div className="simpus-modal-backdrop" onClick={onClose}>
      <div className="simpus-print-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Controls Bar (Hidden in Print) */}
        <div className="print-controls-bar no-print">
          <div className="print-ctrl-info">
            <ShieldCheck size={18} className="text-emerald" />
            <span>Dokumen Resmi Rekam Medis Elektronik (RME) Puskesmas Terpadu</span>
          </div>
          <div className="print-ctrl-actions">
            <button className="print-action-btn primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button className="print-action-btn secondary" onClick={onClose}>
              <X size={16} />
              <span>Tutup</span>
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="printable-medical-sheet">
          {/* Header Puskesmas */}
          <div className="kop-surat-puskesmas">
            <div className="kop-logo-box">
              <Building2 size={42} className="kop-icon" />
            </div>
            <div className="kop-text-box">
              <div className="kop-line-1">PEMERINTAH KABUPATEN BOGOR • DINAS KESEHATAN</div>
              <div className="kop-line-2">PUSKESMAS KECAMATAN MEKAR JAYA</div>
              <div className="kop-line-3">
                Jl. Raya Mekar Jaya No. 45, Kec. Mekar Jaya, Kode Pos 16911 • Telp: (021) 876-5432
              </div>
              <div className="kop-line-4">Email: info@puskesmas-mekarjaya.go.id • Faskes Tingkat 1 BPJS: 0112B004</div>
            </div>
          </div>
          <div className="kop-divider-double"></div>

          {/* Document Title */}
          <div className="doc-title-block">
            <h2 className="doc-main-title">RINGKASAN REKAM MEDIS ELEKTRONIK (RESUME MEDIS)</h2>
            <div className="doc-sub-code">No. Reg: {record?.id || 'RME-2026-1023'} • Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</div>
          </div>

          {/* Patient Bio Section */}
          <div className="doc-section">
            <div className="doc-section-title">I. IDENTITAS PASIEN</div>
            <div className="doc-grid-2">
              <div className="doc-field">
                <span className="field-label">Nama Lengkap:</span>
                <span className="field-value font-bold">{currentPatient.name}</span>
              </div>
              <div className="doc-field">
                <span className="field-label">No. Rekam Medis (RM):</span>
                <span className="field-value font-bold text-primary">{currentPatient.noRm || 'RM-2026-0814'}</span>
              </div>
              <div className="doc-field">
                <span className="field-label">NIK (KTP):</span>
                <span className="field-value">{currentPatient.nik}</span>
              </div>
              <div className="doc-field">
                <span className="field-label">No. Kartu BPJS:</span>
                <span className="field-value">{currentPatient.noBpjs || '0001827364891'}</span>
              </div>
              <div className="doc-field">
                <span className="field-label">Jenis Kelamin / Umur:</span>
                <span className="field-value">{currentPatient.gender || 'Laki-laki'} / {currentPatient.age || 24} Tahun</span>
              </div>
              <div className="doc-field">
                <span className="field-label">Alamat Domisili:</span>
                <span className="field-value">{currentPatient.address || 'Kecamatan Mekar Jaya'}</span>
              </div>
            </div>
          </div>

          {/* Examination Details */}
          <div className="doc-section">
            <div className="doc-section-title">II. HASIL PEMERIKSAAN KLINIS & TANDA VITAL</div>
            <div className="doc-vitals-strip">
              <div className="vital-cell">
                <span className="v-label">Tekanan Darah:</span>
                <span className="v-val">{record?.vitalSigns?.systolic || 118}/{record?.vitalSigns?.diastolic || 76} mmHg</span>
              </div>
              <div className="vital-cell">
                <span className="v-label">Frekuensi Nadi:</span>
                <span className="v-val">{record?.vitalSigns?.heartRate || 78} x/menit</span>
              </div>
              <div className="vital-cell">
                <span className="v-label">Suhu Tubuh:</span>
                <span className="v-val">{record?.vitalSigns?.temperature || 36.7} °C</span>
              </div>
              <div className="vital-cell">
                <span className="v-label">Frekuensi Nafas:</span>
                <span className="v-val">{record?.vitalSigns?.respiratoryRate || 18} x/menit</span>
              </div>
              <div className="vital-cell">
                <span className="v-label">Berat / Tinggi:</span>
                <span className="v-val">{record?.vitalSigns?.weight || 56} kg / {record?.vitalSigns?.height || 168} cm</span>
              </div>
              <div className="vital-cell">
                <span className="v-label">IMT (Status Gizi):</span>
                <span className="v-val font-bold text-primary">{record?.vitalSigns?.bmi || '19.8'} ({record?.vitalSigns?.bmiCategory || 'Normal'})</span>
              </div>
            </div>

            <div className="doc-anamnesis-box">
              <strong>Anamnesis / Keluhan Utama:</strong>
              <p>{record?.anamnesis || 'Pemeriksaan dan evaluasi rutin pengobatan TB Paru. Batuk berkurang, tidak ada sesak napas.'}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="doc-section">
            <div className="doc-section-title">III. DIAGNOSIS (KODE ICD-10)</div>
            <div className="doc-diagnosis-box">
              <div className="diag-row">
                <span className="diag-badge primary">Diagnosis Primer:</span>
                <span className="diag-text font-bold">{record?.primaryDiagnosis || 'A15.0 - Tuberkulosis Paru Terkonfirmasi Bakteriologis'}</span>
              </div>
              {record?.secondaryDiagnosis && record.secondaryDiagnosis !== '-' && (
                <div className="diag-row">
                  <span className="diag-badge secondary">Diagnosis Sekunder:</span>
                  <span className="diag-text">{record.secondaryDiagnosis}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prescriptions & Therapy */}
          <div className="doc-section">
            <div className="doc-section-title">IV. TERAPI & E-RESEP OBAT PUSKESMAS</div>
            <table className="doc-rx-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Obat & Dosis</th>
                  <th>Aturan Pakai (Signa)</th>
                  <th>Jumlah</th>
                  <th>Catatan Khusus</th>
                </tr>
              </thead>
              <tbody>
                {(record?.prescriptions || [
                  {
                    medicineName: 'Paket OAT 4KDT Kategori 1 (FDC Intensif)',
                    dosage: '3 Tablet sekali minum',
                    frequency: '1x sehari pagi hari',
                    quantity: 30,
                    instructions: 'Minum perut kosong 1 jam sebelum makan'
                  },
                  {
                    medicineName: 'Vitamin B6 10 mg',
                    dosage: '1 Tablet',
                    frequency: '1x sehari',
                    quantity: 30,
                    instructions: 'Pencegahan neuropati perifer'
                  }
                ]).map((rx, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td className="font-bold">{rx.medicineName}</td>
                    <td>{rx.frequency || rx.dosage}</td>
                    <td>{rx.quantity} Tablet</td>
                    <td>{rx.instructions || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="doc-signatures-grid">
            <div className="sig-column">
              <div className="sig-role">Pasien / Keluarga</div>
              <div className="sig-space"></div>
              <div className="sig-name">{currentPatient.name}</div>
              <div className="sig-nip">NIK: {currentPatient.nik}</div>
            </div>

            <div className="sig-column">
              <div className="sig-role">
                Mekar Jaya, {record?.visitDate || new Date().toISOString().split('T')[0]}<br />
                Dokter Penanggung Jawab Pelayanan (DPJP)
              </div>
              <div className="sig-stamp-box">
                <span className="cap-puskesmas-mock">PUSKESMAS MEKAR JAYA</span>
              </div>
              <div className="sig-name font-bold">{record?.doctorName || 'dr. Sarah Anindita, Sp.KKLP'}</div>
              <div className="sig-nip">NIP. 19880415 201403 2 004 • SIP: 446/182/DINKES/2022</div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="doc-footer-legal">
            Dokumen ini dihasilkan secara otomatis oleh Sistem Informasi Puskesmas Terpadu (SIMPus) dan sah tanpa tanda tangan basah berdasarkan UU ITE No. 11/2008 serta regulasi SatuSehat Kemenkes RI.
          </div>
        </div>
      </div>
    </div>
  );
}
