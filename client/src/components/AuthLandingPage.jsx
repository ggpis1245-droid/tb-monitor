import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Building2,
  ShieldCheck,
  User,
  Stethoscope,
  Users,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Ticket,
  FileText,
  Pill,
  Tv,
  CheckCircle2,
  HeartPulse,
  Clock,
  Activity,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { loginUser, registerNewUser } from '../services/puskesmasState';

export default function AuthLandingPage({
  onLoginSuccess,
  onOpenTvQueue,
  onOpenWhatsAppSim
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);

  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('dika@pasien.id');
  const [loginPassword, setLoginPassword] = useState('123');
  const [loginError, setLoginError] = useState('');
  const [demoHintMsg, setDemoHintMsg] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('pasien');
  const [regError, setRegError] = useState('');

  // Helper to fill demo account credentials into the form (Strict verification still applies!)
  const handleFillDemoAccount = (name, email, roleName) => {
    setLoginIdentifier(email);
    setLoginPassword('123');
    setLoginError('');
    setDemoHintMsg(`Kredensial ${name} (${roleName}) telah diisikan ke form. Klik "Masuk ke Dashboard" di atas untuk verifikasi sandi.`);
  };

  // Submit Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    setDemoHintMsg('');

    if (!loginIdentifier.trim()) {
      setLoginError('Harap masukkan Email, Username, atau NIK Anda.');
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError('Harap masukkan Kata Sandi Anda.');
      return;
    }

    const res = loginUser(loginIdentifier, loginPassword);
    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onLoginSuccess(res.user);
    } else {
      setLoginError(res.message || 'Kredensial tidak valid. Silakan coba kembali.');
    }
  };

  // Submit Register
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Nama Lengkap dan Email wajib diisi.');
      return;
    }

    const res = registerNewUser({
      name: regName,
      nik: regNik,
      email: regEmail,
      phone: regPhone,
      password: regPassword || '123',
      role: regRole
    });

    if (res.success) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onLoginSuccess(res.user);
    } else {
      setRegError('Pendaftaran gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="auth-landing-root">
      {/* Top Welcome Header */}
      <header className="auth-landing-topbar">
        <div className="landing-brand-area">
          <div className="landing-brand-icon">
            <Building2 size={26} />
          </div>
          <div>
            <div className="landing-brand-name">SIMPus Terpadu</div>
            <div className="landing-brand-sub">Puskesmas Mekar Jaya • Portal Pelayanan Kesehatan Digital</div>
          </div>
        </div>

        <div className="landing-header-actions">
          <button
            className="landing-tv-btn"
            onClick={onOpenTvQueue}
            title="Buka Layar Monitor Antrean Ruang Tunggu"
          >
            <Tv size={15} />
            <span>Layar Antrean TV</span>
          </button>

          <button
            className="landing-wa-btn"
            onClick={onOpenWhatsAppSim}
            title="Buka Simulator WhatsApp Pasien"
          >
            <MessageSquare size={15} />
            <span>📱 Bot WhatsApp</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Auth Split Layout */}
      <main className="auth-hero-section">
        <div className="auth-hero-container">
          {/* Left Column: Visual Introduction & Hospital Info */}
          <div className="auth-intro-column">
            <div className="auth-intro-badge">
              <Sparkles size={14} /> Faskes Tingkat 1 BPJS Kesehatan • Terintegrasi SatuSehat
            </div>

            <h1 className="auth-hero-headline">
              Sistem Informasi Manajemen <br />
              <span className="text-highlight-cyan">Puskesmas Terpadu</span>
            </h1>

            <p className="auth-hero-description">
              Akses layanan kesehatan digital lengkap berbasis peran (RBAC): pendaftaran antrean online mandiri untuk pasien, rekam medis elektronik (RME) dokter, stok farmasi, dan pendampingan kepatuhan minum obat oleh PMO.
            </p>

            {/* Quick Value Points */}
            <div className="auth-features-list">
              <div className="auth-feat-item">
                <div className="feat-icon-box bg-blue-subtle">
                  <Ticket size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="feat-title">Antrean Online Tanpa Antre Subuh</h4>
                  <p className="feat-desc">Dapatkan nomor antrean digital langsung dari rumah dengan estimasi waktu akurat.</p>
                </div>
              </div>

              <div className="auth-feat-item">
                <div className="feat-icon-box bg-teal-subtle">
                  <FileText size={20} className="text-teal" />
                </div>
                <div>
                  <h4 className="feat-title">Rekam Medis Elektronik (RME ICD-10)</h4>
                  <p className="feat-desc">Pencatatan klinis, tanda vital, IMT otomatis, dan e-resep farmasi terstandarisasi.</p>
                </div>
              </div>

              <div className="auth-feat-item">
                <div className="feat-icon-box bg-emerald-subtle">
                  <Pill size={20} className="text-emerald" />
                </div>
                <div>
                  <h4 className="feat-title">Pengawasan Obat TB & Bot WhatsApp</h4>
                  <p className="feat-desc">Pendampingan harian PMO terpadu dengan integrasi konfirmasi minum obat WhatsApp.</p>
                </div>
              </div>
            </div>

            {/* Hotline 24 Jam */}
            <div className="landing-hotline-strip">
              <Phone size={18} className="text-rose-500" />
              <span>Layanan Darurat & Konsultasi Nakes: <strong>(021) 876-5432</strong> / WhatsApp <strong>0812-3456-7890</strong></span>
            </div>
          </div>

          {/* Right Column: Interactive Login & Register Card */}
          <div className="auth-card-column">
            <div className="auth-glassmorphic-card">
              {/* Tab Selector: MASUK vs DAFTAR */}
              <div className="auth-tab-switch-header">
                <button
                  type="button"
                  className={`auth-tab-choice ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  <User size={16} />
                  <span>Masuk Akun</span>
                </button>

                <button
                  type="button"
                  className={`auth-tab-choice ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthMode('register')}
                >
                  <Sparkles size={16} />
                  <span>Daftar Akun Baru</span>
                </button>
              </div>

              {/* ----------------------------------------------------------------
                  MODE 1: FORM MASUK (LOGIN)
                  ---------------------------------------------------------------- */}
              {authMode === 'login' && (
                <div className="auth-form-wrapper">
                  <div className="auth-form-headline">
                    <h2 className="auth-box-title">Selamat Datang Kembali</h2>
                    <p className="auth-box-sub">Silakan masukkan akun Anda untuk masuk ke dashboard peran</p>
                  </div>

                  {loginError && (
                    <div className="auth-error-alert">
                      <AlertCircle size={16} />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {demoHintMsg && (
                    <div className="auth-info-alert">
                      <CheckCircle2 size={16} />
                      <span>{demoHintMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="auth-form-body">
                    {/* Email / Username / NIK */}
                    <div className="auth-field-row">
                      <label className="auth-field-label">Email / Username / NIK Terdaftar</label>
                      <div className="auth-input-adornment">
                        <Mail size={16} className="auth-adorn-icon" />
                        <input
                          type="text"
                          className="auth-input-ctrl"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="Contoh: dika@pasien.id atau sarah@puskesmas.go.id"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="auth-field-row">
                      <div className="auth-label-between">
                        <label className="auth-field-label">Kata Sandi (Password)</label>
                        <span className="auth-demo-hint">Demo PIN Standar: <strong>123</strong></span>
                      </div>
                      <div className="auth-input-adornment">
                        <Lock size={16} className="auth-adorn-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="auth-input-ctrl"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Masukkan kata sandi..."
                          required
                        />
                        <button
                          type="button"
                          className="auth-eye-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          title="Tampilkan / Sembunyikan Sandi"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="auth-primary-submit-btn">
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight size={17} />
                    </button>
                  </form>

                  {/* Quick Demo Credential Filler Cards (Strict password check remains enforced) */}
                  <div className="auth-demo-chips-section">
                    <div className="demo-chips-title">
                      <span>💡 Akun Uji Coba (Klik kartu untuk mengisi form otomatis):</span>
                    </div>

                    <div className="demo-chips-grid">
                      <button
                        type="button"
                        className="demo-chip-btn demo-pasien"
                        onClick={() => handleFillDemoAccount('Dika Pratama', 'dika@pasien.id', 'Pasien')}
                        title="Klik untuk mengisi form dengan Akun Pasien Dika Pratama"
                      >
                        <User size={15} />
                        <div>
                          <strong>Dika Pratama</strong>
                          <span>Role Pasien BPJS • dika@pasien.id</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="demo-chip-btn demo-petugas"
                        onClick={() => handleFillDemoAccount('dr. Sarah Anindita', 'sarah@puskesmas.go.id', 'Dokter & Petugas')}
                        title="Klik untuk mengisi form dengan Akun Dokter dr. Sarah Anindita"
                      >
                        <Stethoscope size={15} />
                        <div>
                          <strong>dr. Sarah Anindita</strong>
                          <span>Role Dokter & Petugas • sarah@puskesmas.go.id</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="demo-chip-btn demo-pmo"
                        onClick={() => handleFillDemoAccount('Ibu Ratna', 'ratna@pmo.id', 'PMO Pengawas')}
                        title="Klik untuk mengisi form dengan Akun PMO Ibu Ratna"
                      >
                        <Users size={15} />
                        <div>
                          <strong>Ibu Ratna</strong>
                          <span>Role PMO Pengawas • ratna@pmo.id</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="demo-chip-btn demo-admin"
                        onClick={() => handleFillDemoAccount('Pak Bahrul', 'admin@puskesmas.go.id', 'Admin Puskesmas')}
                        title="Klik untuk mengisi form dengan Akun Admin Pak Bahrul"
                      >
                        <ShieldCheck size={15} />
                        <div>
                          <strong>Pak Bahrul, SKM</strong>
                          <span>Role Admin Puskesmas • admin@puskesmas.go.id</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------
                  MODE 2: FORM DAFTAR AKUN BARU (REGISTER)
                  ---------------------------------------------------------------- */}
              {authMode === 'register' && (
                <div className="auth-form-wrapper">
                  <div className="auth-form-headline">
                    <h2 className="auth-box-title">Pendaftaran Akun Baru</h2>
                    <p className="auth-box-sub">Buat akun untuk mengakses layanan Puskesmas Mekar Jaya</p>
                  </div>

                  {regError && (
                    <div className="auth-error-alert">
                      <AlertCircle size={16} />
                      <span>{regError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="auth-form-body">
                    {/* Role Picker for Registration */}
                    <div className="auth-field-row">
                      <label className="auth-field-label">Daftar Sebagai Peran:</label>
                      <div className="auth-role-segmented-picker">
                        <button
                          type="button"
                          className={`role-seg-btn ${regRole === 'pasien' ? 'active' : ''}`}
                          onClick={() => setRegRole('pasien')}
                        >
                          <User size={13} />
                          <span>Pasien Umum/BPJS</span>
                        </button>

                        <button
                          type="button"
                          className={`role-seg-btn ${regRole === 'pmo' ? 'active' : ''}`}
                          onClick={() => setRegRole('pmo')}
                        >
                          <Users size={13} />
                          <span>PMO (Pengawas Obat)</span>
                        </button>

                        <button
                          type="button"
                          className={`role-seg-btn ${regRole === 'petugas' ? 'active' : ''}`}
                          onClick={() => setRegRole('petugas')}
                        >
                          <Stethoscope size={13} />
                          <span>Petugas Medis</span>
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="auth-field-row">
                      <label className="auth-field-label">Nama Lengkap Sesuai KTP</label>
                      <input
                        type="text"
                        className="auth-input-ctrl full"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Contoh: Budi Prasetyo"
                        required
                      />
                    </div>

                    {/* NIK & Phone */}
                    <div className="auth-grid-2-inputs">
                      <div className="auth-field-row">
                        <label className="auth-field-label">NIK (16 Digit KTP)</label>
                        <input
                          type="text"
                          maxLength="16"
                          className="auth-input-ctrl full"
                          value={regNik}
                          onChange={(e) => setRegNik(e.target.value)}
                          placeholder="3201xxxxxxxxxxxx"
                        />
                      </div>

                      <div className="auth-field-row">
                        <label className="auth-field-label">No. WhatsApp / HP</label>
                        <input
                          type="tel"
                          className="auth-input-ctrl full"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="0812xxxxxxxx"
                        />
                      </div>
                    </div>

                    {/* Email & Password */}
                    <div className="auth-grid-2-inputs">
                      <div className="auth-field-row">
                        <label className="auth-field-label">Alamat Email / Username</label>
                        <input
                          type="text"
                          className="auth-input-ctrl full"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="nama@email.com"
                          required
                        />
                      </div>

                      <div className="auth-field-row">
                        <label className="auth-field-label">Buat Kata Sandi</label>
                        <input
                          type="password"
                          className="auth-input-ctrl full"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimal 4 karakter"
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="auth-primary-submit-btn">
                      <span>Daftar Akun & Langsung Masuk</span>
                      <ArrowRight size={17} />
                    </button>
                  </form>
                </div>
              )}

              {/* Security Badge */}
              <div className="auth-card-footer-trust">
                <ShieldCheck size={14} className="text-emerald" />
                <span>Terhubung dengan SatuSehat Kemenkes • Data Terenkripsi Aman</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Role Comparison Cards Showcase */}
      <section className="landing-roles-overview-section">
        <div className="landing-section-intro text-center">
          <span className="badge-pill-cyan">Role-Based Access Control (RBAC)</span>
          <h2 className="landing-section-title">Dashboard Berbeda Sesuai Kebutuhan Pengguna</h2>
          <p className="landing-section-sub">
            Setiap akun yang masuk otomatis diarahkan ke dasbor dengan hak akses dan fitur operasional khusus.
          </p>
        </div>

        <div className="landing-role-cards-grid">
          {/* Card 1: Pasien */}
          <div
            className="landing-role-box"
            onClick={() => handleQuickDemoLogin('pasien')}
          >
            <div className="landing-role-icon role-pasien-theme">
              <User size={26} />
            </div>
            <div className="landing-role-tag">ROLE PASIEN</div>
            <h3 className="landing-role-name">Portal Pelayanan Pasien</h3>
            <p className="landing-role-desc">
              Fokus pada kemudahan akses pasien dalam mengambil antrean secara mandiri dan memantau riwayat pengobatan.
            </p>
            <ul className="landing-role-ul">
              <li>✓ Pendaftaran Antrean Online (Nomor Real-time & QR)</li>
              <li>✓ Riwayat Rekam Medis Elektronik (RME) & Diagnosa</li>
              <li>✓ Cetak Resume Medis Resmi Standar Puskesmas</li>
              <li>✓ Pengingat Minum Obat Harian & Jadwal Kontrol</li>
            </ul>
            <div className="landing-role-enter">
              <span>Coba Dashboard Pasien →</span>
            </div>
          </div>

          {/* Card 2: Petugas */}
          <div
            className="landing-role-box"
            onClick={() => handleQuickDemoLogin('petugas')}
          >
            <div className="landing-role-icon role-petugas-theme">
              <Stethoscope size={26} />
            </div>
            <div className="landing-role-tag">ROLE PETUGAS PUSKESMAS</div>
            <h3 className="landing-role-name">Manajemen Poliklinik & EHR</h3>
            <p className="landing-role-desc">
              Pusat kendali klinis dokter dan perawat untuk memanggil antrean dan menginput rekam medis elektronik.
            </p>
            <ul className="landing-role-ul">
              <li>✓ Panggilan Antrean Pasien Suara & Bell Puskesmas</li>
              <li>✓ Input & Edit RME (Anamnesis, IMT, ICD-10)</li>
              <li>✓ E-Prescription & Pengurangan Stok Gudang Farmasi</li>
              <li>✓ Mode Layar Antrean TV untuk Monitor Ruang Tunggu</li>
            </ul>
            <div className="landing-role-enter">
              <span>Coba Dashboard Petugas →</span>
            </div>
          </div>

          {/* Card 3: PMO */}
          <div
            className="landing-role-box"
            onClick={() => handleQuickDemoLogin('pmo')}
          >
            <div className="landing-role-icon role-pmo-theme">
              <Users size={26} />
            </div>
            <div className="landing-role-tag">ROLE PMO (PENGAWAS OBAT)</div>
            <h3 className="landing-role-name">Pemantauan Kepatuhan Pasien</h3>
            <p className="landing-role-desc">
              Alat bantu kader kesehatan dan keluarga dalam mendampingi minum obat pasien TB DOTS dan penyakit kronis.
            </p>
            <ul className="landing-role-ul">
              <li>✓ Pengukur Tingkat Kepatuhan Pasien Binaan (%)</li>
              <li>✓ Matriks Titik Kepatuhan 7 Hari Terakhir</li>
              <li>✓ Formulir Checklist Harian Status Minum Obat</li>
              <li>✓ Lapor Kendala Efek Samping Darurat ke Dokter</li>
            </ul>
            <div className="landing-role-enter">
              <span>Coba Dashboard PMO →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="auth-landing-footer">
        <div>© 2026 Puskesmas Mekar Jaya • Sistem Informasi Puskesmas Terpadu (SIMPus)</div>
        <div className="footer-links-row">
          <span>Standar Akreditasi Paripurna Kemenkes</span> • 
          <span>SatuSehat Ready</span> • 
          <span>DOTS TB 180 Hari Tuntas</span>
        </div>
      </footer>
    </div>
  );
}
