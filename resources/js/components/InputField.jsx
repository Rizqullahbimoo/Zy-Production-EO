import { useState, useId } from 'react';
import '../../css/components/input-field.css';

/**
 * InputField — Reusable form input component.
 *
 * Props:
 *  - id          : string (optional, auto-generated if omitted)
 *  - label       : string
 *  - required    : boolean
 *  - type        : 'text' | 'email' | 'password' | 'number' | etc.
 *  - name        : string
 *  - value       : string
 *  - onChange    : function(e)
 *  - placeholder : string
 *  - iconLeft    : ReactNode (optional SVG/icon)
 *  - error       : string  (error message, shows red state)
 *  - disabled    : boolean
 *  - autoComplete: string
 */
export default function InputField({
  id,
  label,
  required = false,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  iconLeft = null,
  error = '',
  disabled = false,
  autoComplete,
}) {
  const autoId = useId();
  const fieldId = id || autoId;

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Build class list for input element
  const inputClasses = [
    'zy-field-input',
    iconLeft        ? 'has-icon-left'  : '',
    isPassword      ? 'has-icon-right' : '',
    error           ? 'error'          : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="zy-field">
      {label && (
        <label htmlFor={fieldId} className="zy-field-label">
          {label}
          {required && <span className="zy-field-required" aria-hidden="true"> *</span>}
        </label>
      )}

      <div className="zy-field-wrapper">
        {/* Left Icon */}
        {iconLeft && (
          <span className="zy-field-icon zy-field-icon-left" aria-hidden="true">
            {iconLeft}
          </span>
        )}

        <input
          id={fieldId}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          required={required}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            className="zy-field-icon zy-field-icon-right"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            tabIndex={0}
          >
            {showPassword ? (
              /* Eye-Off Icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
                  a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4
                  c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07
                  a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              /* Eye Icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <span id={`${fieldId}-error`} className="zy-field-error-msg" role="alert">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
