import { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import '../../css/pages/login.css';

/**
 * Login Page — Assembles the full login screen.
 *
 * Responsibilities:
 *  - Page-level layout (hero banner, decorative background)
 *  - Managing async login/submit state
 *  - Wiring navigation callbacks (sign up, forgot password)
 *
 * This is intentionally separate from LoginForm so the form
 * component is reusable in modals, drawers, or other contexts.
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  /* ── Toast notification (pengganti alert() bawaan browser) ── */
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }
  const showToast = (type, message) => setToast({ type, message });
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Setelah reset password sukses, ResetPassword.jsx redirect ke sini dengan
  // ?reset=success — tampilkan toast, lalu bersihkan URL supaya tidak muncul
  // lagi kalau halaman di-refresh.
  //
  // Dibaca sekali lewat lazy initializer (murni, tanpa efek samping) alih-alih
  // langsung di dalam useEffect — di React 18 StrictMode (dev), effect dengan
  // dependency [] dijalankan dua kali; kalau baca+tulis URL digabung di situ,
  // pemanggilan pertama sudah menghapus query string sebelum pemanggilan kedua
  // (yang benar-benar bertahan) sempat membacanya, jadi toast tidak pernah
  // muncul di alur yang sebenarnya dipakai user.
  const [showResetToast] = useState(
    () => new URLSearchParams(window.location.search).get('reset') === 'success'
  );
  useEffect(() => {
    if (showResetToast) {
      showToast('success', 'Password berhasil direset! Silakan login dengan password baru Anda.');
      window.history.replaceState({}, '', '/login');
    }
  }, [showResetToast]);

  /**
   * Handle form submission — hits the real Laravel API endpoint.
   * POST /api/login → { status, data: { user: { role, nama }, token } }
   */
  const handleLogin = async ({ email, password }) => {
    setServerError('');
    setIsLoading(true);

    try {
      const response = await window.axios.post('/api/login', { email, password });
      const { data } = response.data; // { user, token, token_type }
      const { user, token } = data;

      // Persist token for subsequent API calls — the axios request
      // interceptor in bootstrap.js reads this on every request, so no
      // manual header assignment is needed here.
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/';
      }

    } catch (err) {
      // Laravel returns 401 with { status: 'error', message: '...' }
      const message =
        err?.response?.data?.message ||
        'Email atau password salah. Silakan coba lagi.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    window.location.href = '/register';
  };

  const handleForgotPassword = () => {
    window.location.href = '/forgot-password';
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
          onError={(e) => {
            // Fallback gradient if image not found
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="login-hero-overlay">
          <div className="login-hero-logo">
            <img
              src="/images/logo.jpg"
              alt="ZY Production"
              className="login-hero-logo-img"
            />
            <div className="login-hero-logo-subtitle">Event Management System</div>
          </div>
        </div>
      </section>

      {/* Login Card Section */}
      <main className="login-content">
        <LoginForm
          onSubmit={handleLogin}
          onSignUp={handleSignUp}
          onForgotPass={handleForgotPassword}
          isLoading={isLoading}
          serverError={serverError}
        />
      </main>

      {/* Toast notification — pengganti alert() bawaan browser */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            minWidth: '280px',
            maxWidth: '420px',
            background: '#FFFFFF',
            border: `1px solid ${toast.type === 'success' ? 'rgba(226,154,0,0.35)' : '#FFC9C9'}`,
            borderLeft: `4px solid ${toast.type === 'success' ? 'var(--color-primary, #E29A00)' : '#C92A2A'}`,
            color: 'var(--color-text-main)',
            borderRadius: '10px',
            padding: '0.9rem 1.1rem',
            boxShadow: '0 20px 50px rgba(30,22,6,0.18)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1, padding: 0 }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
