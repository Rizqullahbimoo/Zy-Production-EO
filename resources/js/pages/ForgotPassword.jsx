import { useState } from 'react';
import InputField from '../components/InputField';
import '../../css/pages/login.css';
import '../../css/components/login-form.css';

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * ForgotPassword Page — Satu form universal untuk admin maupun customer.
 *
 * Sistem ini hanya punya satu halaman /login untuk kedua role (dibedakan
 * lewat redirect setelah login berdasarkan field `role`), jadi alur lupa
 * password mengikuti pola yang sama: satu form, satu endpoint backend
 * (/api/forgot-password) yang mengecek tabel users tanpa peduli role.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!email.trim()) {
      setFieldError('Email wajib diisi.');
      return;
    }
    if (!validateEmail(email)) {
      setFieldError('Format email tidak valid.');
      return;
    }
    setFieldError('');
    setIsLoading(true);

    try {
      await window.axios.post('/api/forgot-password', { email });
      // Selalu tampilkan state sukses yang sama, terlepas dari apakah email
      // terdaftar atau tidak — supaya tidak membocorkan info keberadaan akun.
      setSubmitted(true);
    } catch (err) {
      const message =
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.message ||
        'Terjadi kesalahan. Silakan coba lagi.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative Background */}
      <div className="login-page-bg" aria-hidden="true">
        <div className="login-page-bg-gradient" />
        <div className="login-bg-shape login-bg-shape-1" />
        <div className="login-bg-shape login-bg-shape-2" />
        <div className="login-bg-shape login-bg-shape-3" />
      </div>

      {/* Hero Banner */}
      <section className="login-hero" aria-label="ZY Production banner">
        <img
          src="/images/login-hero.jpg"
          alt="ZY Production Event — Wedding, Outbound, Launching"
          className="login-hero-img"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="login-hero-overlay">
          <div className="login-hero-logo">
            <img src="/images/logo.jpg" alt="ZY Production" className="login-hero-logo-img" />
            <div className="login-hero-logo-subtitle">Event Management System</div>
          </div>
        </div>
      </section>

      {/* Card Section */}
      <main className="login-content">
        <div className="login-card" role="main">
          {submitted ? (
            <div className="text-center" style={{ padding: '0.5rem 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #E29A00, #C97F00)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <CheckCircleIcon />
              </div>
              <h1 className="login-heading" style={{ fontSize: '1.25rem' }}>Cek Email Anda</h1>
              <p className="login-subheading" style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>
                Jika email terdaftar, kami telah mengirimkan link reset password ke email tersebut. Link berlaku selama 60 menit.
              </p>
              <p className="login-footer-note" style={{ marginTop: '1.5rem' }}>
                <a href="/login">Kembali ke Login</a>
              </p>
            </div>
          ) : (
            <>
              <header className="login-card-header">
                <h1 className="login-heading">
                  Lupa <span>Password</span>
                </h1>
                <p className="login-subheading">
                  Masukkan email akun Anda, kami akan kirimkan link untuk membuat password baru.
                </p>
              </header>

              {serverError && (
                <div className="login-alert error" role="alert" aria-live="polite">
                  <AlertIcon />
                  <span>{serverError}</span>
                </div>
              )}

              <form noValidate onSubmit={handleSubmit}>
                <div className="login-fields">
                  <InputField
                    id="forgot-email"
                    label="Email"
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (fieldError) setFieldError(''); }}
                    placeholder="Masukkan email Anda"
                    iconLeft={<EmailIcon />}
                    error={fieldError}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="login-actions" style={{ marginTop: '20px' }}>
                  <button
                    type="submit"
                    className="login-btn-primary"
                    style={{ width: '100%' }}
                    disabled={isLoading}
                  >
                    {isLoading && <span className="login-btn-spinner" aria-hidden="true" />}
                    {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                </div>
              </form>

              <p className="login-footer-note">
                Sudah ingat password?{' '}
                <a href="/login">Kembali ke Login</a>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
