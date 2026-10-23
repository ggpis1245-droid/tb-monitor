import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Activity,
  Users,
  ShieldCheck,
  Smartphone,
  Monitor,
  MessageSquare,
  Sparkles,
  Info,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

import OnboardingModal from './components/OnboardingModal';
import WhatsAppSimulator from './components/WhatsAppSimulator';
import ArticleModal from './components/ArticleModal';
import NewPatientModal from './components/NewPatientModal';
import PatientView from './components/PatientView';
import PmoView from './components/PmoView';
import OfficerView from './components/OfficerView';
import AdminView from './components/AdminView';

export default function App() {
  const [currentRole, setCurrentRole] = useState('pasien'); // 'pasien', 'pmo', 'petugas', 'admin'
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' | 'desktop'
  const [patient, setPatient] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isWaSimOpen, setIsWaSimOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch initial patient data (Dika Pratama - Patient ID 1)
  const fetchPatientData = async () => {
    try {
      const res = await fetch('/api/patients/1');
      const data = await res.json();
      if (data.success && data.data) {
        setPatient(data.data);
      }
    } catch (err) {
      console.error('Failed to load patient data:', err);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [refreshTrigger]);

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    // If switching to Petugas or Admin, default view mode to desktop for optimal dashboard view
    if (role === 'petugas' || role === 'admin') {
      setViewMode('desktop');
    } else {
      setViewMode('mobile');
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-main-layout">
      {/* Top Application Bar */}
      <header className="app-topbar">
        {/* Brand */}
        <div className="topbar-brand">
          <div className="brand-icon-wrap">
            <Stethoscope size={22} />
          </div>
          <div>
            <div className="brand-title">TB Monitor & Bot WhatsApp</div>
            <div className="brand-subtitle">Puskesmas Mekar Jaya • DOTS TB</div>
          </div>
        </div>

        {/* Multi-Role Switcher (4 Roles) */}
        <div className="topbar-center-pills">
          <button
            className={`role-pill-btn ${currentRole === 'pasien' ? 'active' : ''}`}
            onClick={() => handleRoleChange('pasien')}
          >
            <Activity size={15} />
            <span>Pasien TB (Dika)</span>
          </button>

          <button
            className={`role-pill-btn ${currentRole === 'pmo' ? 'active' : ''}`}
            onClick={() => handleRoleChange('pmo')}
          >
            <Users size={15} />
            <span>Keluarga / PMO</span>
          </button>

          <button
            className={`role-pill-btn ${currentRole === 'petugas' ? 'active' : ''}`}
            onClick={() => handleRoleChange('petugas')}
          >
            <Stethoscope size={15} />
            <span>Petugas Kesehatan</span>
          </button>

          <button
            className={`role-pill-btn ${currentRole === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            <ShieldCheck size={15} />
            <span>Admin Puskesmas</span>
          </button>
        </div>

        {/* Right Actions: View Mode Switcher, WhatsApp Launcher & Onboarding */}
        <div className="topbar-right-actions">
          {/* View Mode Toggle: Smartphone vs Desktop */}
          <div className="view-mode-toggle" title="Ubah tampilan ukuran">
            <button
              className={`view-mode-btn ${viewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone size={14} /> Mobile
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewMode('desktop')}
            >
              <Monitor size={14} /> Desktop
            </button>
          </div>

          {/* Onboarding Dialog Button */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#0284c7',
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer'
            }}
          >
            <Info size={14} /> Info / Masuk
          </button>

          {/* WhatsApp Bot Simulator Trigger Button */}
          <button
            className="wa-simulator-launcher-btn"
            onClick={() => setIsWaSimOpen(!isWaSimOpen)}
            title="Buka Simulator Balasan WhatsApp Pasien"
          >
            <MessageSquare size={16} />
            <span>📱 Bot WhatsApp</span>
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="app-viewport-wrapper">
        {viewMode === 'mobile' ? (
          /* Smartphone Frame Simulator Container */
          <div className="mobile-frame-container">
            {/* Top Phone Speaker / Notch */}
            <div className="phone-speaker-notch">
              <div className="phone-camera-dot" />
            </div>

            {/* Simulated Phone Status Bar */}
            <div className="phone-status-bar">
              <span>08:00</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={13} />
              </div>
            </div>

            {/* Inner Content based on active role */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {currentRole === 'pasien' && (
                <PatientView
                  patient={patient}
                  onOpenArticle={(art) => setActiveArticle(art)}
                  onOpenWhatsAppSim={() => setIsWaSimOpen(true)}
                  onRefreshData={triggerRefresh}
                />
              )}

              {currentRole === 'pmo' && (
                <PmoView
                  patient={patient}
                  onOpenWhatsAppSim={() => setIsWaSimOpen(true)}
                  onRefreshData={triggerRefresh}
                />
              )}

              {currentRole === 'petugas' && (
                <div style={{ padding: 14 }}>
                  <OfficerView
                    onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
                    onOpenWhatsAppSim={() => setIsWaSimOpen(true)}
                    onSelectPatient={(p) => {
                      setPatient(p);
                      setCurrentRole('pasien');
                    }}
                    onRefreshTrigger={refreshTrigger}
                  />
                </div>
              )}

              {currentRole === 'admin' && (
                <div style={{ padding: 14 }}>
                  <AdminView />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Full Desktop / Wide Layout Container */
          <div className="desktop-view-container">
            {currentRole === 'pasien' && (
              <div style={{ maxWidth: 650, margin: '0 auto', background: '#ffffff', borderRadius: 24, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <PatientView
                  patient={patient}
                  onOpenArticle={(art) => setActiveArticle(art)}
                  onOpenWhatsAppSim={() => setIsWaSimOpen(true)}
                  onRefreshData={triggerRefresh}
                />
              </div>
            )}

            {currentRole === 'pmo' && (
              <div style={{ maxWidth: 850, margin: '0 auto' }}>
                <PmoView
                  patient={patient}
                  onOpenWhatsAppSim={() => setIsWaSimOpen(true)}
                  onRefreshData={triggerRefresh}
                />
              </div>
            )}

            {currentRole === 'petugas' && (
              <OfficerView
                onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
                onOpenWhatsAppSim={() => setIsWaSimOpen(true)}
                onSelectPatient={(p) => {
                  setPatient(p);
                  setCurrentRole('pasien');
                }}
                onRefreshTrigger={refreshTrigger}
              />
            )}

            {currentRole === 'admin' && (
              <AdminView />
            )}
          </div>
        )}
      </main>

      {/* WhatsApp Bot Interactive Floating Simulator */}
      <WhatsAppSimulator
        isOpen={isWaSimOpen}
        onClose={() => setIsWaSimOpen(false)}
        currentPatientId={patient?.id || 1}
        onAdherenceUpdated={triggerRefresh}
      />

      {/* Onboarding & Medical Lungs Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSelectRole={handleRoleChange}
      />

      {/* Educational Article Reader Modal */}
      <ArticleModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />

      {/* New Patient Registration Form Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onPatientCreated={() => {
          triggerRefresh();
        }}
      />
    </div>
  );
}
