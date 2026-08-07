/**
 * admin-dashboard.jsx — Vite entry point for the Admin Dashboard page.
 * Mounts the React AdminDashboard page into #app-admin-dashboard.
 */
import './bootstrap'; // sets up window.axios with default headers
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminDashboard from './pages/AdminDashboard';

const container = document.getElementById('app-admin-dashboard');

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <AdminDashboard />
    </StrictMode>
  );
}
