import React from 'react';
import { X, Clock, Calendar, BookOpen, Share2 } from 'lucide-react';

export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="modal-overlay-backdrop" onClick={onClose}>
      <div
        className="modal-dialog-box"
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="article-tag">{article.category}</span>
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> {article.read_time || '3 menit'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} color="#64748b" />
          </button>
        </div>

        <div className="modal-body-content">
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.35, marginBottom: 12 }}>
            {article.title}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#94a3b8', marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} /> Dipublikasikan: {article.published_date}
            </span>
            <span>• Oleh Tim Medis Puskesmas Mekar Jaya</span>
          </div>

          <div style={{
            background: '#f0f9ff',
            borderLeft: '4px solid #0284c7',
            padding: '12px 16px',
            borderRadius: '0 8px 8px 0',
            fontSize: 13,
            fontWeight: 600,
            color: '#0369a1',
            marginBottom: 20
          }}>
            {article.summary}
          </div>

          <div style={{ fontSize: 14, lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-line' }}>
            {article.content}
          </div>
        </div>

        <div className="modal-footer-bar">
          <button className="btn-outline-med" onClick={onClose}>
            Tutup
          </button>
          <button
            className="btn-primary-med"
            onClick={() => {
              alert('Artikel disalin ke tautan bagikan untuk WhatsApp keluarga.');
            }}
          >
            <Share2 size={16} /> Bagikan ke PMO
          </button>
        </div>
      </div>
    </div>
  );
}
