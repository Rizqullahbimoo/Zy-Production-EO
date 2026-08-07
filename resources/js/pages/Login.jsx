import { useState } from 'react';
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

      // Persist token for subsequent API calls
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      // Set Authorization header globally for future axios requests
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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
    // TODO: Navigate to forgot-password flow
    alert('Fitur lupa password belum tersedia. Hubungi administrator.');
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
    </div>
  );
}
