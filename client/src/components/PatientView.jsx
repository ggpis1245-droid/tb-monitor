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
  Info
} from 'lucide-react';

export default function PatientView({
  patient,
  onOpenArticle,
  onOpenWhatsAppSim,
  onRefreshData
}) {
  const [activeTab, setActiveTab] = useState('beranda'); // 'beranda', 'obat', 'pesan', 'chat', 'profil'
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
          particleCount: 80,
          spread: 70,
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
        // Check back after 2s for auto response
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
    <div className="patient-view-wrapper">
      {/* Tab: BERANDA */}
      {activeTab === 'beranda' && (
        <>
          {/* Header Sapaan Personal */}
          <div className="patient-header-greeting">
            <div className="greeting-text-subtitle">Program TB DOTS • Puskesmas Mekar Jaya</div>
            <h1 className="greeting-text-title">
              Halo, {patient?.name?.split(' ')[0] || 'Dika'}! Jangan lupa minum obat hari ini ya!
            </h1>
            <div className="greeting-puskesmas-tag">
              <Sparkles size={12} color="#fbbf24" /> Pengawas Obat: {patient?.pmo_name || 'Ibu Ratna'}
            </div>
          </div>

          {/* Kartu Progres Pengobatan TB */}
          <div className="treatment-progress-card">
            <div className="progress-header-row">
              <span className="progress-label-title">Progres Pengobatan TB</span>
              <span className="phase-pill-badge">Fase {patient?.phase || 'Intensif'}</span>
            </div>

            <div className="days-counter-big">
              Hari ke-{currentDay} <span>dari {totalDays}</span>
            </div>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="progress-footer-stats">
              <span>Obat diminum {currentDay}/{totalDays} hari</span>
              <span>{progressPercent}% Selesai</span>
            </div>
          </div>

          {/* Grid 4 Menu Utama */}
          <div className="patient-menu-grid">
            <div
              className="menu-action-card"
              onClick={() => setActiveTab('obat')}
            >
              <div className="menu-icon-wrapper icon-blue">
                <Clock size={22} />
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
                <BookOpen size={22} />
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
                <Calendar size={22} />
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
                <MessageCircle size={22} />
              </div>
              <div>
                <div className="menu-card-title">Kontak Petugas</div>
                <div className="menu-card-desc">Hubungi jika ada keluhan atau mual</div>
              </div>
            </div>
          </div>

          {/* Quick Reminder Card Preview */}
          <div style={{ padding: '0 16px 20px' }}>
            <div className="schedule-clock-card" style={{ margin: 0 }}>
              <div className="clock-icon-pill">
                <Pill size={28} />
              </div>
              <div className="clock-time-display">
                {patient?.schedule_time || '08:00'} Pagi
              </div>
              <div className="clock-time-sub">
                Dosis: {patient?.dosage_info || '3 Tablet FDC Kategori 1'}
              </div>

              <button
                className={`btn-taken-action ${alreadyTakenToday ? 'already-taken' : ''}`}
                onClick={handleConfirmTaken}
                disabled={alreadyTakenToday || takenLoading}
              >
                {alreadyTakenToday ? (
                  <>
                    <CheckCircle2 size={20} /> Sudah Minum Hari Ini (08:02 WIB)
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
                  Lihat detail jadwal & riwayat &rarr;
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab: OBAT (Halaman Pengingat Obat) */}
      {activeTab === 'obat' && (
        <div style={{ paddingBottom: 20 }}>
          {/* Banner Pengingat */}
          <div className="reminder-banner">
            <div className="reminder-banner-icon">
              <Bell size={20} />
            </div>
            <div>
              <div className="reminder-banner-title">Jangan lupa minum obat!</div>
              <div className="reminder-banner-desc">
                Obat TB harus diminum secara teratur setiap hari sampai selesai pengobatan (180 hari) untuk mencegah kuman kebal obat.
              </div>
            </div>
          </div>

          {/* Penunjuk Jam Jadwal Minum Obat */}
          <div className="schedule-clock-card">
            <div className="clock-icon-pill">
              <Pill size={32} />
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

            <div>
              <span
                className="schedule-sublink"
                onClick={() => onOpenWhatsAppSim && onOpenWhatsAppSim()}
              >
                📲 Buka Konfirmasi via WhatsApp Bot &rarr;
              </span>
            </div>
          </div>

          {/* Riwayat Hari Ini */}
          <div className="today-history-card">
            <div className="history-card-title">
              <Clock size={16} color="#0284c7" /> Riwayat Hari Ini
            </div>

            {alreadyTakenToday ? (
              <div className="history-item-row">
                <div className="history-item-left">
                  <CheckCircle2 size={18} color="#10b981" />
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
                padding: '14px',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: 8,
                fontSize: 13
              }}>
                <AlertCircle size={20} color="#f59e0b" style={{ margin: '0 auto 6px' }} />
                Belum ada konfirmasi minum obat hari ini.
                <br />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  Tekan tombol "Sudah Minum" di atas setelah obat ditelan.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: PESAN & EDUKASI */}
      {activeTab === 'pesan' && (
        <div className="education-container">
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Pesan & Edukasi TB</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>Informasi medis resmi untuk mempercepat kesembuhan Anda</p>
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

          {/* Daftar Artikel Edukasi */}
          <div className="article-list-stack">
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

      {/* Tab: CHAT / KONSULTASI */}
      {activeTab === 'chat' && (
        <div style={{ padding: 16 }}>
          <div className="chat-window-container">
            <div className="chat-header-bar">
              <div className="chat-contact-info">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100"
                  alt="Petugas"
                  className="chat-avatar"
                />
                <div>
                  <div className="chat-name">Bu Sari, S.Kep (Perawat TB)</div>
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
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                  cursor: 'pointer'
                }}
              >
                <PhoneCall size={16} />
              </button>
            </div>

            <div className="chat-messages-area">
              <div style={{
                textAlign: 'center',
                fontSize: 11,
                color: '#94a3b8',
                background: '#ffffff',
                padding: '4px 12px',
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

      {/* Tab: RIWAYAT MINUM OBAT */}
      {activeTab === 'riwayat' && (
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Riwayat Minum Obat</h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>Catatan harian kepatuhan konsumsi obat TB 180 hari</p>
          </div>

          <div className="weekly-calendar-card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Kalender Minggu Ini
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
                    <span className="cal-day-name">{day.dayName.slice(0, 3)}</span>
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
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 14 }}>
              Catatan 14 Hari Terakhir
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {(adherenceData?.allLogs || []).map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '12px 16px',
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

      {/* Tab: PROFIL */}
      {activeTab === 'profil' && (
        <div style={{ padding: 16 }}>
          <div className="pmo-patient-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div className="patient-avatar-circle" style={{ width: 56, height: 56, fontSize: 20 }}>
                {patient?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {patient?.name || 'Dika Pratama'}
                </h2>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  NIK: {patient?.nik || '3201123456780001'} • {patient?.age || 24} Tahun
                </div>
                <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 600 }}>
                  Fasilitas: Puskesmas Mekar Jaya (Kecamatan Mekar Jaya)
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>No. WhatsApp Pasien</div>
                <div style={{ fontWeight: 700 }}>{patient?.phone_number || '+62 812-3456-7890'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>Pengawas Obat (PMO)</div>
                <div style={{ fontWeight: 700 }}>{patient?.pmo_name || 'Ibu Ratna'} ({patient?.pmo_relation || 'Ibu'})</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>Mulai Pengobatan</div>
                <div style={{ fontWeight: 700 }}>{patient?.start_date || '2026-10-12'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>Jadwal Minum Harian</div>
                <div style={{ fontWeight: 700, color: '#0284c7' }}>{patient?.schedule_time || '08:00'} WIB</div>
              </div>
            </div>

            <div style={{ marginTop: 16, background: '#f0f9ff', padding: 14, borderRadius: 10, border: '1px solid #bae6fd' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0369a1', marginBottom: 4 }}>
                Panduan Pengobatan DOTS 6 Bulan:
              </div>
              <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                • Jangan menghentikan konsumsi obat meskipun badan sudah merasa baikan.<br />
                • Simpan obat di tempat kering terhindar dari sinar matahari langsung.<br />
                • Hubungi Bu Sari jika terdapat keluhan gatal berat atau mata kuning.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="patient-bottom-nav">
        <button
          className={`bottom-nav-item ${activeTab === 'beranda' ? 'active' : ''}`}
          onClick={() => setActiveTab('beranda')}
        >
          <Home size={18} />
          <span>Beranda</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'obat' ? 'active' : ''}`}
          onClick={() => setActiveTab('obat')}
        >
          <Pill size={18} />
          <span>Obat</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'pesan' ? 'active' : ''}`}
          onClick={() => setActiveTab('pesan')}
        >
          <BookOpen size={18} />
          <span>Pesan</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'profil' ? 'active' : ''}`}
          onClick={() => setActiveTab('profil')}
        >
          <User size={18} />
          <span>Profil</span>
        </button>
      </div>
    </div>
  );
}
