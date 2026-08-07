/**
 * register.jsx — Vite entry point for the Register page.
 * Mounts the React RegisterPage into #app-register.
 */
import './bootstrap'; // sets up window.axios
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import RegisterPage from './pages/Register';

const container = document.getElementById('app-register');

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <RegisterPage />
    </StrictMode>
  );
}
