import { useState, useEffect } from 'react';
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

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm({ email, password, passwordConfirmation }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email wajib diisi.';
  else if (!validateEmail(email)) errors.email = 'Format email tidak valid.';
  if (!password.trim()) errors.password = 'Password baru wajib diisi.';
  else if (password.length < 8) errors.password = 'Password minimal 8 karakter.';
  if (!passwordConfirmation.trim()) errors.passwordConfirmation = 'Konfirmasi password wajib diisi.';
  else if (password && passwordConfirmation !== password) errors.passwordConfirmation = 'Konfirmasi password tidak cocok.';
  return errors;
}

/**
 * ResetPassword Page — Satu form universal untuk admin maupun customer,
 * mengikuti pola yang sama dengan halaman Login/ForgotPassword.
 *
 * Token diambil dari query string (?token=xxx). Email TIDAK disertakan di
 * URL secara sengaja (lebih privat — tidak bocor lewat riwayat browser/log
 * server) — user mengisinya sendiri di form ini, lalu dicocokkan dengan
 * token oleh backend.
 */
export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [form, setForm] = useState({ email: '', password: '', passwordConfirmation: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t) {
      setTokenMissing(true);
    } else {
      setToken(t);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const newErrors = validateForm({ ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: newErrors[name] || '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setTouched({ email: true, password: true, passwordConfirmation: true });

    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await window.axios.post('/api/reset-password', {
        token,
        email: form.email,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      });

      // Sukses — arahkan ke halaman login dengan penanda untuk menampilkan toast di sana.
      window.location.href = '/login?reset=success';
    } catch (err) {
      const message =
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
          {tokenMissing ? (
            <div className="text-center" style={{ padding: '0.5rem 0' }}>
              <header className="login-card-header">
                <h1 className="login-heading">
                  Tautan Tidak <span>Valid</span>
                </h1>
              </header>
              <div className="login-alert error" role="alert" style={{ textAlign: 'left' }}>
                <AlertIcon />
                <span>Tautan reset password tidak ditemukan atau tidak lengkap. Silakan minta link reset yang baru.</span>
              </div>
              <div className="login-actions" style={{ marginTop: '20px' }}>
                <a href="/forgot-password" className="login-btn-primary" style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Minta Link Baru
                </a>
              </div>
            </div>
          ) : (
            <>
              <header className="login-card-header">
                <h1 className="login-heading">
                  Reset <span>Password</span>
                </h1>
                <p className="login-subheading">
                  Masukkan email dan password baru Anda.
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
                    id="reset-email"
                    label="Email"
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Masukkan email akun Anda"
                    iconLeft={<EmailIcon />}
                    error={errors.email || ''}
                    disabled={isLoading}
                    autoComplete="email"
                  />

                  <InputField
                    id="reset-password"
                    label="Password Baru"
                    required
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    iconLeft={<LockIcon />}
                    error={errors.password || ''}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />

                  <InputField
                    id="reset-password-confirmation"
                    label="Konfirmasi Password Baru"
                    required
                    type="password"
                    name="passwordConfirmation"
                    value={form.passwordConfirmation}
                    onChange={handleChange}
                    placeholder="Ulangi password baru"
                    iconLeft={<LockIcon />}
                    error={errors.passwordConfirmation || ''}
                    disabled={isLoading}
                    autoComplete="new-password"
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
                    {isLoading ? 'Menyimpan...' : 'Reset Password'}
                  </button>
                </div>
              </form>

              <p className="login-footer-note">
                <a href="/login">Kembali ke Login</a>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
