/**
 * forgot-password.jsx — Vite entry point for the Forgot Password page.
 * Mounts the React ForgotPasswordPage component into #app-forgot-password.
 */
import './bootstrap'; // sets up window.axios with default headers
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ForgotPasswordPage from './pages/ForgotPassword';

const container = document.getElementById('app-forgot-password');

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <ForgotPasswordPage />
    </StrictMode>
  );
}
