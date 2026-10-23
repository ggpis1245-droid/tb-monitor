import React, { useState } from 'react';
import {
  BookOpen,
  ShieldAlert,
  Apple,
  Ban,
  ChevronRight,
  X,
  Share2,
  Calendar
} from 'lucide-react';

export default function Screen5_Education() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ['Semua', 'TB', 'Pengobatan', 'Gizi'];

  const articlesData = [
    {
      id: 1,
      title: 'Apa itu TB?',
      desc: 'Kenali gejala, penyebab, dan cara penularan TB.',
      date: '12 Okt 2026',
      category: 'TB',
      colorClass: 'blue',
      icon: <BookOpen size={20} />,
      content: {
        intro: 'Tuberkulosis (TBC) adalah penyakit menular yang disebabkan oleh bakteri Mycobacterium tuberculosis. Bakteri ini biasanya menyerang paru-paru, namun juga dapat menyerang organ tubuh lainnya seperti tulang, kelenjar, dan selaput otak.',
        points: [
          'Gejala utama: Batuk berdahak terus-menerus selama 2 minggu atau lebih.',
          'Gejala penyerta: Demam meriang, berkeringat malam tanpa aktivitas, nafsu makan menurun, berat badan turun drastis, batuk darah.',
          'Penularan: Melalui percikan dahak (droplet) saat penderita TBC batuk atau bersin.',
          'Kabar baik: TBC BISA DISEMBUHKAN secara tuntas asalkan pasien meminum obat secara teratur hingga tuntas selama 6 bulan berturut-turut.'
        ]
      }
    },
    {
      id: 2,
      title: 'Tips Minum Obat TB',
      desc: 'Agar pengobatan berhasil dan tidak putus.',
      date: '10 Okt 2026',
      category: 'Pengobatan',
      colorClass: 'green',
      icon: <ShieldAlert size={20} />,
      content: {
        intro: 'Kepatuhan adalah kunci utama kesembuhan pasien TB. Putus obat di tengah jalan dapat menyebabkan kuman TB menjadi kebal obat (TB Resisten Obat/TB RO) yang membutuhkan waktu pengobatan jauh lebih lama (hingga 2 tahun).',
        points: [
          'Minum obat pada jam yang sama setiap hari (misal jam 08:00 pagi).',
          'Sebaiknya diminum saat perut kosong (1 jam sebelum makan atau 2 jam setelah makan).',
          'Minta anggota keluarga atau Pengawas Menelan Obat (PMO) untuk selalu mendampingi dan mengingatkan.',
          'Jika merasa mual atau urin berwarna kemerahan, itu adalah efek normal dari Rifampisin. Tetap lanjutkan obat dan konsultasikan ke dokter Puskesmas.'
        ]
      }
    },
    {
      id: 3,
      title: 'Makanan Bergizi untuk Pasien TB',
      desc: 'Dukung daya tahan tubuh selama pengobatan.',
      date: '8 Okt 2026',
      category: 'Gizi',
      colorClass: 'orange',
      icon: <Apple size={20} />,
      content: {
        intro: 'Nutrisi yang baik mempercepat regenerasi jaringan paru yang rusak dan meningkatkan efektivitas kerja obat OAT di dalam tubuh.',
        points: [
          'Tingkatkan asupan protein tinggi: Telur rebus, dada ayam, ikan kembung, tempe, tahu, dan susu.',
          'Konsumsi sayur dan buah kaya antioksidan: Bayam, brokoli, pepaya, jeruk, dan pisang.',
          'Cukupi kebutuhan cairan minimal 2-2.5 liter air putih setiap hari.',
          'Makan porsi kecil tetapi sering (4-5 kali sehari) jika masih sering merasa mual.'
        ]
      }
    },
    {
      id: 4,
      title: 'Hindari Rokok dan Alkohol',
      desc: 'Kurangi risiko efek samping dan resistensi obat.',
      date: '5 Okt 2026',
      category: 'Pengobatan',
      colorClass: 'red',
      icon: <Ban size={20} />,
      content: {
        intro: 'Asap rokok merusak silia pembersih di saluran napas dan memperparah peradangan pada alveoli paru.',
        points: [
          'Merokok melipatgandakan risiko kekambuhan TB hingga 3x lipat.',
          'Alkohol membebani fungsi hati yang sedang memproses obat OAT berat.',
          'Ciptakan rumah dengan ventilasi udara yang baik dan biarkan sinar matahari masuk ke kamar tidur.'
        ]
      }
    }
  ];

  const filteredArticles = activeCategory === 'Semua'
    ? articlesData
    : articlesData.filter((a) => a.category === activeCategory);

  return (
    <div className="tb-screen-education">
      {/* Top Header matching Mockup Screen 5 */}
      <div className="tb-screen-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="tb-header-title">Pesan & Edukasi</h2>
      </div>

      {/* Category Pills matching Mockup Screen 5 */}
      <div className="tb-edu-category-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tb-cat-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles List matching Mockup Screen 5 */}
      <div className="tb-article-cards-list">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            className="tb-article-card-item"
            onClick={() => setSelectedArticle(art)}
          >
            <div className={`tb-article-icon-wrap ${art.colorClass}`}>
              {art.icon}
            </div>
            <div className="tb-article-info">
              <div className="tb-article-title">{art.title}</div>
              <div className="tb-article-desc">{art.desc}</div>
              <div className="tb-article-date">{art.date}</div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </div>
        ))}
      </div>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="tb-modal-backdrop" onClick={() => setSelectedArticle(null)}>
          <div className="tb-bottom-drawer" style={{ maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="tb-drawer-handle" />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: 12 }}>
                {selectedArticle.category} • {selectedArticle.date}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              {selectedArticle.title}
            </h2>

            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
              {selectedArticle.content.intro}
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 20 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Poin Penting untuk Pasien:</h4>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                {selectedArticle.content.points.map((pt, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>{pt}</li>
                ))}
              </ul>
            </div>

            <button
              className="tb-btn-primary"
              onClick={() => setSelectedArticle(null)}
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
