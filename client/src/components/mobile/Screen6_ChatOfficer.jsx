import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Paperclip,
  Send,
  CheckCheck,
  PhoneCall,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { getSimpusState, saveSimpusState } from '../../services/puskesmasState';
import DoctorWarningModal from './DoctorWarningModal';

export default function Screen6_ChatOfficer({ onBack, currentUser }) {
  const isOfficerOrDoctor = currentUser?.role === 'petugas' || (currentUser?.name && (currentUser.name.includes('dr.') || currentUser.name.includes('Sari')));
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  const initialSeedMessages = [
    {
      id: 1,
      sender: 'officer',
      senderName: 'dr. Sarah Anindita, Sp.KKLP',
      text: 'Halo, ada keluhan terkait obat atau efek samping yang dirasakan?',
      time: '09:12'
    },
    {
      id: 2,
      sender: 'patient',
      senderName: 'Dika Pratama',
      text: 'Iya bu, tadi malam saya mual setelah minum obat. Apakah ini normal?',
      time: '09:15'
    },
    {
      id: 3,
      sender: 'officer',
      senderName: 'Bu Sari, S.Kep',
      text: 'Mual bisa terjadi, biasanya akan berkurang setelah beberapa hari. Coba minum obat setelah makan dan minum air putih yang cukup ya.',
      time: '09:18'
    },
    {
      id: 4,
      sender: 'patient',
      senderName: 'Dika Pratama',
      text: 'Baik, terima kasih banyak bu!',
      time: '09:20'
    }
  ];

  const [messages, setMessages] = useState(() => {
    const state = getSimpusState();
    const stored = state.chatMessages || [];
    return stored.length > 0 ? [...initialSeedMessages, ...stored] : initialSeedMessages;
  });

  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const loadChatState = () => {
    const state = getSimpusState();
    const stored = state.chatMessages || [];
    setMessages(stored.length > 0 ? [...initialSeedMessages, ...stored] : initialSeedMessages);
  };

  useEffect(() => {
    window.addEventListener('simpus-state-changed', loadChatState);
    return () => window.removeEventListener('simpus-state-changed', loadChatState);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg = {
      id: Date.now(),
      sender: isOfficerOrDoctor ? 'officer' : 'patient',
      senderName: currentUser?.name || (isOfficerOrDoctor ? 'dr. Sarah Anindita' : 'Dika Pratama'),
      text: inputMsg,
      time: timeStr
    };

    // Save to global state so it persists
    const state = getSimpusState();
    if (!state.chatMessages) state.chatMessages = [];
    state.chatMessages.push(newMsg);
    saveSimpusState(state);

    setMessages((prev) => [...prev, newMsg]);
    const currentInput = inputMsg;
    setInputMsg('');

    // If patient or PMO sent a message, simulate smart response from officer
    if (!isOfficerOrDoctor) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let replyText = 'Pesan Anda sudah diterima oleh tim medis. Jika ada efek samping mengganggu, segera kabari ya.';
        const lower = currentInput.toLowerCase();
        if (lower.includes('minum') || lower.includes('jam') || lower.includes('jadwal')) {
          replyText = 'Tetap minum teratur ya di jam yang telah ditentukan dokter. Pengobatan TB tidak boleh terputus.';
        } else if (lower.includes('makasih') || lower.includes('terima kasih')) {
          replyText = 'Sama-sama! Semoga pengobatannya lancar dan lekas sembuh total ya.';
        } else if (lower.includes('mual') || lower.includes('pusing') || lower.includes('lemas')) {
          replyText = 'Baik, keluhan dicatat. Coba minum obat setelah makan dan istirahat yang cukup. Jika berlanjut akan kami jadwalkan periksa ke poli.';
        }

        const replyMsg = {
          id: Date.now() + 1,
          sender: 'officer',
          senderName: 'Bu Sari, S.Kep',
          text: replyText,
          time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
        };

        const curState = getSimpusState();
        if (!curState.chatMessages) curState.chatMessages = [];
        curState.chatMessages.push(replyMsg);
        saveSimpusState(curState);

        setMessages((prev) => [...prev, replyMsg]);
      }, 1100);
    }
  };

  return (
    <div className="tb-screen-chat">
      {/* Header matching Mockup Screen 6 */}
      <div className="tb-screen-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div className="tb-header-left">
          <button className="tb-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={
                isOfficerOrDoctor
                  ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                  : 'https://images.unsplash.com/photo-1594824813589-32247b97561f?w=150'
              }
              alt="Avatar"
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>
                {isOfficerOrDoctor ? 'Dika Pratama & Ibu Ratna' : 'Bu Sari & dr. Sarah'}
              </div>
              <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600 }}>
                {isOfficerOrDoctor ? 'Pasien TB & Keluarga • Online' : 'Petugas Puskesmas • Online'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isOfficerOrDoctor && (
            <button
              className="tb-header-right-action"
              onClick={() => setIsWarningModalOpen(true)}
              title="Kirim Peringatan Medis Resmi ke Pasien / PMO"
              style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' }}
            >
              <Bell size={17} />
            </button>
          )}

          <button
            className="tb-header-right-action"
            onClick={() => alert('Menghubungi hotline Puskesmas Mekar Jaya: +62 812-3456-7890')}
            title="Telepon Hotline"
          >
            <PhoneCall size={17} color="#2563eb" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="tb-chat-messages-container">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`tb-chat-bubble-row ${m.sender}`}
          >
            <div
              className={`tb-chat-bubble ${m.sender}`}
              style={
                m.isWarning
                  ? {
                      background: '#fff7ed',
                      border: '1.5px solid #fdba74',
                      color: '#9a3412',
                      boxShadow: '0 2px 8px rgba(234, 88, 12, 0.12)'
                    }
                  : undefined
              }
            >
              {m.isWarning && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: '#c2410c', marginBottom: 5 }}>
                  <AlertTriangle size={13} />
                  <span>PERINGATAN RESMI DOKTER</span>
                </div>
              )}
              {m.text}
            </div>
            <div className="tb-chat-time">{m.time}</div>
          </div>
        ))}

        {isTyping && (
          <div className="tb-chat-bubble-row officer">
            <div className="tb-chat-bubble officer" style={{ fontStyle: 'italic', color: '#64748b' }}>
              Petugas Puskesmas sedang mengetik...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar matching Mockup Screen 6 */}
      <form onSubmit={handleSendMessage} className="tb-chat-input-bar">
        <button
          type="button"
          className="tb-chat-clip-btn"
          onClick={() => alert('Pilih foto bukti minum obat atau hasil lab.')}
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          className="tb-chat-input-field"
          placeholder={
            isOfficerOrDoctor
              ? 'Tulis pesan / peringatan untuk pasien atau keluarga...'
              : 'Ketik pesan...'
          }
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
        />

        <button type="submit" className="tb-chat-send-btn">
          <Send size={16} />
        </button>
      </form>

      {/* Modal Peringatan Dokter inside Chat */}
      <DoctorWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        doctorName={currentUser?.name || 'dr. Sarah Anindita, Sp.KKLP'}
        patient={{ id: 1, name: 'Dika Pratama' }}
        onWarningSent={() => loadChatState()}
      />
    </div>
  );
}
