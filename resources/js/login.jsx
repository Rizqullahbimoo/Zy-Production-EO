/**
 * login.jsx — Vite entry point for the Login page.
 * Mounts the React LoginPage component into #app-login.
 */
import './bootstrap';   // sets up window.axios with default headers
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import LoginPage from './pages/Login';

const container = document.getElementById('app-login');

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <LoginPage />
    </StrictMode>
  );
}
