import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';

export default function Screen1_Onboarding({ onNavigateToLogin, onNavigateToRegister }) {
  return (
    <div className="tb-screen-onboarding">
      {/* Lungs Illustration with Medical Badge */}
      <div className="tb-onboarding-illu-wrap">
        <img
          src="/lungs_illustration.jpg"
          alt="Ilustrasi Paru-Paru Sehat Bebas TB"
          className="tb-onboarding-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="tb-illu-cross-badge">
          <Plus size={20} strokeWidth={3} />
        </div>
      </div>

      {/* Main Headline & Subtitle matching Mockup Screen 1 */}
      <div className="tb-onboarding-content">
        <h1 className="tb-onboarding-title">
          TBC Bisa Sembuh Jika Obat Diminum Rutin
        </h1>
        <p className="tb-onboarding-subtitle">
          Dukungan digital untuk pengobatan TB yang lebih mudah dan terpantau.
        </p>
      </div>

      {/* Action Buttons: Masuk & Daftar */}
      <div className="tb-onboarding-buttons">
        <button
          className="tb-btn-primary"
          onClick={onNavigateToLogin}
        >
          <span>Masuk</span>
          <ArrowRight size={18} />
        </button>

        <button
          className="tb-btn-outline"
          onClick={onNavigateToRegister}
        >
          <span>Daftar</span>
        </button>

        <div className="tb-onboarding-footer-text">
          Sudah punya akun?{' '}
          <span onClick={onNavigateToLogin}>Masuk</span>
        </div>
      </div>
    </div>
  );
}
