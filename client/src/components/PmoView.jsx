import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Phone,
  AlertTriangle,
  Send,
  Pill,
  Activity,
  HeartPulse,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  FileText
} from 'lucide-react';
import {
  getSimpusState,
  logPmoDailyCompliance,
  submitPmoAdverseReport
} from '../services/puskesmasState';

export default function PmoView({ onOpenWhatsAppSim }) {
  const [activeTab, setActiveTab] = useState('daftar_pasien'); // 'daftar_pasien', 'checklist_harian', 'lapor_kendala'
  const [simpusState, setSimpusState] = useState(getSimpusState());

  // Checklist Form State
  const [checklistPatientId, setChecklistPatientId] = useState(1);
  const [complianceStatus, setComplianceStatus] = useState('minum'); // 'minum', 'belum', 'mangkir'
  const [takenTime, setTakenTime] = useState('08:00');
  const [checklistNotes, setChecklistNotes] = useState('Pasien minum obat tepat waktu didampingi langsung. Nafsu makan baik.');

  // Adverse Report Form State
  const [adversePatientId, setAdversePatientId] = useState(1);
  const [adverseCategory, setAdverseCategory] = useState('Efek Samping Sedang: Mual Berulang & Ruam Kulit');
  const [adverseSeverity, setAdverseSeverity] = useState('sedang'); // 'rendah', 'sedang', 'darurat'
  const [adverseDescription, setAdverseDescription] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    const handleStateChange = () => {
      setSimpusState(getSimpusState());
    };
    window.addEventListener('simpus-state-changed', handleStateChange);
    return () => window.removeEventListener('simpus-state-changed', handleStateChange);
  }, []);

  const patientsList = simpusState.pmoPatients || [];

  // Metrics
  const totalMonitored = patientsList.length;
  const sudahMinumHariIni = patientsList.filter(
    (p) => p.todayStatus === 'sudah_minum'
  ).length;
  const belumMinumHariIni = patientsList.filter(
    (p) => p.todayStatus === 'belum_minum'
  ).length;
  const mangkirHariIni = patientsList.filter(
    (p) => p.todayStatus === 'mangkir'
  ).length;
  const averageAdherence = totalMonitored > 0
    ? Math.round(patientsList.reduce((acc, curr) => acc + curr.adherenceScore, 0) / totalMonitored)
    : 0;

  // Handle Checklist Submit
  const handleChecklistSubmit = (e) => {
    e.preventDefault();
    const targetPatient = patientsList.find((p) => p.id === Number(checklistPatientId));

    logPmoDailyCompliance({
      patientId: Number(checklistPatientId),
      status: complianceStatus,
      takenTime: `${takenTime} WIB`,
      notes: checklistNotes
    });

    if (complianceStatus === 'minum') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      triggerToast(`Berhasil mencatat kepatuhan: ${targetPatient?.name} (STATUS: PATUH MINUM OBAT)`);
    } else if (complianceStatus === 'mangkir') {
      triggerToast(`Peringatan: Pasien ${targetPatient?.name} tercatat MANGKIR. Nakes Puskesmas telah dinotifikasi!`);
    } else {
      triggerToast(`Status pasien ${targetPatient?.name} diperbarui.`);
    }

    setChecklistNotes('');
  };

  // Handle Adverse Report Submit
  const handleAdverseSubmit = (e) => {
    e.preventDefault();
    if (!adverseDescription.trim()) {
      alert('Harap isi deskripsi kendala / efek samping yang dialami pasien.');
      return;
    }

    const targetPatient = patientsList.find((p) => p.id === Number(adversePatientId));

    submitPmoAdverseReport({
      patientId: Number(adversePatientId),
      patientName: targetPatient?.name || 'Dika Pratama',
      category: adverseCategory,
      severity: adverseSeverity,
      description: adverseDescription
    });

    triggerToast('🚨 Laporan kendala berhasil dikirim langsung ke Petugas Puskesmas!');
    setAdverseDescription('');
    setActiveTab('lapor_kendala');
  };

  return (
    <div className="pmo-portal-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="officer-floating-toast">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Profile PMO */}
      <section className="pmo-header-banner">
        <div className="pmo-header-info">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
            alt="Ibu Ratna"
            className="pmo-head-avatar"
          />
          <div>
            <div className="pmo-head-badge">
              <ShieldCheck size={13} /> KADER PMO RESMI PUSKESMAS MEKAR JAYA
            </div>
            <h1 className="pmo-head-title">Dashboard Pengawas Menelan Obat (PMO)</h1>
            <p className="pmo-head-sub">
              Ibu Ratna • Wilayah RW 04 Mekar Jaya • Memantau Pasien Program DOTS Tuberkulosis & Penyakit Kronis
            </p>
          </div>
        </div>

        <div className="pmo-head-adherence-gauge">
          <div className="pmo-big-gauge-num">{averageAdherence}%</div>
          <div className="pmo-gauge-lbl">Rata-rata Kepatuhan Binaan</div>
        </div>
      </section>

      {/* Overview Stats Metric Bar */}
      <section className="pmo-stats-bar-grid">
        <div className="pmo-stat-box bg-blue-subtle">
          <div className="pmo-stat-icon">
            <Users size={22} className="text-primary" />
          </div>
          <div>
            <div className="pmo-stat-val">{totalMonitored} Orang</div>
            <div className="pmo-stat-desc">Total Pasien Binaan PMO</div>
          </div>
        </div>

        <div className="pmo-stat-box bg-emerald-subtle">
          <div className="pmo-stat-icon">
            <CheckCircle2 size={22} className="text-emerald" />
          </div>
          <div>
            <div className="pmo-stat-val">{sudahMinumHariIni} Pasien</div>
            <div className="pmo-stat-desc">Sudah Minum Obat Hari Ini</div>
          </div>
        </div>

        <div className="pmo-stat-box bg-amber-subtle">
          <div className="pmo-stat-icon">
            <Clock size={22} className="text-amber-500" />
          </div>
          <div>
            <div className="pmo-stat-val">{belumMinumHariIni} Pasien</div>
            <div className="pmo-stat-desc">Belum Minum / Perlu Diingatkan</div>
          </div>
        </div>

        <div className="pmo-stat-box bg-rose-subtle">
          <div className="pmo-stat-icon">
            <AlertTriangle size={22} className="text-rose-500" />
          </div>
          <div>
            <div className="pmo-stat-val">{mangkirHariIni} Pasien</div>
            <div className="pmo-stat-desc">Mangkir / Perlu Kunjungan Rumah</div>
          </div>
        </div>
      </section>

      {/* PMO Navigation Tabs */}
      <nav className="pmo-subnav-tabs">
        <button
          className={`pmo-tab-btn ${activeTab === 'daftar_pasien' ? 'active' : ''}`}
          onClick={() => setActiveTab('daftar_pasien')}
        >
          <Users size={16} />
          <span>1. Daftar Pasien di Bawah Pengawasan</span>
        </button>

        <button
          className={`pmo-tab-btn ${activeTab === 'checklist_harian' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist_harian')}
        >
          <CheckCircle2 size={16} />
          <span>2. Checklist / Laporan Harian Minum Obat</span>
        </button>

        <button
          className={`pmo-tab-btn ${activeTab === 'lapor_kendala' ? 'active' : ''}`}
          onClick={() => setActiveTab('lapor_kendala')}
        >
          <AlertCircle size={16} />
          <span>3. Lapor Kendala & Efek Samping ke Dokter</span>
          {simpusState.adverseReports.length > 0 && (
            <span className="tab-pill-badge">{simpusState.adverseReports.length}</span>
          )}
        </button>
      </nav>

      {/* ==============================================================
          TAB 1: DAFTAR PASIEN DI BAWAH PENGAWASAN
          ============================================================== */}
      {activeTab === 'daftar_pasien' && (
        <div className="pmo-tab-content">
          <div className="section-head-flex">
            <div>
              <h2 className="section-main-heading">Daftar Pasien Binaan Aktif</h2>
              <p className="section-sub-heading">
                Pantau riwayat kepatuhan 7 hari terakhir, fase pengobatan, serta hubungi pasien bila jadwal minum obat terlewat.
              </p>
            </div>
            <button className="btn-sim-wa-trigger" onClick={onOpenWhatsAppSim}>
              <MessageSquare size={16} />
              <span>Buka Simulator Bot WhatsApp</span>
            </button>
          </div>

          <div className="pmo-patient-cards-grid">
            {patientsList.map((p) => {
              const isTodayDone = p.todayStatus === 'sudah_minum';
              const isTodayMissed = p.todayStatus === 'mangkir';

              return (
                <div key={p.id} className="pmo-patient-card">
                  <div className="pmo-card-top">
                    <div>
                      <span className="pmo-card-no-rm">{p.noRm}</span>
                      <h3 className="pmo-card-name">{p.name}</h3>
                      <div className="pmo-card-diag">{p.diagnosis}</div>
                    </div>
                    <div className="pmo-card-adherence-badge">
                      <span className="adherence-big-text">{p.adherenceScore}%</span>
                      <span className="adherence-sub-label">Kepatuhan</span>
                    </div>
                  </div>

                  <div className="pmo-phase-progress-box">
                    <div className="phase-row-label">
                      <span>{p.phase}</span>
                      <strong>Hari ke-{p.dayNumber} dari {p.totalDays}</strong>
                    </div>
                    <div className="progress-track-custom">
                      <div
                        className="progress-fill-custom"
                        style={{ width: `${Math.round((p.dayNumber / p.totalDays) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pmo-card-details-list">
                    <div className="detail-line">
                      <Pill size={14} className="text-primary" />
                      <span>{p.regimen}</span>
                    </div>
                    <div className="detail-line">
                      <Clock size={14} className="text-amber-500" />
                      <span>Jadwal Harian: <strong>{p.scheduleTime}</strong></span>
                    </div>
                    <div className="detail-line">
                      <Phone size={14} className="text-emerald" />
                      <span>{p.phone} ({p.address})</span>
                    </div>
                  </div>

                  {/* 7-Day Adherence Dots */}
                  <div className="pmo-week-dots-section">
                    <span className="week-dots-title">Status 7 Hari Terakhir:</span>
                    <div className="week-dots-row">
                      {p.recentWeek.map((status, idx) => (
                        <div
                          key={idx}
                          className={`week-dot status-${status}`}
                          title={`Hari H-${6 - idx}: ${status.toUpperCase()}`}
                        >
                          {status === 'minum' ? '✓' : status === 'mangkir' ? '✕' : '-'}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pmo-card-footer-actions">
                    <div className="today-badge-col">
                      {isTodayDone ? (
                        <span className="today-done-chip">
                          <CheckCircle2 size={13} /> Hari ini: Sudah Minum ({p.lastTakenTime})
                        </span>
                      ) : isTodayMissed ? (
                        <span className="today-missed-chip">
                          <AlertTriangle size={13} /> Hari ini: MANGKIR
                        </span>
                      ) : (
                        <span className="today-pending-chip">
                          <Clock size={13} /> Hari ini: Belum Konfirmasi
                        </span>
                      )}
                    </div>

                    <div className="footer-btn-group">
                      <button
                        className="btn-pmo-verify"
                        onClick={() => {
                          setChecklistPatientId(p.id);
                          setActiveTab('checklist_harian');
                        }}
                      >
                        Verifikasi
                      </button>

                      <button
                        className="btn-pmo-report-problem"
                        onClick={() => {
                          setAdversePatientId(p.id);
                          setActiveTab('lapor_kendala');
                        }}
                        title="Lapor Efek Samping / Kendala"
                      >
                        Lapor Kendala
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: CHECKLIST & LAPORAN HARIAN STATUS MINUM OBAT
          ============================================================== */}
      {activeTab === 'checklist_harian' && (
        <div className="pmo-tab-content">
          <div className="section-head-flex">
            <div>
              <h2 className="section-main-heading">Checklist & Laporan Harian Pengawasan Minum Obat</h2>
              <p className="section-sub-heading">
                Catat konfirmasi pendampingan minum obat secara langsung atau melalui verifikasi keluarga hari ini.
              </p>
            </div>
          </div>

          <div className="pmo-checklist-form-card simpus-card">
            <form onSubmit={handleChecklistSubmit} className="pmo-form-layout">
              <div className="form-grid-3">
                <div className="form-item-wrap">
                  <label className="form-field-lbl">1. Pilih Pasien Binaan</label>
                  <select
                    className="custom-form-ctrl font-bold"
                    value={checklistPatientId}
                    onChange={(e) => setChecklistPatientId(e.target.value)}
                  >
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.diagnosis} • {p.phase})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">2. Tanggal Pengawasan</label>
                  <input
                    type="date"
                    className="custom-form-ctrl"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">3. Jam Minum Obat Aktual</label>
                  <input
                    type="time"
                    className="custom-form-ctrl font-bold"
                    value={takenTime}
                    onChange={(e) => setTakenTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Status Radio Pills */}
              <div className="form-item-wrap" style={{ marginTop: '16px' }}>
                <label className="form-field-lbl">4. Status Pengawasan Hari Ini:</label>
                <div className="status-radio-pills-row">
                  <label
                    className={`status-radio-card ${complianceStatus === 'minum' ? 'selected green' : ''}`}
                    onClick={() => setComplianceStatus('minum')}
                  >
                    <input
                      type="radio"
                      name="comp_status"
                      checked={complianceStatus === 'minum'}
                      onChange={() => setComplianceStatus('minum')}
                    />
                    <div>
                      <div className="radio-card-title">✓ Sudah Minum Obat (Didampingi)</div>
                      <div className="radio-card-desc">Pasien menelan obat secara lengkap di depan PMO/Keluarga</div>
                    </div>
                  </label>

                  <label
                    className={`status-radio-card ${complianceStatus === 'belum' ? 'selected amber' : ''}`}
                    onClick={() => setComplianceStatus('belum')}
                  >
                    <input
                      type="radio"
                      name="comp_status"
                      checked={complianceStatus === 'belum'}
                      onChange={() => setComplianceStatus('belum')}
                    />
                    <div>
                      <div className="radio-card-title">⏳ Belum Minum / Ditunda Sementara</div>
                      <div className="radio-card-desc">Pasien berhalangan / menunda karena mual atau aktivitas</div>
                    </div>
                  </label>

                  <label
                    className={`status-radio-card ${complianceStatus === 'mangkir' ? 'selected red' : ''}`}
                    onClick={() => setComplianceStatus('mangkir')}
                  >
                    <input
                      type="radio"
                      name="comp_status"
                      checked={complianceStatus === 'mangkir'}
                      onChange={() => setComplianceStatus('mangkir')}
                    />
                    <div>
                      <div className="radio-card-title">✕ Menolak / Mangkir (Drop-out Risk)</div>
                      <div className="radio-card-desc">Pasien sengaja menolak minum obat / tidak dapat dihubungi</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="form-item-wrap" style={{ marginTop: '16px' }}>
                <label className="form-field-lbl">5. Catatan Pemantauan PMO (Kondisi Makan & Efek Samping Ringan):</label>
                <textarea
                  rows="3"
                  className="custom-form-ctrl"
                  value={checklistNotes}
                  onChange={(e) => setChecklistNotes(e.target.value)}
                  placeholder="Contoh: Pasien sempat mengeluh perut agak perih, disarankan minum bersama biskuit. Kencing merah wajar imbas rifampisin..."
                />
              </div>

              <div className="pmo-form-submit-row">
                <button type="submit" className="btn-save-compliance-record">
                  <CheckCircle2 size={18} />
                  <span>Simpan Laporan Harian PMO</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: LAPOR KENDALA & EFEK SAMPING KE DOKTER PUSKESMAS
          ============================================================== */}
      {activeTab === 'lapor_kendala' && (
        <div className="pmo-tab-content">
          <div className="section-head-flex">
            <div>
              <h2 className="section-main-heading">Lapor Kendala & Efek Samping Obat ke Dokter Puskesmas</h2>
              <p className="section-sub-heading">
                Kirim pengaduan cepat bila pasien mengalami efek samping berat, alergi, atau menolak minum obat. Laporan langsung muncul di dasbor Petugas Puskesmas.
              </p>
            </div>
          </div>

          <div className="simpus-card" style={{ marginBottom: '24px' }}>
            <form onSubmit={handleAdverseSubmit} className="pmo-form-layout">
              <div className="form-grid-3">
                <div className="form-item-wrap">
                  <label className="form-field-lbl">1. Pasien yang Mengalami Kendala</label>
                  <select
                    className="custom-form-ctrl font-bold"
                    value={adversePatientId}
                    onChange={(e) => setAdversePatientId(e.target.value)}
                  >
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.diagnosis})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">2. Kategori Efek Samping / Kendala</label>
                  <select
                    className="custom-form-ctrl font-bold"
                    value={adverseCategory}
                    onChange={(e) => setAdverseCategory(e.target.value)}
                  >
                    <option value="Efek Samping Sedang: Mual Berulang & Ruam Kulit">
                      Efek Samping Sedang: Mual Berulang & Ruam Kulit
                    </option>
                    <option value="Efek Samping Berat: Mata / Kulit Menguning (Ikterus Hepatitis)">
                      Efek Samping Berat: Mata / Kulit Menguning (Ikterus / Hepatitis Imbas Obat)
                    </option>
                    <option value="Efek Samping Berat: Gatal Hebat Seluruh Tubuh / Alergi">
                      Efek Samping Berat: Gatal Hebat Seluruh Tubuh / Alergi
                    </option>
                    <option value="Efek Samping Berat: Gangguan Pendengaran / Penglihatan">
                      Efek Samping Berat: Gangguan Pendengaran / Penglihatan
                    </option>
                    <option value="Pasien Menolak Minum Obat / Ingin Menghentikan Terapi">
                      Pasien Menolak Minum Obat / Ingin Menghentikan Terapi
                    </option>
                    <option value="Pasien Pindah Alamat / Hilang Kontak">
                      Pasien Pindah Alamat / Hilang Kontak
                    </option>
                  </select>
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">3. Tingkat Urgensi</label>
                  <select
                    className="custom-form-ctrl font-bold text-rose-600"
                    value={adverseSeverity}
                    onChange={(e) => setAdverseSeverity(e.target.value)}
                  >
                    <option value="rendah">Urgensi Rendah (Dapat menunggu kontrol reguler)</option>
                    <option value="sedang">Urgensi Sedang (Perlu arahan nakes dalam 24 jam)</option>
                    <option value="darurat">🚨 DARURAT (Perlu rujukan / pemeriksaan segera hari ini)</option>
                  </select>
                </div>
              </div>

              <div className="form-item-wrap" style={{ marginTop: '16px' }}>
                <label className="form-field-lbl">4. Kronologi & Gejala Spesifik yang Dialami Pasien:</label>
                <textarea
                  rows="3"
                  className="custom-form-ctrl"
                  placeholder="Jelaskan secara rinci sejak kapan gejala muncul, obat yang diminum, apakah ada muntah atau bengkak..."
                  value={adverseDescription}
                  onChange={(e) => setAdverseDescription(e.target.value)}
                  required
                />
              </div>

              <div className="pmo-form-submit-row">
                <button type="submit" className="btn-send-adverse-report">
                  <Send size={18} />
                  <span>Kirim Laporan Darurat ke Dokter Puskesmas</span>
                </button>
              </div>
            </form>
          </div>

          {/* Feed of Past Reports */}
          <h3 className="section-sub-title-margin">Riwayat Laporan Kendala & Status Respon Dokter</h3>
          <div className="pmo-reports-feed-grid">
            {simpusState.adverseReports.map((rep) => (
              <div key={rep.id} className={`pmo-report-card severity-${rep.severity}`}>
                <div className="report-card-top-bar">
                  <span className={`severity-tag severity-${rep.severity}`}>
                    URGENSI: {rep.severity.toUpperCase()}
                  </span>
                  <span className="report-time-stamp">{rep.reportedAt}</span>
                </div>

                <h4 className="report-headline">{rep.category}</h4>
                <div className="report-patient-meta">
                  <span>Pasien: <strong>{rep.patientName}</strong></span>
                </div>
                <div className="report-body-text">"{rep.description}"</div>

                {rep.doctorResponse ? (
                  <div className="doctor-reply-box">
                    <div className="reply-label">
                      <CheckCircle2 size={15} /> Arahan Dokter Puskesmas:
                    </div>
                    <p className="reply-text">{rep.doctorResponse}</p>
                  </div>
                ) : (
                  <div className="reply-pending-badge">
                    ⏳ Sedang menunggu tanggapan dokter penanggung jawab...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
