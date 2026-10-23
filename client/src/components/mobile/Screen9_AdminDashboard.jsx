import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  LogOut,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export default function Screen9_AdminDashboard({
  currentUser,
  onOpenPatientList,
  onLogout
}) {
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Data points matching mockup chart (1 Okt -> 31 Okt)
  const chartPoints = [
    { label: '1 Okt', val: 32, x: 30, y: 130 },
    { label: '8 Okt', val: 45, x: 95, y: 110 },
    { label: '15 Okt', val: 58, x: 160, y: 88 },
    { label: '22 Okt', val: 68, x: 225, y: 68 },
    { label: '31 Okt', val: 79, x: 290, y: 50 }
  ];

  return (
    <div className="tb-screen-admin">
      {/* Header Row matching Mockup Screen 9 */}
      <div className="tb-admin-header-row">
        <h2>Dashboard Puskesmas</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="tb-period-badge">
            <Calendar size={13} />
            <span>Periode: Okt 2026</span>
          </div>

          <button
            className="tb-header-right-action"
            onClick={onLogout}
            title="Keluar / Logout Akun Admin"
          >
            <LogOut size={18} color="#dc2626" />
          </button>
        </div>
      </div>

      {/* 4 Summary Stats Cards (2x2 Grid) matching Mockup Screen 9 */}
      <div className="tb-stats-grid-2x2">
        {/* Total Pasien TB */}
        <div className="tb-stat-card">
          <div className="tb-stat-icon-box blue">
            <Users size={20} />
          </div>
          <div className="tb-stat-info">
            <span className="tb-stat-label">Total Pasien TB</span>
            <span className="tb-stat-val">48</span>
          </div>
        </div>

        {/* Pasien Patuh */}
        <div className="tb-stat-card">
          <div className="tb-stat-icon-box green">
            <CheckCircle2 size={20} />
          </div>
          <div className="tb-stat-info">
            <span className="tb-stat-label">Pasien Patuh</span>
            <span className="tb-stat-val" style={{ color: '#16a34a' }}>38 (79%)</span>
          </div>
        </div>

        {/* Pasien Tidak Patuh */}
        <div className="tb-stat-card">
          <div className="tb-stat-icon-box red">
            <AlertTriangle size={20} />
          </div>
          <div className="tb-stat-info">
            <span className="tb-stat-label">Pasien Tidak Patuh</span>
            <span className="tb-stat-val" style={{ color: '#dc2626' }}>10 (21%)</span>
          </div>
        </div>

        {/* Selesai Pengobatan */}
        <div className="tb-stat-card">
          <div className="tb-stat-icon-box purple">
            <Award size={20} />
          </div>
          <div className="tb-stat-info">
            <span className="tb-stat-label">Selesai Pengobatan</span>
            <span className="tb-stat-val" style={{ color: '#7c3aed' }}>6 (13%)</span>
          </div>
        </div>
      </div>

      {/* Section: Grafik Kepatuhan Pengobatan matching Mockup Screen 9 */}
      <div className="tb-chart-card">
        <div className="tb-chart-header">Grafik Kepatuhan Pengobatan</div>

        <div className="tb-svg-chart-container">
          <svg viewBox="0 0 320 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Horizontal Grid lines at 100%, 75%, 50%, 25%, 0% */}
            <g stroke="#f1f5f9" strokeWidth="1">
              {/* 100% */}
              <line x1="30" y1="20" x2="310" y2="20" strokeDasharray="3,3" />
              <text x="5" y="24" fill="#94a3b8" fontSize="10" fontWeight="600">100%</text>

              {/* 75% */}
              <line x1="30" y1="55" x2="310" y2="55" strokeDasharray="3,3" />
              <text x="10" y="59" fill="#94a3b8" fontSize="10" fontWeight="600">75%</text>

              {/* 50% */}
              <line x1="30" y1="90" x2="310" y2="90" strokeDasharray="3,3" />
              <text x="10" y="94" fill="#94a3b8" fontSize="10" fontWeight="600">50%</text>

              {/* 25% */}
              <line x1="30" y1="125" x2="310" y2="125" strokeDasharray="3,3" />
              <text x="10" y="129" fill="#94a3b8" fontSize="10" fontWeight="600">25%</text>

              {/* 0% */}
              <line x1="30" y1="160" x2="310" y2="160" />
              <text x="16" y="163" fill="#94a3b8" fontSize="10" fontWeight="600">0%</text>
            </g>

            {/* Area Fill under curve */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <path
              d="M 30,130 L 95,110 L 160,88 L 225,68 L 290,50 L 290,160 L 30,160 Z"
              fill="url(#chartGradient)"
            />

            {/* Smooth Line Curve */}
            <path
              d="M 30,130 L 95,110 L 160,88 L 225,68 L 290,50"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points & Interactive Tooltip */}
            {chartPoints.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="3"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setSelectedPoint(pt)}
                />
                <text
                  x={pt.x}
                  y="176"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="600"
                >
                  {pt.label}
                </text>
              </g>
            ))}

            {selectedPoint && (
              <g transform={`translate(${selectedPoint.x - 22}, ${selectedPoint.y - 30})`}>
                <rect width="44" height="20" rx="6" fill="#0f172a" />
                <text x="22" y="14" fill="#ffffff" fontSize="10.5" fontWeight="700" textAnchor="middle">
                  {selectedPoint.val}%
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
