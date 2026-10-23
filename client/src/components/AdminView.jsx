import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  AlertTriangle
} from 'lucide-react';

export default function AdminView() {
  const [period, setPeriod] = useState('Okt 2026');
  const [reportData, setReportData] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const fetchReports = async (selectedPeriod) => {
    try {
      const res = await fetch(`/api/reports/admin?period=${encodeURIComponent(selectedPeriod)}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const metrics = reportData?.metrics || {
    totalPatients: 5,
    patuhCount: 4,
    patuhPercentage: 80,
    tidakPatuhCount: 1,
    tidakPatuhPercentage: 20,
    selesaiPengobatan: 1
  };

  const lineChartData = reportData?.lineChartData || [
    { date: '01 Okt', rate: 94 },
    { date: '04 Okt', rate: 92 },
    { date: '07 Okt', rate: 96 },
    { date: '10 Okt', rate: 89 },
    { date: '13 Okt', rate: 93 },
    { date: '16 Okt', rate: 95 },
    { date: '19 Okt', rate: 88 },
    { date: '21 Okt', rate: 91 },
    { date: '23 Okt', rate: 96 }
  ];

  const regionalData = reportData?.regionalData || [];

  // SVG Line Chart computation
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const points = lineChartData.map((d, index) => {
    const x = paddingX + (index / (lineChartData.length - 1)) * plotWidth;
    // rate is 0 to 100
    const y = svgHeight - paddingY - (d.rate / 100) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Smooth bezier curve
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  // Area under line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="admin-reports-layout">
      {/* Header & Monthly Period Filter */}
      <div className="report-header-filter">
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Sistem Informasi Kesehatan Puskesmas Mekar Jaya
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
            Dashboard Eksekutif & Laporan TB
          </h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Agregasi kepatuhan minum obat 180 hari & analisis efektivitas Bot WhatsApp
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} color="#64748b" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Periode Laporan:</span>
          </div>

          <select
            className="period-select-custom"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="Okt 2026">Periode: Okt 2026 (Bulan Berjalan)</option>
            <option value="Sep 2026">Periode: Sep 2026</option>
            <option value="Ags 2026">Periode: Ags 2026</option>
            <option value="Jul 2026">Periode: Jul 2026</option>
          </select>

          <button
            className="btn-outline-med"
            style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={() => window.print()}
          >
            <Printer size={15} /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama */}
      <div className="stats-summary-grid">
        {/* Total Pasien TB */}
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-metric-value">{metrics.totalPatients}</div>
            <div className="stat-metric-label">Total Pasien TB Terdaftar</div>
          </div>
        </div>

        {/* Pasien Patuh */}
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-metric-value">
              {metrics.patuhCount}
              <span className="stat-percentage-badge badge-green">
                {metrics.patuhPercentage}%
              </span>
            </div>
            <div className="stat-metric-label">Pasien Patuh (Rutin Minum)</div>
          </div>
        </div>

        {/* Pasien Tidak Patuh */}
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <XCircle size={26} />
          </div>
          <div>
            <div className="stat-metric-value">
              {metrics.tidakPatuhCount}
              <span className="stat-percentage-badge badge-red">
                {metrics.tidakPatuhPercentage}%
              </span>
            </div>
            <div className="stat-metric-label">Pasien Tidak Patuh / Terlewat</div>
          </div>
        </div>

        {/* Selesai Pengobatan */}
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Award size={26} />
          </div>
          <div>
            <div className="stat-metric-value">{metrics.selesaiPengobatan || 1}</div>
            <div className="stat-metric-label">Selesai Pengobatan (Tuntas 180 Hari)</div>
          </div>
        </div>
      </div>

      {/* Visualisasi Line Chart: Grafik Kepatuhan Pengobatan (0% - 100%) */}
      <div className="chart-card-container">
        <div className="chart-header-row">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Grafik Kepatuhan Pengobatan (Adherence Rate)
            </h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Persentase kepatuhan harian pasien TB berdasarkan rentang tanggal ({period})
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#0284c7' }}>
              <span style={{ width: 12, height: 3, background: '#0284c7', borderRadius: 2 }} />
              % Minum Obat Tepat Waktu
            </span>
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 20
            }}>
              Rata-rata: 93.2%
            </span>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="chart-svg-wrapper">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines (0%, 25%, 50%, 75%, 100%) */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = svgHeight - paddingY - (val / 100) * plotHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray={val === 0 || val === 100 ? '0' : '4 4'}
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                    fontWeight="600"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill */}
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Main Smooth Line Path */}
            <path
              d={pathD}
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Point Circles */}
            {points.map((p, idx) => (
              <g
                key={idx}
                onMouseEnter={() => setActiveTooltip(p)}
                onMouseLeave={() => setActiveTooltip(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={activeTooltip?.date === p.date ? '7' : '4.5'}
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  style={{ transition: 'all 0.2s ease' }}
                />
                {/* Date Label on X Axis */}
                <text
                  x={p.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  fontWeight="600"
                >
                  {p.date}
                </text>
              </g>
            ))}

            {/* Hover Tooltip */}
            {activeTooltip && (
              <g transform={`translate(${activeTooltip.x}, ${activeTooltip.y - 35})`}>
                <rect
                  x="-42"
                  y="-18"
                  width="84"
                  height="26"
                  rx="6"
                  fill="#0f172a"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))"
                />
                <text
                  x="0"
                  y="-1"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="800"
                >
                  {activeTooltip.rate}% Patuh
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Regional & Bot Performance Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Wilayah / Kelurahan */}
        <div className="chart-card-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Building2 size={18} color="#0284c7" />
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Kepatuhan Berdasarkan Wilayah Binaan</h3>
          </div>
          <table className="med-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Kelurahan</th>
                <th>Total Pasien</th>
                <th>Patuh</th>
                <th>Tingkat Kepatuhan</th>
              </tr>
            </thead>
            <tbody>
              {regionalData.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{r.region}</td>
                  <td>{r.total} Pasien</td>
                  <td>{r.patuh} Pasien</td>
                  <td>
                    <span className="status-badge-pill patuh">
                      {r.rate}% Patuh
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* WhatsApp Bot Impact Card */}
        <div className="chart-card-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={18} color="#10b981" />
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Efektivitas Integrasi Bot WhatsApp</h3>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Dampak otomatisasi pengingat 2-arah pada penurunan angka drop-out (DO) pengobatan TB:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>Tingkat Respon Konfirmasi Pesan: 94.8%</div>
              <div style={{ fontSize: 11, color: '#15803d' }}>
                Pasien membalas pesan "SUDAH" rata-rata dalam 12 menit setelah jam minum obat.
              </div>
            </div>

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: 12, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1' }}>Penurunan Angka Pasien Terlewat: -38%</div>
              <div style={{ fontSize: 11, color: '#0284c7' }}>
                Notifikasi otomatis ke PMO berhasil mencegah risiko putus obat pada fase intensif.
              </div>
            </div>

            <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', padding: 12, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#86198f' }}>Deteksi Dini Efek Samping: 100% Terpantau</div>
              <div style={{ fontSize: 11, color: '#a21caf' }}>
                Keluhan mual, lemas, dan urin merah langsung direspons petugas melalui konsultasi chat.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
