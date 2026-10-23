import React, { useState, useEffect } from 'react';
import {
  Home,
  Pill,
  MessageSquare,
  User,
  Users,
  BarChart3
} from 'lucide-react';

import './tbMobileApp.css';

// 9 Screens Components
import Screen1_Onboarding from './components/mobile/Screen1_Onboarding';
import Screen2_RoleLogin from './components/mobile/Screen2_RoleLogin';
import Screen3_PatientDashboard from './components/mobile/Screen3_PatientDashboard';
import Screen4_MedicineReminder from './components/mobile/Screen4_MedicineReminder';
import Screen5_Education from './components/mobile/Screen5_Education';
import Screen6_ChatOfficer from './components/mobile/Screen6_ChatOfficer';
import Screen7_ComplianceTracking from './components/mobile/Screen7_ComplianceTracking';
import Screen8_OfficerDashboard from './components/mobile/Screen8_OfficerDashboard';
import Screen9_AdminDashboard from './components/mobile/Screen9_AdminDashboard';
import PmoMobileDashboard from './components/mobile/PmoMobileDashboard';

import { getSimpusState, saveSimpusState, logoutCurrentUser } from './services/puskesmasState';

export default function App() {
  const [simpusState, setSimpusState] = useState(getSimpusState());

  // Screen navigation state
  // When logged out: 'onboarding' (Screen 1) or 'login' (Screen 2)
  const [loggedOutScreen, setLoggedOutScreen] = useState('onboarding');
  const [loginInitialMode, setLoginInitialMode] = useState('select_role');

  // When logged in:
  // For Pasien: 'beranda' (Screen 3), 'reminder' (Screen 4), 'education' (Screen 5), 'chat' (Screen 6), 'compliance' (Screen 7)
  // For Petugas: 'beranda' (Screen 8), 'compliance' (Screen 7), 'chat' (Screen 6)
  // For PMO: 'beranda' (PMO Dashboard), 'compliance' (Screen 7), 'chat' (Screen 6), 'education' (Screen 5)
  // For Admin: 'beranda' (Screen 9), 'patients' (Screen 8)
  const [activeScreen, setActiveScreen] = useState('beranda');
  const [selectedPatientForTracking, setSelectedPatientForTracking] = useState(null);

  // Sync state on change
  useEffect(() => {
    const handleStateChange = () => {
      setSimpusState(getSimpusState());
    };
    window.addEventListener('simpus-state-changed', handleStateChange);
    return () => window.removeEventListener('simpus-state-changed', handleStateChange);
  }, []);

  const currentUser = simpusState.activeUser;
  const currentRole = currentUser?.role || 'pasien';

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    const updated = { ...simpusState, activeUser: userData };
    saveSimpusState(updated);
    setActiveScreen('beranda');
  };

  // Handle logout
  const handleLogout = () => {
    logoutCurrentUser();
    setLoggedOutScreen('onboarding');
    setActiveScreen('beranda');
  };

  return (
    <div className="tb-app-main-wrapper">
      <div className="tb-app-main-container">
        {/* Scrollable Screen Content Viewport */}
        <div className="tb-screen-viewport">
          {/* =========================================================
              FLOW 1: USER NOT LOGGED IN
              ========================================================= */}
          {!currentUser ? (
            loggedOutScreen === 'onboarding' ? (
              /* SCREEN 1: Onboarding with Lungs illustration */
              <Screen1_Onboarding
                onNavigateToLogin={() => {
                  setLoginInitialMode('select_role');
                  setLoggedOutScreen('login');
                }}
                onNavigateToRegister={() => {
                  setLoginInitialMode('register');
                  setLoggedOutScreen('login');
                }}
              />
            ) : (
              /* SCREEN 2: Pilih Role / Login with Password */
              <Screen2_RoleLogin
                initialMode={loginInitialMode}
                onBack={() => setLoggedOutScreen('onboarding')}
                onLoginSuccess={handleLoginSuccess}
              />
            )
          ) : (
            /* =========================================================
               FLOW 2: USER LOGGED IN (ROLE ISOLATED)
               ========================================================= */
            <>
              {/* ----------------- ROLE 1: PASIEN TB ----------------- */}
              {currentRole === 'pasien' && (
                <>
                  {activeScreen === 'beranda' && (
                    /* SCREEN 3: Dashboard Pasien */
                    <Screen3_PatientDashboard
                      currentUser={currentUser}
                      adherenceDay={12}
                      totalDays={180}
                      onOpenReminder={() => setActiveScreen('reminder')}
                      onOpenEducation={() => setActiveScreen('education')}
                      onOpenCompliance={() => {
                        setSelectedPatientForTracking(null);
                        setActiveScreen('compliance');
                      }}
                      onOpenChat={() => setActiveScreen('chat')}
                      onLogout={handleLogout}
                    />
                  )}

                  {activeScreen === 'reminder' && (
                    /* SCREEN 4: Pengingat Obat (Sesuai Jam dari Dokter) */
                    <Screen4_MedicineReminder
                      onBack={() => setActiveScreen('beranda')}
                      patientId={currentUser?.id || 1}
                      onAdherenceUpdated={() => {}}
                    />
                  )}

                  {activeScreen === 'education' && (
                    /* SCREEN 5: Pesan & Edukasi TB */
                    <Screen5_Education />
                  )}

                  {activeScreen === 'chat' && (
                    /* SCREEN 6: Chat / Konsultasi Bu Sari & dr. Sarah */
                    <Screen6_ChatOfficer
                      onBack={() => setActiveScreen('beranda')}
                      currentUser={currentUser}
                    />
                  )}

                  {activeScreen === 'compliance' && (
                    /* SCREEN 7: Riwayat Kepatuhan Pasien */
                    <Screen7_ComplianceTracking
                      onBack={() => setActiveScreen('beranda')}
                      currentUser={currentUser}
                      patientData={null}
                    />
                  )}
                </>
              )}

              {/* ------------ ROLE 2: KELUARGA / PMO ------------ */}
              {currentRole === 'pmo' && (
                <>
                  {activeScreen === 'beranda' && (
                    <PmoMobileDashboard
                      currentUser={currentUser}
                      onOpenCompliance={() => setActiveScreen('compliance')}
                      onOpenChat={() => setActiveScreen('chat')}
                      onOpenEducation={() => setActiveScreen('education')}
                      onLogout={handleLogout}
                    />
                  )}

                  {activeScreen === 'compliance' && (
                    /* SCREEN 7: Riwayat Kepatuhan */
                    <Screen7_ComplianceTracking
                      onBack={() => setActiveScreen('beranda')}
                      currentUser={currentUser}
                      patientData={null}
                    />
                  )}

                  {activeScreen === 'chat' && (
                    /* SCREEN 6: Chat Petugas */
                    <Screen6_ChatOfficer
                      onBack={() => setActiveScreen('beranda')}
                      currentUser={currentUser}
                    />
                  )}

                  {activeScreen === 'education' && (
                    /* SCREEN 5: Edukasi TB */
                    <Screen5_Education />
                  )}
                </>
              )}

              {/* --------- ROLE 3: PETUGAS KESEHATAN (BU SARI) --------- */}
              {currentRole === 'petugas' && (
                <>
                  {activeScreen === 'beranda' && (
                    /* SCREEN 8: Dashboard Petugas Puskesmas */
                    <Screen8_OfficerDashboard
                      currentUser={currentUser}
                      onSelectPatient={(patient) => {
                        setSelectedPatientForTracking(patient);
                        setActiveScreen('compliance');
                      }}
                      onOpenChat={() => setActiveScreen('chat')}
                      onLogout={handleLogout}
                    />
                  )}

                  {activeScreen === 'compliance' && (
                    /* SCREEN 7: Tracking Kepatuhan Pasien Tertentu */
                    <Screen7_ComplianceTracking
                      onBack={() => setActiveScreen('beranda')}
                      currentUser={currentUser}
                      patientData={selectedPatientForTracking}
                    />
                  )}

                  {activeScreen === 'chat' && (
                    /* SCREEN 6: Chat Konsultasi */
                    <Screen6_ChatOfficer
                      onBack={() => setActiveScreen('beranda')}
                      currentUser={currentUser}
                    />
                  )}
                </>
              )}

              {/* -------------- ROLE 4: ADMIN PUSKESMAS -------------- */}
              {currentRole === 'admin' && (
                <>
                  {activeScreen === 'beranda' && (
                    /* SCREEN 9: Tampilan Dashboard Admin Puskesmas (Grafik Kurva) */
                    <Screen9_AdminDashboard
                      currentUser={currentUser}
                      onOpenPatientList={() => setActiveScreen('patients')}
                      onLogout={handleLogout}
                    />
                  )}

                  {activeScreen === 'patients' && (
                    <Screen8_OfficerDashboard
                      currentUser={currentUser}
                      onSelectPatient={(patient) => {
                        setSelectedPatientForTracking(patient);
                        setActiveScreen('compliance');
                      }}
                      onOpenChat={() => setActiveScreen('chat')}
                      onLogout={handleLogout}
                    />
                  )}

                  {activeScreen === 'compliance' && (
                    <Screen7_ComplianceTracking
                      onBack={() => setActiveScreen('patients')}
                      currentUser={currentUser}
                      patientData={selectedPatientForTracking}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* =========================================================
            BOTTOM NAVIGATION BAR (Shown when logged in)
            Matching Mockup Screen 3, 5, 8, 9
            ========================================================= */}
        {currentUser && (
          <nav className="tb-bottom-nav">
            {/* Beranda Tab */}
            <button
              className={`tb-nav-item ${activeScreen === 'beranda' ? 'active' : ''}`}
              onClick={() => setActiveScreen('beranda')}
            >
              <Home size={20} />
              <span>Beranda</span>
            </button>

            {/* Role specific 2nd & 3rd tabs */}
            {currentRole === 'pasien' && (
              <>
                <button
                  className={`tb-nav-item ${activeScreen === 'reminder' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('reminder')}
                >
                  <Pill size={20} />
                  <span>Obat</span>
                </button>

                <button
                  className={`tb-nav-item ${activeScreen === 'education' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('education')}
                >
                  <MessageSquare size={20} />
                  <span>Pesan</span>
                </button>
              </>
            )}

            {currentRole === 'petugas' && (
              <>
                <button
                  className={`tb-nav-item ${activeScreen === 'compliance' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPatientForTracking(null);
                    setActiveScreen('compliance');
                  }}
                >
                  <Users size={20} />
                  <span>Pasien</span>
                </button>

                <button
                  className={`tb-nav-item ${activeScreen === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('chat')}
                >
                  <MessageSquare size={20} />
                  <span>Chat</span>
                </button>
              </>
            )}

            {currentRole === 'pmo' && (
              <>
                <button
                  className={`tb-nav-item ${activeScreen === 'compliance' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('compliance')}
                >
                  <Users size={20} />
                  <span>Dampingan</span>
                </button>

                <button
                  className={`tb-nav-item ${activeScreen === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('chat')}
                >
                  <MessageSquare size={20} />
                  <span>Chat Nakes</span>
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <button
                  className={`tb-nav-item ${activeScreen === 'patients' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('patients')}
                >
                  <Users size={20} />
                  <span>Pasien</span>
                </button>

                <button
                  className={`tb-nav-item ${activeScreen === 'beranda' ? 'active' : ''}`}
                  onClick={() => setActiveScreen('beranda')}
                >
                  <BarChart3 size={20} />
                  <span>Laporan</span>
                </button>
              </>
            )}

            {/* Profil / Logout Tab */}
            <button
              className="tb-nav-item"
              onClick={handleLogout}
              title="Keluar / Ganti Akun"
            >
              <User size={20} />
              <span>Profil</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
