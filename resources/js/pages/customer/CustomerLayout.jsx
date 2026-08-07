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

  const navigate = useNavigate();

  // Load auth state dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  // Logout
  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun Anda?')) {
      window.axios.post('/api/logout')
        .then(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          delete window.axios.defaults.headers.common['Authorization'];
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
    }
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
          {/* Col 1 */}
          <div className="footer-col brand-col">
            <div className="logo-brand">
              <img src="/images/logo.jpg" alt="ZY Logo" className="logo-img" />
              <span className="logo-text">ZY <span className="text-gold">Production</span></span>
            </div>
            <p className="footer-brand-desc">
              Mitra andalan penyelenggara event berkualitas. Menyediakan layanan paket standard dan custom terlengkap untuk mewujudkan kesuksesan event Anda.
            </p>
            <div className="social-links">
              {['instagram', 'facebook', 'twitter', 'youtube'].map((s, idx) => (
                <a key={idx} href={`https://${s}.com`} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                  <span className="sr-only">{s}</span>
                  {s === 'instagram' && (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  )}
                  {s === 'facebook' && (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  )}
                  {s === 'twitter' && (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  )}
                  {s === 'youtube' && (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
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
              +62 821-3456-7890 (CS)
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
    </div>
  );
}
