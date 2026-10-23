import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  Calendar,
  Clock,
  Pill,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Ticket,
  Printer,
  Volume2,
  Bell,
  ArrowRight,
  Search,
  MessageSquare,
  ShieldCheck,
  Send,
  HeartPulse,
  Info
} from 'lucide-react';
import {
  POLI_LIST,
  getSimpusState,
  registerNewQueueTicket,
  saveSimpusState
} from '../services/puskesmasState';
import { announceQueueCall } from '../services/soundEffects';
import PrintResumeModal from './PrintResumeModal';

export default function PatientView({
  patient,
  onOpenArticle,
  onOpenWhatsAppSim,
  onRefreshData
}) {
  const [activeTab, setActiveTab] = useState('beranda'); // 'beranda', 'antrean', 'rekam_medis', 'obat_notif', 'tanya_nakes'
  const [simpusState, setSimpusState] = useState(getSimpusState());
  const [selectedPoli, setSelectedPoli] = useState('poli_umum');
  const [sessionTime, setSessionTime] = useState('Pagi (08:00 - 11:30 WIB)');
  const [paymentType, setPaymentType] = useState('BPJS Kesehatan');
  const [patientComplaint, setPatientComplaint] = useState('');
  const [registeredSuccessTicket, setRegisteredSuccessTicket] = useState(null);
  const [selectedResumeRecord, setSelectedResumeRecord] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'petugas',
      senderName: 'Bu Sari, S.Kep (Perawat TB Puskesmas)',
      message: 'Halo Mas Dika, bagaimana kondisi Anda hari ini? Apakah obat OAT 3 tablet pagi ini sudah diminum teratur?',
      time: '08:15 WIB'
    },
    {
      id: 2,
      sender: 'pasien',
      senderName: 'Dika Pratama',
      message: 'Selamat pagi Bu Sari. Sudah saya minum jam 08:00 tadi pagi didampingi Ibu. Alhamdulillah rasa mual sudah jauh berkurang.',
      time: '08:20 WIB'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [alreadyTakenToday, setAlreadyTakenToday] = useState(true);

  // Sync state on change
  useEffect(() => {
    const handleStateChange = () => {
      setSimpusState(getSimpusState());
    };
    window.addEventListener('simpus-state-changed', handleStateChange);
    return () => window.removeEventListener('simpus-state-changed', handleStateChange);
  }, []);

  const currentPatientName = patient?.name || simpusState.activeUser?.name || 'Dika Pratama';
  const currentPatientNik = patient?.nik || '3201123456780001';
  const currentPatientNoRm = 'RM-2026-0814';
  const currentPatientNoBpjs = '0001827364891';

  // Find user's active queue today
  const myActiveQueue = simpusState.queues.find(
    (q) => q.nik === currentPatientNik && q.status !== 'selesai'
  );

  // Filter records for this patient
  const myEhrRecords = simpusState.ehrRecords.filter(
    (r) => r.patientId === 1 || r.patientName.toLowerCase().includes('dika')
  );

  // Notifications for patient
  const myNotifications = simpusState.notifications.filter(
    (n) => n.forRole === 'pasien' || !n.forRole
  );

  // Handle Queue Registration
  const handleRegisterQueue = (e) => {
    e.preventDefault();
    if (!patientComplaint.trim()) {
      alert('Harap masukkan keluhan utama Anda.');
      return;
    }

    const poliObj = POLI_LIST.find((p) => p.id === selectedPoli) || POLI_LIST[0];

    const newTicket = registerNewQueueTicket({
      poliId: selectedPoli,
      patientName: currentPatientName,
      nik: currentPatientNik,
      bpjsNumber: currentPatientNoBpjs,
      paymentType,
      complaint: patientComplaint,
      doctorName: poliObj.doctor
    });

    setRegisteredSuccessTicket(newTicket);
    setPatientComplaint('');
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    if (onRefreshData) onRefreshData();
  };

  // Trigger celebration on taking medication
  const handleMarkMedicationTaken = () => {
    setAlreadyTakenToday(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#0d9488', '#10b981', '#38bdf8']
    });
  };

  // Audio simulation for calling queue
  const handleSimulateCallMyQueue = (ticket) => {
    announceQueueCall(ticket.queueNumber, ticket.poliName, 'Ruang Pemeriksaan');
  };

  // Send Chat message
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'pasien',
      senderName: currentPatientName,
      message: chatInput,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Auto reply simulation from nurse
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'petugas',
          senderName: 'Bu Sari, S.Kep (Perawat TB Puskesmas)',
          message: 'Terima kasih informasinya Mas Dika. Terus pertahankan kedisiplinannya ya, jangan sampai terlewat jadwal minum obat dan kontrol rutinnya.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        }
      ]);
    }, 1200);
  };

  return (
    <div className="patient-portal-container">
      {/* Patient Health Pass Header Banner */}
      <section className="patient-profile-header-card">
        <div className="patient-header-left">
          <div className="patient-avatar-box">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
              alt="Dika Pratama"
              className="patient-avatar-img"
            />
            <span className="patient-status-badge-online">BPJS Aktif</span>
          </div>
          <div>
            <div className="patient-title-row">
              <h1 className="patient-name-display">{currentPatientName}</h1>
              <span className="patient-faskes-tag">
                <ShieldCheck size={13} /> Faskes 1: Puskesmas Mekar Jaya
              </span>
            </div>
            <div className="patient-meta-chips">
              <span className="patient-meta-chip">
                <strong>No. RM:</strong> {currentPatientNoRm}
              </span>
              <span className="patient-meta-chip">
                <strong>NIK:</strong> {currentPatientNik}
              </span>
              <span className="patient-meta-chip">
                <strong>No. BPJS:</strong> {currentPatientNoBpjs}
              </span>
              <span className="patient-meta-chip highlight-tb">
                Program DOTS TB (Fase Intensif - Hari 12/180)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Adherence Mini Gauge */}
        <div className="patient-adherence-quick-box">
          <div className="quick-adherence-circle">
            <span className="circle-percent">98%</span>
            <span className="circle-sub">Kepatuhan</span>
          </div>
          <div className="quick-streak-info">
            <div className="streak-title">🔥 12 Hari Berturut-turut</div>
            <div className="streak-desc">Sangat Patuh • Bebas TBC</div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <nav className="portal-subnav-tabs">
        <button
          className={`portal-tab-btn ${activeTab === 'beranda' ? 'active' : ''}`}
          onClick={() => setActiveTab('beranda')}
        >
          <Activity size={16} />
          <span>Dashboard & Kesehatan</span>
        </button>

        <button
          className={`portal-tab-btn ${activeTab === 'antrean' ? 'active' : ''}`}
          onClick={() => setActiveTab('antrean')}
        >
          <Ticket size={16} />
          <span>Pendaftaran Antrean Online</span>
          {myActiveQueue && <span className="tab-bubble-counter">1 Aktif</span>}
        </button>

        <button
          className={`portal-tab-btn ${activeTab === 'rekam_medis' ? 'active' : ''}`}
          onClick={() => setActiveTab('rekam_medis')}
        >
          <FileText size={16} />
          <span>Riwayat Rekam Medis (RME)</span>
        </button>

        <button
          className={`portal-tab-btn ${activeTab === 'obat_notif' ? 'active' : ''}`}
          onClick={() => setActiveTab('obat_notif')}
        >
          <Bell size={16} />
          <span>Notifikasi & Obat</span>
          {myNotifications.filter((n) => !n.read).length > 0 && (
            <span className="tab-bubble-counter">{myNotifications.length}</span>
          )}
        </button>

        <button
          className={`portal-tab-btn ${activeTab === 'tanya_nakes' ? 'active' : ''}`}
          onClick={() => setActiveTab('tanya_nakes')}
        >
          <MessageSquare size={16} />
          <span>Konsultasi Nakes & Artikel</span>
        </button>
      </nav>

      {/* ==============================================================
          TAB 1: BERANDA & RINGKASAN STATUS KESEHATAN
          ============================================================== */}
      {activeTab === 'beranda' && (
        <div className="portal-content-grid">
          {/* Main Column */}
          <div className="portal-main-col">
            {/* Active Queue Alert Card if registered today */}
            {myActiveQueue && (
              <div className="active-ticket-banner-card">
                <div className="ticket-banner-left">
                  <div className="ticket-large-num">{myActiveQueue.queueNumber}</div>
                  <div>
                    <span className="ticket-status-pill status-calling">
                      Status: {myActiveQueue.status.toUpperCase()}
                    </span>
                    <h3 className="ticket-poli-name">{myActiveQueue.poliName}</h3>
                    <p className="ticket-complaint-sub">Keluhan: {myActiveQueue.complaint}</p>
                  </div>
                </div>

                <div className="ticket-banner-right">
                  <button
                    className="ticket-audio-test-btn"
                    onClick={() => handleSimulateCallMyQueue(myActiveQueue)}
                  >
                    <Volume2 size={16} /> Tes Audio Panggilan
                  </button>
                  <button
                    className="ticket-detail-btn"
                    onClick={() => setActiveTab('antrean')}
                  >
                    Buka Tiket Digital
                  </button>
                </div>
              </div>
            )}

            {/* Daily Medication Checklist & Tracker */}
            <div className="simpus-card daily-med-card">
              <div className="card-header-flex">
                <div className="card-title-with-icon">
                  <Pill size={20} className="text-primary" />
                  <div>
                    <h3 className="card-title">Jadwal Minum Obat TB Hari Ini (Hari ke-12)</h3>
                    <p className="card-subtitle">OAT 4KDT Kategori 1 • 3 Tablet Sekali Minum</p>
                  </div>
                </div>
                <span className="badge-tag green">Terpantau PMO</span>
              </div>

              <div className="med-checklist-row">
                <div className="med-pill-visual">
                  <div className="pill-icon-glow">💊</div>
                  <div className="pill-detail-text">
                    <strong>3 Tablet FDC Intensif</strong>
                    <span>Diminum pukul 08:00 WIB (Sebelum makan)</span>
                  </div>
                </div>

                <div className="med-action-right">
                  {alreadyTakenToday ? (
                    <div className="taken-success-pill">
                      <CheckCircle2 size={18} />
                      <span>Sudah Diminum Hari Ini (08:02 WIB)</span>
                    </div>
                  ) : (
                    <button
                      className="btn-mark-taken"
                      onClick={handleMarkMedicationTaken}
                    >
                      <CheckCircle2 size={16} /> Tandai Sudah Minum
                    </button>
                  )}
                </div>
              </div>

              {/* Progress 180 Days Bar */}
              <div className="dots-progress-section">
                <div className="dots-progress-labels">
                  <span>Progres DOTS TB 180 Hari:</span>
                  <span className="font-bold text-primary">12 / 180 Hari (6.7%)</span>
                </div>
                <div className="progress-track-custom">
                  <div className="progress-fill-custom" style={{ width: '6.7%' }}></div>
                </div>
                <div className="dots-phase-badges">
                  <span className="phase-pill active">Fase Intensif (2 Bulan Pertama)</span>
                  <span className="phase-pill">Fase Lanjutan (4 Bulan Terakhir)</span>
                  <span className="phase-pill">Sembuh Tuntas (Evaluasi TCM)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="quick-actions-3-grid">
              <div
                className="action-card-clickable"
                onClick={() => setActiveTab('antrean')}
              >
                <div className="action-card-icon bg-blue-subtle">
                  <Ticket size={24} className="text-primary" />
                </div>
                <div className="action-card-body">
                  <h4>Daftar Antrean Online</h4>
                  <p>Ambil nomor antrean Poli dari rumah tanpa mengantre panjang.</p>
                </div>
                <ChevronRight size={18} className="action-arrow" />
              </div>

              <div
                className="action-card-clickable"
                onClick={() => setActiveTab('rekam_medis')}
              >
                <div className="action-card-icon bg-teal-subtle">
                  <FileText size={24} className="text-teal" />
                </div>
                <div className="action-card-body">
                  <h4>Riwayat Rekam Medis</h4>
                  <p>Lihat diagnosa ICD-10, hasil periksa nakes, dan cetak resume medik.</p>
                </div>
                <ChevronRight size={18} className="action-arrow" />
              </div>

              <div
                className="action-card-clickable"
                onClick={onOpenWhatsAppSim}
              >
                <div className="action-card-icon bg-emerald-subtle">
                  <MessageSquare size={24} className="text-emerald" />
                </div>
                <div className="action-card-body">
                  <h4>Bot Pengingat WhatsApp</h4>
                  <p>Simulasi konfirmasi minum obat via pesan interaktif WhatsApp.</p>
                </div>
                <ChevronRight size={18} className="action-arrow" />
              </div>
            </div>

            {/* Latest Vitals Overview */}
            <div className="simpus-card">
              <div className="card-header-flex">
                <div className="card-title-with-icon">
                  <HeartPulse size={20} className="text-rose-500" />
                  <div>
                    <h3 className="card-title">Tanda Vital Terakhir Pasien</h3>
                    <p className="card-subtitle">Pemeriksaan di Poli TB Paru (19 Okt 2026)</p>
                  </div>
                </div>
                <button
                  className="btn-link-action"
                  onClick={() => setActiveTab('rekam_medis')}
                >
                  Lihat Riwayat Lengkap →
                </button>
              </div>

              <div className="vitals-metric-grid">
                <div className="vital-metric-card">
                  <div className="vital-icon-wrap">🩺</div>
                  <div className="vital-num">118/76</div>
                  <div className="vital-unit">mmHg</div>
                  <div className="vital-label">Tekanan Darah (Normal)</div>
                </div>

                <div className="vital-metric-card">
                  <div className="vital-icon-wrap">❤️</div>
                  <div className="vital-num">78</div>
                  <div className="vital-unit">x / menit</div>
                  <div className="vital-label">Denyut Nadi (Optimal)</div>
                </div>

                <div className="vital-metric-card">
                  <div className="vital-icon-wrap">🌡️</div>
                  <div className="vital-num">36.7</div>
                  <div className="vital-unit">°C</div>
                  <div className="vital-label">Suhu Tubuh (Afebris)</div>
                </div>

                <div className="vital-metric-card">
                  <div className="vital-icon-wrap">⚖️</div>
                  <div className="vital-num">55.8</div>
                  <div className="vital-unit">kg (IMT 19.8)</div>
                  <div className="vital-label">Berat Badan (Naik +0.8 kg)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="portal-side-col">
            {/* Next Control Appointment */}
            <div className="simpus-card next-control-card">
              <div className="next-control-badge">
                <Calendar size={14} /> JADWAL KONTROL TERDEKAT
              </div>
              <h3 className="control-date">Rabu, 28 Okt 2026</h3>
              <p className="control-clinic">Klinik DOTS Paru • Puskesmas Mekar Jaya</p>
              <div className="control-details">
                <div className="control-item">
                  <Clock size={14} />
                  <span>Pukul 08:30 WIB</span>
                </div>
                <div className="control-item">
                  <Stethoscope size={14} />
                  <span>dr. Sarah Anindita / dr. Budi</span>
                </div>
                <div className="control-item">
                  <Pill size={14} />
                  <span>Pengambilan Paket OAT Bulan ke-2</span>
                </div>
              </div>
              <button
                className="btn-outline-action"
                onClick={() => setActiveTab('antrean')}
              >
                Daftar Antrean Kunjungan Ini
              </button>
            </div>

            {/* PMO Information Card */}
            <div className="simpus-card pmo-contact-card">
              <h3 className="card-title">Pengawas Menelan Obat (PMO)</h3>
              <p className="card-subtitle">Didampingi oleh keluarga tercinta</p>
              <div className="pmo-profile-row">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                  alt="Ibu Ratna"
                  className="pmo-avatar"
                />
                <div>
                  <div className="pmo-name">Ibu Ratna</div>
                  <div className="pmo-relation">Ibu Kandung • RW 04 Mekar Jaya</div>
                  <div className="pmo-phone">+62 813-9876-5432</div>
                </div>
              </div>
              <div className="pmo-role-notice">
                Ibu Ratna mengawasi dosis harian dan berkoordinasi langsung dengan nakes Puskesmas bila ada keluhan.
              </div>
            </div>

            {/* Quick Emergency Hotline */}
            <div className="emergency-hotline-card">
              <div className="hotline-icon">🚑</div>
              <div>
                <div className="hotline-title">Layanan Darurat Puskesmas 24 Jam</div>
                <div className="hotline-phone">(021) 876-5432 / 119</div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ==============================================================
          TAB 2: PENDAFTARAN ANTREAN ONLINE REAL-TIME
          ============================================================== */}
      {activeTab === 'antrean' && (
        <div className="queue-registration-section">
          {/* Active Ticket Banner if exists */}
          {myActiveQueue && (
            <div className="digital-ticket-card">
              <div className="ticket-top-strip">
                <div className="ticket-clinic-brand">
                  <ShieldCheck size={18} />
                  <span>PUSKESMAS MEKAR JAYA • TIKET ANTREAN DIGITAL RESMI</span>
                </div>
                <span className="ticket-active-indicator">● TIKET AKTIF HARI INI</span>
              </div>

              <div className="ticket-main-content">
                <div className="ticket-qr-col">
                  {/* Mock Barcode / QR Box */}
                  <div className="mock-qr-container">
                    <div className="mock-qr-code">
                      <div className="qr-box-pattern"></div>
                    </div>
                    <span className="qr-code-text">{myActiveQueue.queueNumber}</span>
                  </div>
                  <button
                    className="ticket-print-trigger-btn"
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> Cetak Bukti Antrean
                  </button>
                </div>

                <div className="ticket-details-col">
                  <div className="ticket-poli-badge">{myActiveQueue.poliName}</div>
                  <div className="ticket-giant-number">{myActiveQueue.queueNumber}</div>

                  <div className="ticket-info-grid">
                    <div>
                      <span className="t-label">Nama Pasien:</span>
                      <span className="t-val">{myActiveQueue.patientName}</span>
                    </div>
                    <div>
                      <span className="t-label">Penjamin:</span>
                      <span className="t-val">{myActiveQueue.paymentType}</span>
                    </div>
                    <div>
                      <span className="t-label">Jam Terdaftar:</span>
                      <span className="t-val">{myActiveQueue.registeredAt}</span>
                    </div>
                    <div>
                      <span className="t-label">Dokter Jaga:</span>
                      <span className="t-val">{myActiveQueue.doctor}</span>
                    </div>
                  </div>

                  {/* Tracker Bar */}
                  <div className="ticket-tracker-bar">
                    <div className={`step-node ${myActiveQueue.status ? 'active' : ''}`}>
                      <span className="node-circle">1</span>
                      <span className="node-label">Terdaftar</span>
                    </div>
                    <div className="step-connector active"></div>
                    <div className={`step-node ${myActiveQueue.status === 'dipanggil' || myActiveQueue.status === 'sedang_diperiksa' || myActiveQueue.status === 'farmasi' || myActiveQueue.status === 'selesai' ? 'active' : ''}`}>
                      <span className="node-circle">2</span>
                      <span className="node-label">Dipanggil</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-node ${myActiveQueue.status === 'sedang_diperiksa' || myActiveQueue.status === 'farmasi' || myActiveQueue.status === 'selesai' ? 'active' : ''}`}>
                      <span className="node-circle">3</span>
                      <span className="node-label">Diperiksa</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-node ${myActiveQueue.status === 'farmasi' || myActiveQueue.status === 'selesai' ? 'active' : ''}`}>
                      <span className="node-circle">4</span>
                      <span className="node-label">Farmasi / Obat</span>
                    </div>
                  </div>

                  <div className="ticket-actions-row">
                    <button
                      className="ticket-call-test-button"
                      onClick={() => handleSimulateCallMyQueue(myActiveQueue)}
                    >
                      <Volume2 size={16} /> Putar Simulasi Suara Panggilan Antrean
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form Box */}
          <div className="simpus-card form-register-card">
            <div className="form-card-title-area">
              <Ticket size={24} className="text-primary" />
              <div>
                <h2 className="form-section-title">Formulir Pendaftaran Antrean Online Mandiri</h2>
                <p className="form-section-sub">
                  Pilih Poli tujuan dan dapatkan nomor antrean secara otomatis tanpa perlu datang subuh ke loket pendaftaran.
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterQueue} className="queue-booking-form">
              {/* Step 1: Poli Selection Cards */}
              <div className="booking-field-group">
                <label className="booking-group-label">
                  1. Pilih Poliklinik Layanan Puskesmas:
                </label>
                <div className="poli-selection-cards-grid">
                  {POLI_LIST.map((poli) => {
                    const isSelected = selectedPoli === poli.id;
                    const waitCount = simpusState.queues.filter(
                      (q) => q.poliId === poli.id && q.status === 'menunggu'
                    ).length;

                    return (
                      <div
                        key={poli.id}
                        className={`poli-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedPoli(poli.id)}
                        style={{ borderColor: isSelected ? poli.badgeColor : undefined }}
                      >
                        <div className="choice-header">
                          <span
                            className="choice-code-badge"
                            style={{ background: poli.badgeColor }}
                          >
                            Poli {poli.code}
                          </span>
                          <span className="choice-wait-badge">
                            {waitCount} antrean menunggu
                          </span>
                        </div>
                        <h4 className="choice-title">{poli.name}</h4>
                        <p className="choice-room">{poli.room}</p>
                        <div className="choice-doc">
                          <Stethoscope size={13} /> {poli.doctor}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Date, Session & Payment */}
              <div className="booking-inputs-grid-3">
                <div className="booking-item">
                  <label className="booking-input-label">2. Tanggal Kunjungan</label>
                  <input
                    type="date"
                    className="custom-booking-input"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="booking-item">
                  <label className="booking-input-label">3. Sesi Jam Pelayanan</label>
                  <select
                    className="custom-booking-input"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                  >
                    <option>Pagi (08:00 - 11:30 WIB)</option>
                    <option>Siang (13:00 - 15:00 WIB)</option>
                  </select>
                </div>

                <div className="booking-item">
                  <label className="booking-input-label">4. Jenis Penjaminan / Biaya</label>
                  <select
                    className="custom-booking-input"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option>BPJS Kesehatan (Gratis Faskes 1)</option>
                    <option>Mandiri / Pasien Umum</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Complaint */}
              <div className="booking-item">
                <label className="booking-input-label">
                  5. Keluhan Utama yang Dirasakan Saat Ini
                </label>
                <textarea
                  className="custom-booking-textarea"
                  rows="3"
                  value={patientComplaint}
                  onChange={(e) => setPatientComplaint(e.target.value)}
                  placeholder="Contoh: Batuk berdahak sudah 3 hari, demam malam hari, atau kontrol rutin obat TB bulanan..."
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="booking-submit-row">
                <button type="submit" className="btn-confirm-queue">
                  <Ticket size={18} />
                  <span>Daftar Sekarang & Ambil Nomor Antrean</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: RIWAYAT REKAM MEDIS ELEKTRONIK (RME)
          ============================================================== */}
      {activeTab === 'rekam_medis' && (
        <div className="medical-records-section">
          <div className="records-intro-header">
            <div>
              <h2 className="records-title">Riwayat Rekam Medis Elektronik (RME)</h2>
              <p className="records-desc">
                Data rekam medis terintegrasi standar Kemenkes SatuSehat. Anda dapat melihat diagnosa resmi, hasil periksa tanda vital, dan mengunduh ringkasan medis untuk keperluan rujukan atau arsip pribadi.
              </p>
            </div>
            <div className="records-patient-badge">
              <User size={14} /> Pasien: {currentPatientName} (No. RM: {currentPatientNoRm})
            </div>
          </div>

          {/* Timeline of Visits */}
          <div className="ehr-timeline-wrapper">
            {myEhrRecords.map((record) => (
              <div key={record.id} className="ehr-timeline-card">
                <div className="timeline-date-marker">
                  <div className="marker-dot"></div>
                  <div className="marker-date">{record.visitDate}</div>
                </div>

                <div className="ehr-card-content">
                  <div className="ehr-card-top">
                    <div>
                      <span className="ehr-poli-tag">{record.poliName}</span>
                      <h3 className="ehr-diag-title">{record.primaryDiagnosis}</h3>
                      <div className="ehr-doc-name">
                        <Stethoscope size={14} /> Dokter Pemeriksa: {record.doctorName}
                      </div>
                    </div>

                    <button
                      className="btn-print-resume"
                      onClick={() => {
                        setSelectedResumeRecord(record);
                        setIsPrintModalOpen(true);
                      }}
                    >
                      <Printer size={15} />
                      <span>Cetak Resume Medis</span>
                    </button>
                  </div>

                  {/* Anamnesis & Findings */}
                  <div className="ehr-anamnesis-text">
                    <strong>Keluhan & Anamnesis:</strong> {record.anamnesis}
                  </div>

                  {/* Vitals Ribbon */}
                  {record.vitalSigns && (
                    <div className="ehr-vitals-ribbon">
                      <div className="ribbon-item">
                        <span>TD:</span> <strong>{record.vitalSigns.systolic}/{record.vitalSigns.diastolic} mmHg</strong>
                      </div>
                      <div className="ribbon-item">
                        <span>Nadi:</span> <strong>{record.vitalSigns.heartRate} x/m</strong>
                      </div>
                      <div className="ribbon-item">
                        <span>Suhu:</span> <strong>{record.vitalSigns.temperature} °C</strong>
                      </div>
                      <div className="ribbon-item">
                        <span>Berat / Tinggi:</span> <strong>{record.vitalSigns.weight} kg / {record.vitalSigns.height} cm</strong>
                      </div>
                      <div className="ribbon-item">
                        <span>IMT:</span> <strong className="text-primary">{record.vitalSigns.bmi} ({record.vitalSigns.bmiCategory})</strong>
                      </div>
                    </div>
                  )}

                  {/* Prescriptions List */}
                  {record.prescriptions && record.prescriptions.length > 0 && (
                    <div className="ehr-prescriptions-box">
                      <div className="rx-box-title">
                        <Pill size={14} className="text-primary" />
                        <span>Resep Obat yang Diberikan (E-Prescription):</span>
                      </div>
                      <div className="rx-items-list">
                        {record.prescriptions.map((rx, idx) => (
                          <div key={idx} className="rx-item-chip">
                            <span className="rx-med-name">{rx.medicineName}</span>
                            <span className="rx-dosage-rule">({rx.frequency || rx.dosage} • {rx.quantity} Tablet)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clinical Notes */}
                  {record.clinicalNotes && (
                    <div className="ehr-doctor-advice">
                      <strong>Anjuran & Edukasi Dokter:</strong> {record.clinicalNotes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 4: NOTIFIKASI & JADWAL PENGAMBILAN OBAT
          ============================================================== */}
      {activeTab === 'obat_notif' && (
        <div className="notifications-portal-layout">
          <div className="notif-header-area">
            <div>
              <h2 className="records-title">Pusat Notifikasi & Pengingat Pengobatan</h2>
              <p className="records-desc">
                Notifikasi otomatis jadwal kontrol dokter, pengambilan obat di Farmasi, dan pengingat harian minum obat.
              </p>
            </div>
          </div>

          <div className="notif-cards-list">
            {myNotifications.map((n) => (
              <div key={n.id} className="notif-feed-item">
                <div className={`notif-icon-badge notif-type-${n.type || 'info'}`}>
                  {n.type === 'medication' ? <Pill size={20} /> : <Bell size={20} />}
                </div>
                <div className="notif-feed-body">
                  <div className="notif-feed-top">
                    <h4 className="notif-feed-title">{n.title}</h4>
                    <span className="notif-feed-time">{n.time}</span>
                  </div>
                  <p className="notif-feed-msg">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 5: KONSULTASI NAKES & ARTIKEL EDUKASI
          ============================================================== */}
      {activeTab === 'tanya_nakes' && (
        <div className="chat-consultation-grid">
          {/* Chat Window */}
          <div className="simpus-card chat-window-card">
            <div className="chat-window-header">
              <div className="chat-header-user">
                <div className="chat-avatar-ring">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 className="chat-nurse-name">Bu Sari, S.Kep (Perawat TB Puskesmas)</h3>
                  <span className="chat-nurse-status">● Sedang Online • Siap Menjawab Pertanyaan Medis</span>
                </div>
              </div>
            </div>

            <div className="chat-messages-scroll">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-bubble-row ${msg.sender === 'pasien' ? 'from-me' : 'from-them'}`}
                >
                  <div className="chat-bubble-bubble">
                    <div className="chat-bubble-sender">{msg.senderName}</div>
                    <div className="chat-bubble-text">{msg.message}</div>
                    <div className="chat-bubble-time">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="chat-composer-form">
              <input
                type="text"
                className="chat-text-input"
                placeholder="Ketik keluhan atau pertanyaan Anda ke nakes..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="chat-send-btn" title="Kirim">
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Education Articles Sidebar */}
          <div className="simpus-card articles-sidebar-card">
            <h3 className="card-title">Edukasi Kesehatan TB & Paru</h3>
            <p className="card-subtitle">Panduan resmi dari Kementerian Kesehatan RI</p>

            <div className="article-mini-list">
              <div
                className="article-mini-item"
                onClick={() =>
                  onOpenArticle &&
                  onOpenArticle({
                    title: 'Tips Mengatasi Rasa Mual Saat Minum Obat TB',
                    category: 'Pengobatan',
                    content: 'Bagi pasien yang mengalami mual setelah minum OAT FDC, dianjurkan untuk minum obat bersama air putih hangat dan sedikit makanan ringan seperti pisang atau biskuit 30 menit sebelumnya.'
                  })
                }
              >
                <div className="article-mini-title">Tips Mengatasi Mual Saat Minum Obat TB</div>
                <div className="article-mini-sub">3 menit baca • Panduan Pasien</div>
              </div>

              <div
                className="article-mini-item"
                onClick={() =>
                  onOpenArticle &&
                  onOpenArticle({
                    title: 'Mengapa Air Seni Berwarna Merah Selama Pengobatan TB?',
                    category: 'TB',
                    content: 'Kandungan Rifampisin dalam obat TB akan mewarnai cairan tubuh termasuk air kencing, air liur, dan keringat menjadi merah/oranye. Ini adalah respon normal tubuh dan sama sekali bukan tanda bahaya atau pendarahan.'
                  })
                }
              >
                <div className="article-mini-title">Mengapa Air Seni Berwarna Kemerahan?</div>
                <div className="article-mini-sub">Efek Samping Rifampisin yang Normal</div>
              </div>

              <div
                className="article-mini-item"
                onClick={() =>
                  onOpenArticle &&
                  onOpenArticle({
                    title: 'Makanan Bergizi Tinggi Protein untuk Pemulihan Paru',
                    category: 'Gizi',
                    content: 'Telur rebus, ikan, tempe, tahu, dan sayuran hijau sangat baik untuk meregenerasi jaringan paru yang terkena kuman TB.'
                  })
                }
              >
                <div className="article-mini-title">Nutrisi Protein Tinggi Pemulih Paru</div>
                <div className="article-mini-sub">Menu Sehat Sehari-hari</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Resume Modal */}
      <PrintResumeModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={selectedResumeRecord}
        patient={{
          name: currentPatientName,
          nik: currentPatientNik,
          noRm: currentPatientNoRm,
          noBpjs: currentPatientNoBpjs,
          gender: 'Laki-laki',
          age: 24,
          address: 'Jl. Anggrek No. 14, RW 04 Mekar Jaya'
        }}
      />
    </div>
  );
}
