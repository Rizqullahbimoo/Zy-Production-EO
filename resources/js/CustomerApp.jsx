/**
 * CustomerApp.jsx — Root SPA entry untuk halaman-halaman customer.
 * Menggunakan React Router v6 untuk navigasi multi-page tanpa full reload.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerAbout from './pages/customer/CustomerAbout';
import CustomerPortfolio from './pages/customer/CustomerPortfolio';
import CustomerKatalog from './pages/customer/CustomerKatalog';
import CustomerContact from './pages/customer/CustomerContact';
import CustomerStatus from './pages/customer/CustomerStatus';

export default function CustomerApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/about" element={<CustomerAbout />} />
          <Route path="/portfolio" element={<CustomerPortfolio />} />
          <Route path="/katalog" element={<CustomerKatalog />} />
          <Route path="/contact" element={<CustomerContact />} />
          <Route path="/status" element={<CustomerStatus />} />
          {/* Fallback: redirect ke home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
