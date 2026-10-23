import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Users,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Mail,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loginUser, registerNewUser } from '../../services/puskesmasState';

export default function Screen2_RoleLogin({
  onBack,
  onLoginSuccess,
  initialMode = 'select_role' // 'select_role' or 'register'
}) {
  const [activeMode, setActiveMode] = useState(initialMode);
  const [selectedRole, setSelectedRole] = useState(null); // 'pasien', 'pmo', 'petugas', 'admin'
  const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false);

  // Login credentials state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('pasien');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  // 4 Roles definitions matching Mockup Screen 2
  const roleList = [
    {
      id: 'pasien',
      title: 'Pasien TB',
      desc: 'Pantau pengobatan dan terima pengingat obat',
      icon: <User size={22} />,
      colorClass: 'pasien',
      defaultEmail: 'dika@pasien.id',
      defaultName: 'Dika Pratama'
    },
    {
      id: 'pmo',
      title: 'Keluarga / PMO',
      desc: 'Dampingi dan bantu ingatkan pengobatan',
      icon: <Users size={22} />,
      colorClass: 'pmo',
      defaultEmail: 'ratna@pmo.id',
      defaultName: 'Ibu Ratna (PMO)'
    },
    {
      id: 'petugas',
      title: 'Petugas Kesehatan',
      desc: 'Kelola data pasien dan pemantauan',
      icon: <Stethoscope size={22} />,
      colorClass: 'petugas',
      defaultEmail: 'sarah@puskesmas.go.id',
      defaultName: 'dr. Sarah Anindita / Bu Sari'
    },
    {
      id: 'admin',
      title: 'Admin Puskesmas',
      desc: 'Akses dashboard & laporan',
      icon: <ShieldCheck size={22} />,
      colorClass: 'admin',
      defaultEmail: 'admin@puskesmas.go.id',
      defaultName: 'Pak Bahrul, SKM'
    }
  ];

  // Open password dialog for a chosen role
  const handleSelectRole = (roleItem) => {
    setSelectedRole(roleItem);
    setLoginEmail(roleItem.defaultEmail);
    setLoginPassword('123');
    setLoginError('');
    setIsPasswordDrawerOpen(true);
  };

  // Submit Login with Strict Password Validation
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Harap masukkan email / username Anda.');
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError('Harap masukkan kata sandi.');
      return;
    }

    const res = loginUser(loginEmail, loginPassword, selectedRole?.id);
    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setIsPasswordDrawerOpen(false);
      onLoginSuccess(res.user);
    } else {
      setLoginError(res.message || 'Kata sandi yang Anda masukkan salah!');
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
      email: regEmail,
      phone: regPhone,
      password: regPassword || '123',
      role: regRole
    });

    if (res.success) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      onLoginSuccess(res.user);
    } else {
      setRegError(res.message || 'Pendaftaran gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="tb-screen-roles">
      {/* Header with Back Arrow */}
      <div className="tb-screen-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <button className="tb-back-btn" onClick={onBack} title="Kembali ke Layar Awal">
          <ArrowLeft size={20} />
        </button>
      </div>

      {activeMode === 'select_role' ? (
        <>
          {/* Headline matching Mockup Screen 2 */}
          <div className="tb-roles-headline">
            <h1>Masuk</h1>
            <p>Pilih peran Anda untuk melanjutkan</p>
          </div>

          {/* 4 Role Selection Cards List */}
          <div className="tb-role-cards-list">
            {roleList.map((r) => (
              <div
                key={r.id}
                className="tb-role-card"
                onClick={() => handleSelectRole(r)}
              >
                <div className={`tb-role-icon-box ${r.colorClass}`}>
                  {r.icon}
                </div>
                <div className="tb-role-info">
                  <div className="tb-role-title">{r.title}</div>
                  <div className="tb-role-desc">{r.desc}</div>
                </div>
                <ChevronRight size={18} className="tb-role-chevron" />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Belum punya akun? </span>
            <button
              onClick={() => setActiveMode('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Daftar Pasien Baru
            </button>
          </div>
        </>
      ) : (
        /* Form Registrasi */
        <div>
          <div className="tb-roles-headline">
            <h1>Daftar Akun Baru</h1>
            <p>Masukkan data Anda untuk registrasi layanan TB Puskesmas</p>
          </div>

          {regError && (
            <div className="tb-alert-error">
              <AlertCircle size={16} />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="tb-form-group">
              <label className="tb-form-label">Nama Lengkap</label>
              <input
                type="text"
                className="tb-input-field"
                placeholder="Contoh: Dika Pratama"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            <div className="tb-form-group">
              <label className="tb-form-label">Email Aktif</label>
              <input
                type="email"
                className="tb-input-field"
                placeholder="nama@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="tb-form-group">
              <label className="tb-form-label">Nomor Telepon / WhatsApp</label>
              <input
                type="tel"
                className="tb-input-field"
                placeholder="+62 8..."
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>

            <div className="tb-form-group">
              <label className="tb-form-label">Daftar Sebagai Peran:</label>
              <select
                className="tb-input-field"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="pasien">Pasien TB (Pengobatan Rutin)</option>
                <option value="pmo">Keluarga / PMO (Pengawas Minum Obat)</option>
                <option value="petugas">Petugas Kesehatan Puskesmas</option>
              </select>
            </div>

            <div className="tb-form-group">
              <label className="tb-form-label">Kata Sandi Baru</label>
              <input
                type="password"
                className="tb-input-field"
                placeholder="Minimal 3 karakter"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="tb-btn-primary" style={{ marginTop: 14 }}>
              <span>Daftar Sekarang</span>
              <Sparkles size={16} />
            </button>

            <button
              type="button"
              className="tb-btn-outline"
              style={{ marginTop: 10 }}
              onClick={() => setActiveMode('select_role')}
            >
              <span>Sudah Punya Akun? Masuk</span>
            </button>
          </form>
        </div>
      )}

      {/* Bottom Drawer Password Modal with Strict Validation */}
      {isPasswordDrawerOpen && selectedRole && (
        <div className="tb-modal-backdrop" onClick={() => setIsPasswordDrawerOpen(false)}>
          <div className="tb-bottom-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="tb-drawer-handle" />
            
            <h3 className="tb-drawer-title">Masuk ke {selectedRole.title}</h3>
            <p className="tb-drawer-sub">Masukkan kata sandi akun Anda untuk mengakses dashboard.</p>

            {loginError && (
              <div className="tb-alert-error">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="tb-credential-pill">
              <span>Akun: <strong>{selectedRole.defaultName}</strong></span>
              <span>PIN Standar: <strong>123</strong></span>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="tb-form-group">
                <label className="tb-form-label">Email / NIK Terdaftar</label>
                <input
                  type="text"
                  className="tb-input-field"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="tb-form-group">
                <label className="tb-form-label">Kata Sandi (Password)</label>
                <div className="tb-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="tb-input-field"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan sandi..."
                    required
                  />
                  <button
                    type="button"
                    className="tb-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="tb-btn-primary">
                <span>Masuk Sekarang</span>
              </button>

              <button
                type="button"
                className="tb-btn-outline"
                style={{ marginTop: 10, height: 44, fontSize: 13 }}
                onClick={() => setIsPasswordDrawerOpen(false)}
              >
                <span>Batal / Pilih Peran Lain</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
