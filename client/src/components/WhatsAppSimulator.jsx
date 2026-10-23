import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCheck, RefreshCw, X, MessageSquare, Bell, Sparkles, CheckCircle2 } from 'lucide-react';

export default function WhatsAppSimulator({ isOpen, onClose, onAdherenceUpdated, currentPatientId = 1 }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState({ name: 'Dika Pratama', phone: '+62 812-3456-7890' });
  const messagesEndRef = useRef(null);

  // Fetch WhatsApp logs
  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/whatsapp/logs?patientId=${currentPatientId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Failed to load WhatsApp logs:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentPatientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message from Patient to Webhook
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setLoading(true);
    setInputText('');

    try {
      // Call the actual WhatsApp Webhook
      const res = await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: '+6281234567890',
          message: text
        })
      });
      const data = await res.json();

      // Refresh messages
      await fetchLogs();

      // Notify parent app to refresh adherence cards and calendar!
      if (onAdherenceUpdated) {
        onAdherenceUpdated();
      }
    } catch (err) {
      console.error('Webhook post error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger manual reminder from staff / cron to this phone
  const handleTriggerReminder = async () => {
    try {
      setLoading(true);
      await fetch('/api/whatsapp/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: currentPatientId })
      });
      await fetchLogs();
    } catch (err) {
      console.error('Error sending reminder:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wa-simulator-drawer">
      {/* WhatsApp Header */}
      <div className="wa-sim-header">
        <div className="wa-sim-contact">
          <div className="wa-avatar">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="wa-contact-title" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Bot TB Puskesmas
              <span style={{ color: '#00a884', fontSize: 13 }}>✓</span>
            </div>
            <div className="wa-contact-sub">
              WhatsApp Pasien: {patientInfo.name} ({patientInfo.phone})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={fetchLogs}
            title="Muat Ulang Pesan"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#aebac1',
              cursor: 'pointer',
              padding: 4
            }}
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onClose}
            title="Tutup Simulator"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#aebac1',
              cursor: 'pointer',
              padding: 4
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Info notice bar */}
      <div style={{
        background: '#182229',
        padding: '6px 12px',
        fontSize: 11,
        color: '#8696a0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #222e35'
      }}>
        <span>💡 Simulasi 2-Arah Bot WhatsApp & Webhook</span>
        <button
          onClick={handleTriggerReminder}
          style={{
            background: '#005c4b',
            color: '#e9edef',
            border: 'none',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 10,
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Kirim Pengingat Ulang
        </button>
      </div>

      {/* Message Body */}
      <div className="wa-messages-body">
        {messages.map((m) => {
          const isBot = m.direction === 'outgoing';
          return (
            <div
              key={m.id}
              className={`wa-bubble ${isBot ? 'bot' : 'patient'}`}
            >
              <div>{m.message}</div>
              <div className="wa-bubble-time" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                <span>{m.created_at ? m.created_at.slice(11, 16) : '08:00'}</span>
                {!isBot && <CheckCheck size={14} color="#53bdeb" />}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Chips */}
      <div className="wa-quick-replies-row">
        <button
          className="wa-chip-btn"
          onClick={() => handleSendMessage('SUDAH')}
        >
          💊 SUDAH (Konfirmasi)
        </button>
        <button
          className="wa-chip-btn"
          onClick={() => handleSendMessage('BELUM')}
        >
          ⏰ BELUM
        </button>
        <button
          className="wa-chip-btn"
          onClick={() => handleSendMessage('Bu Sari, saya merasa agak mual dan lemas')}
        >
          🤢 Lapor Keluhan Mual
        </button>
        <button
          className="wa-chip-btn"
          onClick={() => handleSendMessage('JADWAL')}
        >
          📅 Cek Jadwal
        </button>
      </div>

      {/* Input Footer */}
      <form
        className="wa-input-footer"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <input
          type="text"
          placeholder="Ketik balasan WhatsApp pasien..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          className="wa-send-btn"
          disabled={loading || !inputText.trim()}
          title="Kirim ke Webhook WhatsApp"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
