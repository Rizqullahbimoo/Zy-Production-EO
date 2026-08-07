import { useState } from 'react';
import RegisterForm from '../components/RegisterForm';
import '../../css/pages/register.css';

/**
 * Register Page — Assembles the full register screen.
 *
 * Responsibilities:
 *  - Page layout (hero banner, decorative background)
 *  - Async POST /api/register
 *  - Alert: success → redirect to /login, fail → show error
 */
export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverErrors, setServerErrors] = useState({}); // 422 field-level errors

  const handleRegister = async (formData) => {
    setServerError('');
    setServerErrors({});
    setIsLoading(true);

    try {
      await window.axios.post('/api/register', formData);
      // Redirect to login
      window.location.href = '/login';

    } catch (err) {
      const status = err?.response?.status;

      if (status === 422) {
        // Backend validation errors — field-level (e.g. email already taken)
        const backendErrors = err?.response?.data?.errors || {};
        setServerErrors(backendErrors);

        // Also show a top-level summary
        const firstMsg = Object.values(backendErrors).flat()[0];
        setServerError(firstMsg || 'Validasi gagal. Periksa kembali isian Anda.');

        alert(`❌ Registrasi Gagal!\n\n${firstMsg || 'Periksa kembali isian form.'}`);

      } else {
        // Network or server error
        const message =
          err?.response?.data?.message ||
          'Terjadi kesalahan. Silakan coba lagi.';
        setServerError(message);
        alert(`❌ Registrasi Gagal!\n\n${message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="register-page">
      {/* Decorative Background */}
      <div className="register-page-bg" aria-hidden="true">
        <div className="register-page-bg-gradient" />
        <div className="register-bg-shape register-bg-shape-1" />
        <div className="register-bg-shape register-bg-shape-2" />
      </div>

      {/* Hero Banner */}
      <section className="register-hero" aria-label="ZY Production banner">
        <img
          src="/images/login-hero.jpg"
          alt="ZY Production Event"
          className="register-hero-img"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="register-hero-overlay">
          <div className="register-hero-logo">
            <img
              src="/images/logo.jpg"
              alt="ZY Production"
              className="register-hero-logo-img"
            />
            <div className="register-hero-logo-subtitle">Daftar Akun Customer</div>
          </div>
        </div>
      </section>

      {/* Register Card */}
      <main className="register-content">
        <RegisterForm
          onSubmit={handleRegister}
          onLoginClick={handleGoToLogin}
          isLoading={isLoading}
          serverError={serverError}
          serverErrors={serverErrors}
        />
      </main>
    </div>
  );
}
