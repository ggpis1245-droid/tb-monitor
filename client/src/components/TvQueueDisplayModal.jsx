import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Maximize2,
  Minimize2,
  Clock,
  Building2,
  Activity,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { POLI_LIST } from '../services/puskesmasState';
import { announceQueueCall, playHospitalChime } from '../services/soundEffects';

export default function TvQueueDisplayModal({ isOpen, onClose, queues = [] }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleTestCall = (poli, ticket) => {
    announceQueueCall(ticket.queueNumber, poli.name, poli.room);
  };

  const dateFormatted = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const timeFormatted = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="simpus-tv-overlay">
      {/* Top Header of TV Display */}
      <header className="tv-header-bar">
        <div className="tv-brand-info">
          <div className="tv-logo-circle">
            <Building2 size={28} />
          </div>
          <div>
            <div className="tv-clinic-name">PUSKESMAS MEKAR JAYA</div>
            <div className="tv-clinic-sub">LAYAR ANTREAN PASIEN POLIKLINIK TERPADU</div>
          </div>
        </div>

        {/* Center Live Clock */}
        <div className="tv-clock-center">
          <div className="tv-date-text">{dateFormatted}</div>
          <div className="tv-time-digits">{timeFormatted} WIB</div>
        </div>

        {/* Right Action Controls */}
        <div className="tv-right-controls">
          <button
            className="tv-ctrl-btn"
            onClick={() => playHospitalChime()}
            title="Bunyikan Nada Antrean"
          >
            <Volume2 size={18} />
            <span>Tes Bell</span>
          </button>
          <button
            className="tv-ctrl-btn"
            onClick={toggleFullscreen}
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            <span>{isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}</span>
          </button>
          <button
            className="tv-ctrl-btn tv-close-btn"
            onClick={onClose}
            title="Kembali ke Dashboard"
          >
            <X size={20} />
            <span>Tutup</span>
          </button>
        </div>
      </header>

      {/* Main Grid: 5 Poli Waiting Monitors */}
      <main className="tv-display-grid">
        {POLI_LIST.map((poli) => {
          // Find currently called or active ticket for this poli
          const activeTicket = queues.find(
            (q) => q.poliId === poli.id && (q.status === 'dipanggil' || q.status === 'sedang_diperiksa')
          );
          // Find next waiting tickets
          const waitingTickets = queues.filter(
            (q) => q.poliId === poli.id && q.status === 'menunggu'
          );

          const isCalling = activeTicket?.status === 'dipanggil';

          return (
            <div
              key={poli.id}
              className={`tv-poli-card ${isCalling ? 'tv-card-calling' : ''}`}
              style={{ borderTopColor: poli.badgeColor }}
            >
              {/* Poli Banner */}
              <div className="tv-poli-header" style={{ background: `${poli.badgeColor}15` }}>
                <div>
                  <span className="tv-code-badge" style={{ background: poli.badgeColor }}>
                    POLI {poli.code}
                  </span>
                  <h3 className="tv-poli-title">{poli.name}</h3>
                </div>
                <div className="tv-room-tag">{poli.room}</div>
              </div>

              {/* Big Queue Number */}
              <div className="tv-queue-hero">
                <div className="tv-status-badge">
                  {isCalling ? (
                    <span className="calling-pulse-text">
                      <Volume2 size={14} className="pulse-icon" /> SEDANG DIPANGGIL
                    </span>
                  ) : activeTicket ? (
                    <span className="examining-text">SEDANG DIPERIKSA</span>
                  ) : (
                    <span className="standby-text">MENUNGGU PANGGILAN</span>
                  )}
                </div>

                <div className="tv-number-box">
                  {activeTicket ? (
                    <span className="tv-big-number" style={{ color: poli.badgeColor }}>
                      {activeTicket.queueNumber}
                    </span>
                  ) : waitingTickets.length > 0 ? (
                    <span className="tv-big-number tv-standby-num">
                      {waitingTickets[0].queueNumber}
                    </span>
                  ) : (
                    <span className="tv-big-number tv-empty-num">---</span>
                  )}
                </div>

                <div className="tv-patient-subname">
                  {activeTicket
                    ? `Pasien: ${activeTicket.patientName}`
                    : waitingTickets.length > 0
                    ? `Antrean Berikutnya: ${waitingTickets[0].patientName}`
                    : 'Tidak ada antrean'}
                </div>

                {activeTicket && (
                  <button
                    className="tv-test-audio-btn"
                    onClick={() => handleTestCall(poli, activeTicket)}
                  >
                    <Volume2 size={13} /> Putar Ulang Panggilan Suara
                  </button>
                )}
              </div>

              {/* Waiting List Footer */}
              <div className="tv-waiting-footer">
                <div className="tv-waiting-label">
                  <span>Antrean Menunggu:</span>
                  <span className="tv-waiting-count">{waitingTickets.length} Pasien</span>
                </div>
                <div className="tv-waiting-chips">
                  {waitingTickets.slice(0, 4).map((wt) => (
                    <span key={wt.id} className="tv-wait-chip">
                      {wt.queueNumber}
                    </span>
                  ))}
                  {waitingTickets.length > 4 && (
                    <span className="tv-wait-more">+{waitingTickets.length - 4} lagi</span>
                  )}
                  {waitingTickets.length === 0 && (
                    <span className="tv-wait-empty">Ruang tunggu kosong</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Health News & Announcement Ticker */}
      <footer className="tv-ticker-bar">
        <div className="tv-ticker-label">
          <Sparkles size={16} /> INFO KESEHATAN PUSKESMAS
        </div>
        <div className="tv-ticker-wrapper">
          <div className="tv-ticker-content">
            📢 <strong>Puskesmas Mekar Jaya Melayani:</strong> Pemeriksaan Umum, Poli Gigi, Poli KIA/KB, Laboratorium, dan Klinik Khusus TB Paru (Program DOTS 180 Hari Tuntas Bebas Biaya).
            &nbsp;•&nbsp; 
            💊 <strong>Etika Batuk & Masker:</strong> Gunakan masker dan terapkan etika batuk menutup hidung/mulut dengan lengan baju bagian dalam demi kenyamanan bersama.
            &nbsp;•&nbsp; 
            🩺 <strong>Pasien BPJS Kesehatan:</strong> Pastikan Anda telah mengambil nomor antrean online dan menyiapkan kartu KIS / e-KTP di loket pendaftaran.
          </div>
        </div>
      </footer>
    </div>
  );
}
