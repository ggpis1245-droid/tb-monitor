import React, { useState } from 'react';
import {
  Send,
  AlertTriangle,
  Bell,
  Users,
  User,
  X,
  CheckCircle2,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendDoctorWarning } from '../../services/puskesmasState';
import { playHospitalChime } from '../../services/soundEffects';

export default function DoctorWarningModal({
  isOpen,
  onClose,
  patient,
  doctorName = 'dr. Sarah Anindita, Sp.KKLP',
  onWarningSent
}) {
  if (!isOpen) return null;

  const currentPatientId = patient?.id || 1;
  const patientName = patient?.name || 'Dika Pratama';

  const [targetRecipient, setTargetRecipient] = useState('both'); // 'pasien', 'pmo', 'both'
  const [message, setMessage] = useState(
    'Halo Mas Dika & Ibu Ratna, jadwal minum obat TB Anda belum dicatat hari ini. Harap segera diminum dan dampingi agar pengobatan tidak terputus ya.'
  );
  const [urgency, setUrgency] = useState('high');
  const [sentSuccess, setSentSuccess] = useState(false);

  const templateList = [
    {
      id: 1,
      title: '⏰ Pengingat Minum Obat Harian',
      text: `Halo ${patientName}, jadwal minum obat TB Anda belum dicatat hari ini. Harap segera minum obat sesuai anjuran dan konfirmasi ya.`
    },
    {
      id: 2,
      title: '👨‍👩‍👦 Peringatan ke Keluarga / PMO',
      text: `Halo Ibu Ratna (PMO), mohon pastikan dan dampingi langsung ${patientName} untuk meminum obat TB 4KDT hari ini.`
    },
    {
      id: 3,
      title: '⚠️ Peringatan Kepatuhan (Bahaya Putus Obat)',
      text: `Peringatan Medis: Obat TB wajib diminum setiap hari tanpa putus agar kuman tidak menjadi kebal obat (TB RO). Mohon segera diminum.`
    },
    {
      id: 4,
      title: '💬 Evaluasi Keluhan / Jadwal Kontrol',
      text: `Halo ${patientName}, bagaimana kondisi fisik Anda hari ini? Jika rasa mual masih berlanjut, silakan datang kontrol ke Puskesmas besok pagi.`
    }
  ];

  const handleApplyTemplate = (tmpl) => {
    setMessage(tmpl.text);
    if (tmpl.id === 2) {
      setTargetRecipient('pmo');
    } else if (tmpl.id === 1) {
      setTargetRecipient('pasien');
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    playHospitalChime();
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });

    sendDoctorWarning({
      patientId: currentPatientId,
      target: targetRecipient,
      patientName,
      doctorName,
      message,
      urgency
    });

    setSentSuccess(true);
    if (onWarningSent) onWarningSent();

    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="tb-modal-backdrop" onClick={onClose}>
      <div className="tb-bottom-drawer" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="tb-drawer-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '3px 8px', borderRadius: 8 }}>
              PERINGATAN & KONSULTASI MEDIS
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              Kirim Peringatan / Chat
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b' }}>
              Dari: <strong>{doctorName}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={17} />
          </button>
        </div>

        {sentSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={46} color="#16a34a" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Peringatan Berhasil Terkirim!</h4>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Pesan telah masuk ke ruang Chat dan memunculkan banner peringatan di akun penerima.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            {/* 1. Pilih Target Penerima */}
            <div className="tb-form-group">
              <label className="tb-form-label">Kirim Peringatan / Pesan Kepada:</label>
              <div className="tb-recipient-segmented">
                <button
                  type="button"
                  className={`tb-recipient-btn ${targetRecipient === 'pasien' ? 'active' : ''}`}
                  onClick={() => setTargetRecipient('pasien')}
                >
                  <User size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Pasien ({patientName.split(' ')[0]})
                </button>

                <button
                  type="button"
                  className={`tb-recipient-btn ${targetRecipient === 'pmo' ? 'active' : ''}`}
                  onClick={() => setTargetRecipient('pmo')}
                >
                  <Users size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Keluarga / PMO (Ibu Ratna)
                </button>

                <button
                  type="button"
                  className={`tb-recipient-btn ${targetRecipient === 'both' ? 'active' : ''}`}
                  onClick={() => setTargetRecipient('both')}
                >
                  Keduanya (Pasien & PMO)
                </button>
              </div>
            </div>

            {/* 2. Template Pesan Cepat */}
            <div className="tb-form-group">
              <label className="tb-form-label">Pilih Template Pesan Siap Pakai:</label>
              <div className="tb-template-chips-wrap">
                {templateList.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="tb-template-chip"
                    onClick={() => handleApplyTemplate(tmpl)}
                  >
                    <strong>{tmpl.title}</strong>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                      {tmpl.text.substring(0, 75)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Isi Pesan */}
            <div className="tb-form-group">
              <label className="tb-form-label">Isi Pesan Peringatan Dokter:</label>
              <textarea
                className="tb-input-field"
                style={{ height: 85, padding: 12, lineHeight: 1.45 }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesan peringatan untuk pasien atau keluarga..."
                required
              />
            </div>

            <button
              type="submit"
              className="tb-btn-primary"
              style={{ background: '#ea580c', borderColor: '#ea580c' }}
            >
              <Send size={16} />
              <span>Kirim Peringatan Medis Sekarang</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
