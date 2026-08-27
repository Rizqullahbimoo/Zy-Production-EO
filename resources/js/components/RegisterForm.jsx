import { useState } from 'react';
import InputField from './InputField';
import '../../css/components/register-form.css';

/* ============================================================
   SVG Icon Helpers
   ============================================================ */
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07
      A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67
      A2 2 0 0 1 3.56 0h3a2 2 0 0 1 2 1.72
      c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91
      a16 16 0 0 0 5.55 5.55l1.27-1.27a2 2 0 0 1 2.11-.45
      c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.9z" />
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
   Password Strength Meter
   ============================================================ */
function getPasswordStrength(password) {
  if (!password) return { level: '', label: '', score: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 'weak', label: 'Lemah', score };
  if (score <= 2) return { level: 'medium', label: 'Sedang', score };
  return { level: 'strong', label: 'Kuat', score };
}

const passwordHints = [
  { key: 'length', check: (p) => p.length >= 8, text: 'Minimal 8 karakter' },
  { key: 'uppercase', check: (p) => /[A-Z]/.test(p), text: 'Huruf kapital (A-Z)' },
  { key: 'number', check: (p) => /[0-9]/.test(p), text: 'Mengandung angka' },
  { key: 'special', check: (p) => /[^A-Za-z0-9]/.test(p), text: 'Karakter khusus (!@#...)' },
];

/* ============================================================
   Validation
   ============================================================ */
function validateForm(form) {
  const errors = {};
  if (!form.nama.trim()) errors.nama = 'Nama wajib diisi.';
  if (!form.email.trim()) errors.email = 'Email wajib diisi.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Format email tidak valid.';
  if (!form.password) errors.password = 'Password wajib diisi.';
  else if (form.password.length < 8) errors.password = 'Password minimal 8 karakter.';
  if (!form.password_confirmation) errors.password_confirmation = 'Konfirmasi password wajib diisi.';
  else if (form.password !== form.password_confirmation)
    errors.password_confirmation = 'Password tidak cocok.';
  if (form.no_hp && !/^\d{8,20}$/.test(form.no_hp.replace(/\D/g, '')))
    errors.no_hp = 'Nomor HP tidak valid.';
  return errors;
}

/* ============================================================
   RegisterForm Component
   ============================================================ */
/**
 * RegisterForm — Registration form for customer accounts.
 *
 * Props:
 *  - onSubmit   : async function(formData) — called on valid submit
 *  - onLoginClick: function() — called when "Login?" link is clicked
 *  - isLoading  : boolean
 *  - serverError: string
 *  - serverErrors: object — field-level errors from backend (422)
 */
export default function RegisterForm({
  onSubmit,
  onLoginClick,
  isLoading = false,
  serverError = '',
  successMessage = '',
  serverErrors = {},
}) {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    password_confirmation: '',
    no_hp: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const newErrors = validateForm({ ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: newErrors[name] || '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ nama: true, email: true, password: true, password_confirmation: true, no_hp: true });
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (onSubmit) onSubmit({ ...form });
  };

  // Merge local validation errors with server 422 field errors
  const fieldError = (name) =>
    errors[name] || serverErrors?.[name]?.[0] || '';

  return (
    <div className="register-card">
      {/* Header */}
      <header className="register-card-header">
        <h1 className="register-heading">Daftar <span>Akun</span></h1>
        <p className="register-subheading">
          Halaman pendaftaran akun customer ZY Production
        </p>
      </header>

      {/* Success Alert (Toast) */}
      {successMessage && (
        <div className="register-alert" style={{ backgroundColor: '#e2efda', color: '#1e683f', borderColor: '#c3e6cb' }} role="alert" aria-live="polite">
          <svg style={{marginRight: '8px', minWidth: '20px'}} viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <div className="register-alert error" role="alert" aria-live="polite">
          <AlertIcon />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form noValidate onSubmit={handleSubmit}>
        <div className="register-fields">

          {/* Row: Nama + No HP */}
          <div className="register-fields-row">
            <InputField
              id="reg-nama"
              label="Nama Lengkap"
              required
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama lengkap"
              iconLeft={<UserIcon />}
              error={fieldError('nama')}
              disabled={isLoading}
              autoComplete="name"
            />
            <InputField
              id="reg-no-hp"
              label="No. HP"
              type="tel"
              name="no_hp"
              value={form.no_hp}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              iconLeft={<PhoneIcon />}
              error={fieldError('no_hp')}
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>

          {/* Email */}
          <InputField
            id="reg-email"
            label="Email"
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="contoh@email.com"
            iconLeft={<EmailIcon />}
            error={fieldError('email')}
            disabled={isLoading}
            autoComplete="email"
          />

          {/* Password */}
          <div>
            <InputField
              id="reg-password"
              label="Password"
              required
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 karakter"
              iconLeft={<LockIcon />}
              error={fieldError('password')}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {/* Password strength */}
            {form.password && (
              <div className={`register-strength-bar strength-${strength.level}`}>
                <div className="register-strength-track">
                  <div className="register-strength-fill" />
                </div>
                <span className="register-strength-label">
                  Kekuatan: {strength.label}
                </span>
                <ul className="register-password-hints" aria-label="Persyaratan password">
                  {passwordHints.map((hint) => {
                    const met = hint.check(form.password);
                    return (
                      <li key={hint.key} className={`register-password-hint ${met ? 'met' : ''}`}>
                        <span className="register-hint-dot" aria-hidden="true" />
                        {hint.text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <InputField
            id="reg-password-confirm"
            label="Konfirmasi Password"
            required
            type="password"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
            placeholder="Ulangi password"
            iconLeft={<LockIcon />}
            error={fieldError('password_confirmation')}
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        {/* Submit Button */}
        <button
          id="btn-register"
          type="submit"
          className="register-btn-submit"
          disabled={isLoading}
        >
          {isLoading && <span className="register-btn-spinner" aria-hidden="true" />}
          {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </button>
      </form>

      {/* Footer — link back to login */}
      <p className="register-footer-note">
        Sudah punya akun?{' '}
        <button
          type="button"
          className="link"
          onClick={onLoginClick}
        >
          Masuk di sini
        </button>
      </p>
    </div>
  );
}
