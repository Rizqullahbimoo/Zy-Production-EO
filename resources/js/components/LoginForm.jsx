import { useState } from 'react';
import InputField from './InputField';
import '../../css/components/login-form.css';

/* ============================================================
   SVG Icon helpers (inline — no external dependency)
   ============================================================ */
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

/* ============================================================
   Validation helpers
   ============================================================ */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email wajib diisi.';
  else if (!validateEmail(email)) errors.email = 'Format email tidak valid.';
  if (!password.trim()) errors.password = 'Password wajib diisi.';
  else if (password.length < 6) errors.password = 'Password minimal 6 karakter.';
  return errors;
}

/* ============================================================
   LoginForm Component
   ============================================================ */
/**
 * LoginForm — Handles login form state, validation, and submission.
 *
 * Props:
 *  - onSubmit     : async function({ email, password }) — called on valid submit
 *  - onSignUp     : function() — called when Sign Up is clicked
 *  - onForgotPass : function() — called when Forgot Password is clicked
 *  - isLoading    : boolean — external loading state
 *  - serverError  : string  — error message from server/parent
 */
export default function LoginForm({
  onSubmit,
  onSignUp,
  onForgotPass,
  isLoading = false,
  serverError = '',
}) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear field error as user types
    if (touched[name]) {
      const newErrors = validateForm({ ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: newErrors[name] || '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const newErrors = validateForm(form);
    setErrors((prev) => ({ ...prev, [name]: newErrors[name] || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    const newErrors = validateForm(form);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    if (onSubmit) onSubmit({ email: form.email, password: form.password });
  };

  return (
    <div className="login-card" role="main">
      {/* Card Header */}
      <header className="login-card-header">
        <h1 className="login-heading">
          Selamat <span>Datang</span>
        </h1>
        <p className="login-subheading">
          Sistem Informasi ZY Production
        </p>
      </header>

      {/* Server Error Alert */}
      {serverError && (
        <div className="login-alert error" role="alert" aria-live="polite">
          <AlertIcon />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form noValidate onSubmit={handleSubmit}>
        <div className="login-fields">
          <InputField
            id="login-email"
            label="Email"
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Masukkan email Anda"
            iconLeft={<EmailIcon />}
            error={errors.email || ''}
            disabled={isLoading}
            autoComplete="email"
          />

          <InputField
            id="login-password"
            label="Password"
            required
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Masukkan password"
            iconLeft={<LockIcon />}
            error={errors.password || ''}
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        {/* Forgot Password */}
        <div className="login-forgot-row" style={{ marginTop: '12px' }}>
          <button
            type="button"
            className="login-forgot-link"
            onClick={onForgotPass}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              font: 'inherit', padding: 0
            }}
          >
            Lupa Password?
          </button>
        </div>

        {/* Action Buttons */}
        <div className="login-actions" style={{ marginTop: '20px' }}>
          <button
            id="btn-signup"
            type="button"
            className="login-btn-secondary"
            onClick={onSignUp}
            disabled={isLoading}
          >
            Daftar
          </button>

          <button
            id="btn-login"
            type="submit"
            className="login-btn-primary"
            disabled={isLoading}
          >
            {isLoading && <span className="login-btn-spinner" aria-hidden="true" />}
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </div>
      </form>

      {/* Footer Note */}
      <p className="login-footer-note">
        Belum punya akun?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSignUp && onSignUp(); }}>
          Daftar di sini
        </a>
      </p>
    </div>
  );
}
