/**
 * CustomerLayout.jsx — Shared layout wrapper untuk semua halaman customer.
 * Berisi Navbar (top) dan Footer (bottom). Konten halaman di-render via <Outlet />.
 */
import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import '../../../css/pages/home.css';

export default function CustomerLayout() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Confirm modal (pengganti confirm() bawaan browser)
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }
  const askConfirm = (message, onConfirm, title = 'Konfirmasi') => {
    setConfirmModal({ title, message, onConfirm });
  };

  const navigate = useNavigate();

  // Load auth state dari localStorage — auth header untuk axios di-attach
  // per-request oleh interceptor di bootstrap.js, bukan di sini, supaya
  // halaman anak (di-render lewat <Outlet/>) yang fetch data saat mount
  // tidak race dengan effect ini.
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  // Logout
  const handleLogout = () => {
    askConfirm('Apakah Anda yakin ingin keluar dari akun Anda?', () => {
      setConfirmModal(null);
      window.axios.post('/api/logout')
        .then(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
          setToken(null);
          setShowProfileDropdown(false);
          navigate('/');
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
          setToken(null);
          navigate('/');
        });
    }, 'Konfirmasi Keluar');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `nav-link${isActive ? ' nav-link-active' : ''}`;

  const mobileNavLinkClass = ({ isActive }) =>
    `mobile-nav-link${isActive ? ' mobile-nav-link-active' : ''}`;

  return (
    <div className="home-layout">

      {/* ── HEADER NAVIGATION ── */}
      <header className="home-header">
        <div className="header-container">

          {/* Logo */}
          <Link to="/" className="logo-brand" style={{ textDecoration: 'none' }}>
            <img src="/images/logo.jpg" alt="ZY Logo" className="logo-img" />
            <span className="logo-text">ZY <span className="text-gold">Production</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <NavLink to="/"          className={navLinkClass} end>Home</NavLink>
            <NavLink to="/about"     className={navLinkClass}>About</NavLink>
            <NavLink to="/portfolio" className={navLinkClass}>Portfolio</NavLink>
            <NavLink to="/katalog"   className={navLinkClass}>Katalog</NavLink>
            <NavLink to="/contact"   className={navLinkClass}>Contact</NavLink>
            <NavLink to="/status"    className={navLinkClass}>Status</NavLink>
          </nav>

          {/* Auth Widget & Burger */}
          <div className="header-actions">
            {token && user ? (
              <div className="profile-widget">
                <button
                  className="profile-trigger"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <div className="avatar-circle">
                    {user.nama ? user.nama.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  <span className="profile-name">{user.nama}</span>
                  <svg className={`chevron-icon ${showProfileDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" width="16" height="16">
                    <path fill="none" stroke="currentColor" strokeWidth="2" d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {showProfileDropdown && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setShowProfileDropdown(false)} />
                    <div className="profile-dropdown">
                      <div className="dropdown-user-info">
                        <p className="user-name">{user.nama}</p>
                        <p className="user-email">{user.email}</p>
                        <span className="user-role-badge">
                          {user.role === 'admin' ? '👑 Administrator' : '🙋 Customer'}
                        </span>
                      </div>
                      <hr className="dropdown-divider" />
                      <Link
                        to="/status"
                        className="dropdown-item"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <svg className="dropdown-icon" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="none" stroke="currentColor" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Status Pemesanan
                      </Link>

                      {user.role === 'admin' && (
                        <a href="/admin/dashboard" className="dropdown-item">
                          <svg className="dropdown-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="none" stroke="currentColor" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Dashboard Admin
                        </a>
                      )}

                      <hr className="dropdown-divider" />
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <svg className="dropdown-icon" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="none" stroke="currentColor" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <a href="/login" className="btn btn-outline">Masuk</a>
                <a href="/register" className="btn btn-primary">Daftar</a>
              </div>
            )}

            {/* Mobile Burger */}
            <button className="mobile-menu-burger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="mobile-drawer">
            <nav className="mobile-nav-links">
              <NavLink to="/"          className={mobileNavLinkClass} end onClick={closeMobileMenu}>Home</NavLink>
              <NavLink to="/about"     className={mobileNavLinkClass} onClick={closeMobileMenu}>About</NavLink>
              <NavLink to="/portfolio" className={mobileNavLinkClass} onClick={closeMobileMenu}>Portfolio</NavLink>
              <NavLink to="/katalog"   className={mobileNavLinkClass} onClick={closeMobileMenu}>Katalog</NavLink>
              <NavLink to="/contact"   className={mobileNavLinkClass} onClick={closeMobileMenu}>Contact</NavLink>
              <NavLink to="/status"    className={mobileNavLinkClass} onClick={closeMobileMenu}>Status</NavLink>
            </nav>
            <hr className="mobile-divider" />
            {!token && (
              <div className="mobile-auth-actions">
                <a href="/login" className="btn btn-outline btn-full">Masuk</a>
                <a href="/register" className="btn btn-primary btn-full">Daftar</a>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── PAGE CONTENT (React Router Outlet) ── */}
      <main>
        <Outlet context={{ user, token }} />
      </main>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="container footer-grid">
          {/* Logo — di layar lebar duduk di sisi kiri container, kolom lain digeser ke kanan */}
          <img src="/images/logo.jpg" alt="ZY Production" className="footer-logo-img" />

          {/* Col 1 */}
          <div className="footer-col brand-col">
            <p className="footer-brand-desc">
              Mitra andalan penyelenggara event berkualitas. Menyediakan layanan paket standard dan custom terlengkap untuk mewujudkan kesuksesan event Anda.
            </p>
            <div className="social-links">
              {[
                { key: 'instagram', label: '@zyproduction15', href: 'https://instagram.com/zyproduction15', external: true },
                { key: 'tiktok', label: '@zyproductioneo', href: 'https://tiktok.com/@zyproductioneo', external: true },
                { key: 'email', label: 'zyproduction15@gmail.com', href: 'mailto:zyproduction15@gmail.com', external: false },
              ].map(({ key, label, href, external }) => (
                <a
                  key={key}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="social-icon-btn"
                  title={label}
                >
                  <span className="sr-only">{label}</span>
                  {key === 'instagram' && (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  )}
                  {key === 'tiktok' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
                    </svg>
                  )}
                  {key === 'email' && (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <div className="footer-col">
            <h4>Navigasi</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
              <li><Link to="/katalog">Katalog Paket</Link></li>
              <li><Link to="/status">Lacak Status</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="footer-col">
            <h4>Kontak & Jam Kerja</h4>
            <p className="footer-contact-item">
              <strong>Office Hour:</strong><br />
              Senin - Sabtu: 09:00 - 18:00 WIB<br />
              Minggu & Hari Libur: Tutup
            </p>
            <p className="footer-contact-item">
              <strong>Hotline Support:</strong><br />
              +62 812-7777-427 (CS)
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container bottom-flex">
            <p>&copy; {new Date().getFullYear()} ZY Production. All rights reserved.</p>
            <p className="designed-by">Premium Event Organizer</p>
          </div>
        </div>
      </footer>

      {/* Confirm modal — pengganti confirm() bawaan browser */}
      {confirmModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '15px', width: '90%', maxWidth: '420px', border: '1px solid var(--color-border, #E7E7E7)', boxShadow: '0 20px 50px rgba(30,22,6,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--color-text-main)', marginBottom: '1rem' }}>{confirmModal.title}</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={confirmModal.onConfirm}>
                Ya, Keluar
              </button>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmModal(null)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
