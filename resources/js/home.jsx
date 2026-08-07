/**
 * home.jsx — Vite entry point untuk Customer SPA.
 * Mounts CustomerApp (React Router) ke dalam #app-home.
 */
import './bootstrap';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CustomerApp from './CustomerApp';

const container = document.getElementById('app-home');

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <CustomerApp />
    </StrictMode>
  );
}
