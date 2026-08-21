/**
 * reset-password.jsx — Vite entry point for the Reset Password page.
 * Mounts the React ResetPasswordPage component into #app-reset-password.
 */
import './bootstrap'; // sets up window.axios with default headers
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ResetPasswordPage from './pages/ResetPassword';

const container = document.getElementById('app-reset-password');

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <ResetPasswordPage />
    </StrictMode>
  );
}
