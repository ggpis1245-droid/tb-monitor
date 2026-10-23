import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Bell,
  Clock,
  Pill,
  BookOpen,
  Calendar,
  MessageCircle,
  Home,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Send,
  PhoneCall,
  Sparkles,
  Info,
  Activity
} from 'lucide-react';

export default function PatientView({
  patient,
  onOpenArticle,
  onOpenWhatsAppSim,
  onRefreshData
}) {
  const [activeTab, setActiveTab] = useState('beranda'); // 'beranda', 'obat', 'pesan', 'chat', 'riwayat', 'profil'
  const [adherenceData, setAdherenceData] = useState(null);
  const [articles, setArticles] = useState([]);
  const [selectedCat, setSelectedCat] = useState('Semua');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [takenLoading, setTakenLoading] = useState(false);
  const [alreadyTakenToday, setAlreadyTakenToday] = useState(false);

  const patientId = patient?.id || 1;

  // Load Adherence Data
  const loadAdherence = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/adherence`);
      const data = await res.json();
      if (data.success) {
        setAdherenceData(data.data);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLog = data.data.allLogs?.find(l => l.scheduled_date === todayStr);
        setAlreadyTakenToday(todayLog?.status === 'minum');
      }
    } catch (err) {
      console.error('Error fetching adherence:', err);
    }
  };

  // Load Articles
  const loadArticles = async (category = 'Semua') => {
    try {
      const res = await fetch(`/api/articles?category=${category}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  // Load Consultations Chat
  const loadConsultations = async () => {
    try {
      const res = await fetch(`/api/consultations/${patientId}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.data);
      }
    } catch (err) {
      console.error('Error fetching chat:', err);
    }
  };

  useEffect(() => {
    loadAdherence();
    loadArticles(selectedCat);
    loadConsultations();
  }, [patientId]);

  useEffect(() => {
    loadArticles(selectedCat);
  }, [selectedCat]);

  // Handle "Sudah Minum" Action Button
  const handleConfirmTaken = async () => {
    if (alreadyTakenToday || takenLoading) return;
    try {
      setTakenLoading(true);
      const res = await fetch('/api/adherence/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId })
      });
      const data = await res.json();

      if (data.success) {
        // Trigger celebratory confetti effect
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
        setAlreadyTakenToday(true);
        loadAdherence();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to confirm taken:', err);
    } finally {
      setTakenLoading(false);
    }
  };

  // Send message in Consultation Chat
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      patientId,
      senderRole: 'pasien',
      senderName: patient?.name || 'Dika Pratama',
      message: chatInput,
      category: 'keluhan_obat'
    };

    setChatInput('');
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
      const data = await res.json();
      if (data.success) {
        loadConsultations();
        setTimeout(loadConsultations, 2000);
      }
    } catch (err) {
      console.error('Failed to send consultation:', err);
    }
  };

  const currentDay = patient?.current_day || 12;
  const totalDays = patient?.total_days || 180;
  const progressPercent = Math.min(100, Math.round((currentDay / totalDays) * 100));

  return (
    <div className="patient-web-dashboard">
      {/* Header Sapaan Personal Banner */}
      <div className="patient-header-greeting" style={{ borderRadius: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="greeting-text-subtitle">Program TB DOTS 180 Hari • Puskesmas Mekar Jaya</div>
            <h1 className="greeting-text-title" style={{ fontSize: 24, margin: '4px 0 6px' }}>
              Halo, {patient?.name || 'Dika Pratama'}! Jangan lupa minum obat hari ini ya!
            </h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <div className="greeting-puskesmas-tag">
                <Sparkles size={13} color="#fbbf24" /> Pengawas Menelan Obat: <strong>{patient?.pmo_name || 'Ibu Ratna'}</strong>
              </div>
              <div className="greeting-puskesmas-tag">
                <Clock size={13} /> Jadwal Harian: <strong>{patient?.schedule_time || '08:00'} WIB</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => onOpenWhatsAppSim && onOpenWhatsAppSim()}
              style={{
                background: '#25d366',
                color: '#ffffff',
                border: 'none',
                borderRadius: 24,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
              }}
            >
              <MessageCircle size={16} /> Buka Bot WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Web Tab Navigation Bar */}
      <div className="patient-web-tabs-bar">
        <button
          className={`web-tab-item ${activeTab === 'beranda' ? 'active' : ''}`}
          onClick={() => setActiveTab('beranda')}
        >
          <Home size={16} /> Beranda Pasien
        </button>

        <button
          className={`web-tab-item ${activeTab === 'obat' ? 'active' : ''}`}
          onClick={() => setActiveTab('obat')}
        >
          <Pill size={16} /> Pengingat & Jadwal Obat
        </button>

        <button
          className={`web-tab-item ${activeTab === 'pesan' ? 'active' : ''}`}
          onClick={() => setActiveTab('pesan')}
        >
          <BookOpen size={16} /> Pesan & Edukasi TB
        </button>

        <button
          className={`web-tab-item ${activeTab === 'riwayat' ? 'active' : ''}`}
          onClick={() => setActiveTab('riwayat')}
        >
          <Calendar size={16} /> Riwayat Minum Obat
        </button>

        <button
          className={`web-tab-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageCircle size={16} /> Kontak & Konsultasi Perawat
        </button>

        <button
          className={`web-tab-item ${activeTab === 'profil' ? 'active' : ''}`}
          onClick={() => setActiveTab('profil')}
        >
          <User size={16} /> Profil Pasien
        </button>
      </div>

      {/* TAB 1: BERANDA */}
      {activeTab === 'beranda' && (
        <div className="patient-home-grid">
          {/* Left Column: Progress Card & Action Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Kartu Progres Pengobatan TB */}
            <div className="treatment-progress-card" style={{ margin: 0 }}>
              <div className="progress-header-row">
                <span className="progress-label-title">Progres Pengobatan TB DOTS</span>
                <span className="phase-pill-badge">Fase {patient?.phase || 'Intensif (2 Bulan)'}</span>
              </div>

              <div className="days-counter-big" style={{ fontSize: 28, margin: '8px 0' }}>
                Hari ke-{currentDay} <span>dari {totalDays} Hari</span>
              </div>

              <div className="progress-track" style={{ height: 14 }}>
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="progress-footer-stats" style={{ marginTop: 8 }}>
                <span>Obat diminum {currentDay}/{totalDays} hari</span>
                <span style={{ color: '#0284c7', fontWeight: 800 }}>{progressPercent}% Selesai</span>
              </div>
            </div>

            {/* Schedule Clock Action Card */}
            <div className="schedule-clock-card" style={{ margin: 0 }}>
              <div className="clock-icon-pill">
                <Pill size={32} />
              </div>
              <div className="clock-time-display">
                {patient?.schedule_time || '08:00'} Pagi
              </div>
              <div className="clock-time-sub">
                Resep: <strong>{patient?.medication_type || 'FDC Kat 1 (RHZE)'}</strong>
                <br />
                {patient?.dosage_info || '3 Tablet FDC diminum 1 kali sehari'}
              </div>

              <button
                className={`btn-taken-action ${alreadyTakenToday ? 'already-taken' : ''}`}
                onClick={handleConfirmTaken}
                disabled={alreadyTakenToday || takenLoading}
              >
                {alreadyTakenToday ? (
                  <>
                    <CheckCircle2 size={20} /> Sudah Minum Hari Ini (Tepat Waktu)
                  </>
                ) : (
                  <>
                    <Pill size={20} /> {takenLoading ? 'Mencatat...' : 'Sudah Minum'}
                  </>
                )}
              </button>

              <div style={{ marginTop: 14 }}>
                <span
                  className="schedule-sublink"
                  onClick={() => setActiveTab('obat')}
                >
                  Lihat detail jadwal lengkap &riwayat &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Menu Utama Grid & Riwayat Hari Ini */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Grid 4 Menu Utama */}
            <div className="patient-menu-grid" style={{ padding: 0, margin: 0 }}>
              <div
                className="menu-action-card"
                onClick={() => setActiveTab('obat')}
              >
                <div className="menu-icon-wrapper icon-blue">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="menu-card-title">Pengingat Obat</div>
                  <div className="menu-card-desc">Lihat jadwal & catat konsumsi obat</div>
                </div>
              </div>

              <div
                className="menu-action-card"
                onClick={() => setActiveTab('pesan')}
              >
                <div className="menu-icon-wrapper icon-teal">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="menu-card-title">Pesan & Edukasi</div>
                  <div className="menu-card-desc">Informasi seputar TB & gizi sehat</div>
                </div>
              </div>

              <div
                className="menu-action-card"
                onClick={() => setActiveTab('riwayat')}
              >
                <div className="menu-icon-wrapper icon-emerald">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="menu-card-title">Riwayat Minum Obat</div>
                  <div className="menu-card-desc">Lihat catatan harian kepatuhan</div>
                </div>
              </div>

              <div
                className="menu-action-card"
                onClick={() => setActiveTab('chat')}
              >
                <div className="menu-icon-wrapper icon-amber">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <div className="menu-card-title">Kontak Petugas</div>
                  <div className="menu-card-desc">Hubungi jika ada keluhan atau mual</div>
                </div>
              </div>
            </div>

            {/* Riwayat Hari Ini Card */}
            <div className="today-history-card" style={{ margin: 0 }}>
              <div className="history-card-title">
                <Clock size={16} color="#0284c7" /> Riwayat Hari Ini
              </div>

              {alreadyTakenToday ? (
                <div className="history-item-row">
                  <div className="history-item-left">
                    <CheckCircle2 size={20} color="#10b981" />
                    <div>
                      <div className="history-item-title">
                        {patient?.schedule_time || '08:00'} Obat diminum
                      </div>
                      <div className="history-item-method">
                        Tercatat via WhatsApp Bot & Tombol Aplikasi
                      </div>
                    </div>
                  </div>
                  <div className="history-item-badge">Patuh</div>
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#64748b',
                  background: '#f8fafc',
                  borderRadius: 10,
                  fontSize: 13
                }}>
                  <AlertCircle size={22} color="#f59e0b" style={{ margin: '0 auto 6px' }} />
                  Belum ada konfirmasi minum obat hari ini.
                  <br />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    Silakan minum obat sesuai jadwal dan tekan tombol "Sudah Minum".
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OBAT (Halaman Pengingat Obat) */}
      {activeTab === 'obat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Banner Pengingat */}
          <div className="reminder-banner" style={{ margin: 0 }}>
            <div className="reminder-banner-icon">
              <Bell size={22} />
            </div>
            <div>
              <div className="reminder-banner-title" style={{ fontSize: 16 }}>Jangan lupa minum obat!</div>
              <div className="reminder-banner-desc" style={{ fontSize: 13 }}>
                Obat TB harus diminum secara teratur setiap hari sampai selesai pengobatan (180 hari) agar kuman TB tidak resisten (kebal obat/MDR).
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Penunjuk Jam Jadwal Minum Obat */}
            <div className="schedule-clock-card" style={{ margin: 0 }}>
              <div className="clock-icon-pill">
                <Pill size={36} />
              </div>
              <div className="clock-time-display">
                {patient?.schedule_time || '08:00'} Pagi
              </div>
              <div className="clock-time-sub">
                Obat: <strong>{patient?.medication_type || 'FDC Kat 1 (RHZE)'}</strong>
                <br />
                {patient?.dosage_info || '3 Tablet FDC diminum 1 kali sehari sebelum makan'}
              </div>

              <button
                className={`btn-taken-action ${alreadyTakenToday ? 'already-taken' : ''}`}
                onClick={handleConfirmTaken}
                disabled={alreadyTakenToday || takenLoading}
              >
                {alreadyTakenToday ? (
                  <>
                    <CheckCircle2 size={20} /> Sudah Minum Hari Ini
                  </>
                ) : (
                  <>
                    <Pill size={20} /> {takenLoading ? 'Menyimpan...' : 'Sudah Minum'}
                  </>
                )}
              </button>

              <div style={{ marginTop: 14 }}>
                <span
                  className="schedule-sublink"
                  onClick={() => onOpenWhatsAppSim && onOpenWhatsAppSim()}
                >
                  📲 Buka Konfirmasi via WhatsApp Bot &rarr;
                </span>
              </div>
            </div>

            {/* Riwayat Hari Ini */}
            <div className="today-history-card" style={{ margin: 0 }}>
              <div className="history-card-title">
                <Clock size={18} color="#0284c7" /> Riwayat Hari Ini
              </div>

              {alreadyTakenToday ? (
                <div className="history-item-row">
                  <div className="history-item-left">
                    <CheckCircle2 size={20} color="#10b981" />
                    <div>
                      <div className="history-item-title">
                        {patient?.schedule_time || '08:00'} Obat diminum
                      </div>
                      <div className="history-item-method">
                        Konfirmasi via WhatsApp Bot / Tombol Aplikasi
                      </div>
                    </div>
                  </div>
                  <div className="history-item-badge">Patuh</div>
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#64748b',
                  background: '#f8fafc',
                  borderRadius: 10,
                  fontSize: 13
                }}>
                  <AlertCircle size={24} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                  Belum ada konfirmasi minum obat hari ini.
                  <br />
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    Tekan tombol "Sudah Minum" di samping setelah obat ditelan.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PESAN & EDUKASI */}
      {activeTab === 'pesan' && (
        <div className="education-container" style={{ padding: 0 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Pesan & Edukasi Pasien TB</h2>
            <p style={{ fontSize: 13, color: '#64748b' }}>Informasi medis resmi Puskesmas Mekar Jaya untuk mendukung pemulihan tuntas</p>
          </div>

          {/* Filter Kategori Berbentuk Pill Tabs */}
          <div className="category-pill-row">
            {['Semua', 'TB', 'Pengobatan', 'Gizi'].map((cat) => (
              <button
                key={cat}
                className={`cat-pill-btn ${selectedCat === cat ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Daftar Artikel Edukasi Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {articles.map((art) => (
              <div
                key={art.id}
                className="article-card-item"
                onClick={() => onOpenArticle && onOpenArticle(art)}
              >
                <div className="article-meta-row">
                  <span className="article-tag">{art.category}</span>
                  <span className="article-date">{art.published_date}</span>
                </div>
                <h3 className="article-item-title">{art.title}</h3>
                <p className="article-item-summary">{art.summary}</p>
                <div className="article-item-readmore">
                  Baca Selengkapnya <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CHAT / KONSULTASI */}
      {activeTab === 'chat' && (
        <div>
          <div className="chat-window-container" style={{ height: 640 }}>
            <div className="chat-header-bar">
              <div className="chat-contact-info">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100"
                  alt="Petugas"
                  className="chat-avatar"
                />
                <div>
                  <div className="chat-name">Bu Sari, S.Kep (Perawat Koordinator TB)</div>
                  <div className="chat-status-indicator">
                    <span className="chat-status-dot" /> Online • Puskesmas Mekar Jaya
                  </div>
                </div>
              </div>
              <button
                onClick={() => alert('Menghubungi hotline TB Puskesmas: 021-889977')}
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '50%',
                  width: 38,
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                  cursor: 'pointer'
                }}
              >
                <PhoneCall size={18} />
              </button>
            </div>

            <div className="chat-messages-area">
              <div style={{
                textAlign: 'center',
                fontSize: 11,
                color: '#94a3b8',
                background: '#ffffff',
                padding: '4px 14px',
                borderRadius: 20,
                alignSelf: 'center',
                margin: '4px 0'
              }}>
                Konsultasi Medis Resmi Pasien TB DOTS
              </div>

              {chatMessages.map((msg) => {
                const isMe = msg.sender_role === 'pasien';
                return (
                  <div
                    key={msg.id}
                    className={`chat-bubble ${isMe ? 'sent' : 'received'}`}
                  >
                    {!isMe && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', marginBottom: 2 }}>
                        {msg.sender_name}
                      </div>
                    )}
                    <div>{msg.message}</div>
                    <span className="chat-time-tag">
                      {msg.created_at ? msg.created_at.slice(11, 16) : '09:15'}
                    </span>
                  </div>
                );
              })}
            </div>

            <form className="chat-input-bar" onSubmit={handleSendChat}>
              <input
                type="text"
                className="chat-text-input"
                placeholder="Konsultasikan keluhan atau efek samping obat..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="chat-send-btn">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: RIWAYAT MINUM OBAT */}
      {activeTab === 'riwayat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="weekly-calendar-card" style={{ margin: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Kalender Pemantauan Minggu Ini (Senin – Minggu)
            </h3>
            <div className="weekly-calendar-grid">
              {(adherenceData?.weeklyData || []).map((day, idx) => {
                let statusClass = 'cal-status-nodata';
                let icon = '—';
                if (day.status === 'minum') {
                  statusClass = 'cal-status-minum';
                  icon = '✓';
                } else if (day.status === 'belum_minum') {
                  statusClass = 'cal-status-belum';
                  icon = '✕';
                }
                return (
                  <div key={idx} className={`calendar-day-col ${day.isToday ? 'today' : ''}`}>
                    <span className="cal-day-name">{day.dayName}</span>
                    <span className="cal-day-num">{day.dayNum}</span>
                    <div className={`cal-status-icon-box ${statusClass}`}>
                      {icon}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="patient-data-table-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: 15 }}>
              Riwayat Kepatuhan Harian
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {(adherenceData?.allLogs || []).map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 13
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {log.scheduled_date} • Pukul {log.scheduled_time} WIB
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {log.notes || 'Konfirmasi tercatat'}
                    </div>
                  </div>
                  <div>
                    {log.status === 'minum' ? (
                      <span className="status-badge-pill patuh">
                        <CheckCircle2 size={12} /> Minum Obat
                      </span>
                    ) : (
                      <span className="status-badge-pill tidak_patuh">
                        Belum Minum
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PROFIL */}
      {activeTab === 'profil' && (
        <div className="pmo-patient-card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div className="patient-avatar-circle" style={{ width: 64, height: 64, fontSize: 24 }}>
              {patient?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                {patient?.name || 'Dika Pratama'}
              </h2>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                NIK: {patient?.nik || '3201123456780001'} • {patient?.age || 24} Tahun
              </div>
              <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 700, marginTop: 2 }}>
                Puskesmas Mekar Jaya • Program DOTS TB Nasional
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, fontSize: 13 }}>
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>No. WhatsApp Pasien</div>
              <div style={{ fontWeight: 800, marginTop: 4 }}>{patient?.phone_number || '+62 812-3456-7890'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>Pengawas Obat (PMO)</div>
              <div style={{ fontWeight: 800, marginTop: 4 }}>{patient?.pmo_name || 'Ibu Ratna'} ({patient?.pmo_relation || 'Ibu'})</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>Mulai Pengobatan</div>
              <div style={{ fontWeight: 800, marginTop: 4 }}>{patient?.start_date || '2026-10-12'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>Jadwal Minum Harian</div>
              <div style={{ fontWeight: 800, color: '#0284c7', marginTop: 4 }}>{patient?.schedule_time || '08:00'} WIB</div>
            </div>
          </div>

          <div style={{ marginTop: 20, background: '#f0f9ff', padding: 16, borderRadius: 12, border: '1px solid #bae6fd' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0369a1', marginBottom: 6 }}>
              Panduan Penting Pengobatan TB DOTS:
            </div>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
              • Jangan pernah menghentikan konsumsi obat meskipun batuk dan gejala sudah hilang.<br />
              • Pengobatan harus tuntas minimal 6 bulan (180 hari) agar kuman TB musnah sempurna.<br />
              • Hubungi petugas kami jika mengalami reaksi alergi berat atau mata berwarna kekuningan.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
