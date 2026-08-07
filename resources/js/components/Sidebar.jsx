import { useState, useEffect } from 'react';
import '../../css/components/sidebar.css';

export default function Sidebar({ activeItem: propActiveItem, defaultActive = 'dashboard', defaultTheme = 'light', onSelect, onLogout, categories = [], user }) {
  // Sidebar states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localActiveItem, setLocalActiveItem] = useState(defaultActive);

  // Use prop if provided, otherwise fallback to local state
  const activeItem = propActiveItem !== undefined ? propActiveItem : localActiveItem;

  // Custom setter that notifies parent and updates local state if uncontrolled
  const setActiveItem = (itemId) => {
    if (propActiveItem === undefined) {
      setLocalActiveItem(itemId);
    }
    if (onSelect) {
      onSelect(itemId);
    }
  };

  // Notify parent of active item changes
  useEffect(() => {
    if (onSelect) {
      onSelect(activeItem);
    }
  }, [activeItem, onSelect]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(defaultTheme);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Toggle dropdown menus (e.g. Fasilitas Layanan)
  const toggleDropdown = (menuId) => {
    if (isCollapsed) {
      // Expand sidebar first if user clicks a dropdown when collapsed
      setIsCollapsed(false);
      setOpenDropdowns((prev) => ({ ...prev, [menuId]: true }));
    } else {
      setOpenDropdowns((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
    }
  };

  // Change theme handler
  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  // Toggle sidebar collapse
  const handleSidebarCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.zy-profile-widget-wrapper')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // SVG Icons library
  const icons = {
    dashboard: (
      <svg className="zy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
    pemesanan: (
      <svg className="zy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    custom: (
      <svg className="zy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    kategori: (
      <svg className="zy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    event: (
      <svg className="zy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    fasilitas: (
      <svg className="zy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    galeri: (
      <svg className="zy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    admin: (
      <svg className="zy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    laporan: (
      <svg className="zy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    search: (
      <svg className="zy-sidebar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    chevron: (
      <svg className="zy-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    collapse: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
        <path d="m16 15-3-3 3-3" />
      </svg>
    ),
    expand: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
        <path d="m13 15 3-3-3-3" />
      </svg>
    ),
    sun: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    moon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  };

  // Define sidebar menu config dynamically using categories prop
  const menuConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
    { id: 'data-pemesanan', label: 'Data Pemesanan', icon: icons.pemesanan },
    { id: 'custom-paket', label: 'Custom Paket', icon: icons.custom },
    { id: 'kategori-crud', label: 'Kategori Event', icon: icons.kategori },
    {
      id: 'kategori-event',
      label: 'Paket Event',
      icon: icons.event,
      hasDropdown: true,
      submenus: categories.length > 0 ? categories.map(cat => ({
        id: `kategori-${cat.id_kategori}`,
        label: cat.nama_kategori
      })) : [
        { id: 'kategori-1', label: 'Wedding Event' },
        { id: 'kategori-2', label: 'Outbound' },
        { id: 'kategori-3', label: 'Launching Product' },
        { id: 'kategori-4', label: 'Study Field' },
        { id: 'kategori-5', label: 'Birthday Party' },
        { id: 'kategori-6', label: 'Gathering' }
      ]
    },
    {
      id: 'fasilitas-layanan',
      label: 'Fasilitas Layanan',
      icon: icons.fasilitas,
      hasDropdown: true,
      submenus: categories.length > 0 ? categories.map(cat => ({
        id: `fasilitas-${cat.id_kategori}`,
        label: cat.nama_kategori
      })) : [
        { id: 'wedding-event', label: 'Wedding Event' },
        { id: 'outbound', label: 'Outbound' },
        { id: 'launching-product', label: 'Launching Product' },
        { id: 'study-field', label: 'Study Field' },
        { id: 'birthday-party', label: 'Birthday Party' },
        { id: 'gathering', label: 'Gathering' }
      ]
    },
    { id: 'pesan-masuk', label: 'Pesan Masuk', icon: icons.laporan }, // Reusing laporan icon for now
    { id: 'laporan', label: 'Laporan Keuangan', icon: icons.laporan },
    { id: 'galeri-event', label: 'Galeri Event', icon: icons.galeri },
    { id: 'profil-admin', label: 'Profil Admin', icon: icons.admin }
  ];

  // Filtering menus based on search query
  const getFilteredMenus = () => {
    if (!searchQuery.trim()) return menuConfig;

    const lowerQuery = searchQuery.toLowerCase();

    return menuConfig.map(menu => {
      // If menu itself matches query
      if (menu.label.toLowerCase().includes(lowerQuery)) {
        return menu;
      }

      // If it's a dropdown and one of the submenus matches
      if (menu.hasDropdown && menu.submenus) {
        const filteredSubs = menu.submenus.filter(sub => sub.label.toLowerCase().includes(lowerQuery));
        if (filteredSubs.length > 0) {
          return { ...menu, submenus: filteredSubs, forceOpen: true };
        }
      }
      return null;
    }).filter(Boolean);
  };

  const filteredMenus = getFilteredMenus();

  // Helper to check if a menu is active
  const isMenuOrSubActive = (menu) => {
    if (activeItem === menu.id) return true;
    if (menu.hasDropdown && menu.submenus) {
      return menu.submenus.some(sub => activeItem === sub.id);
    }
    return false;
  };

  return (
    <div className={`zy-sidebar-wrapper theme-${theme}`}>
      <aside className={`zy-sidebar ${isCollapsed ? 'collapsed' : ''}`}>

        {/* TOP BRAND SECTION */}
        <div className="zy-sidebar-header">
          <div className="zy-brand">
            <img
              src="/images/logo.jpg"
              alt="ZY"
              className="zy-brand-logo"
              style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
            />
            <span className="zy-brand-text">ZY Production</span>
          </div>
          <button className="zy-collapse-btn" onClick={handleSidebarCollapse} aria-label="Toggle Sidebar">
            {isCollapsed ? icons.expand : icons.collapse}
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="zy-sidebar-search-box">
          <div className="zy-sidebar-search-wrapper" onClick={() => isCollapsed && setIsCollapsed(false)}>
            {icons.search}
            <input
              type="text"
              placeholder="Cari Menu..."
              className="zy-sidebar-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* NAVIGATION MENUS */}
        <div className="zy-sidebar-content">
          <ul className="zy-menu-list">
            {filteredMenus.map((menu) => {
              const isActive = isMenuOrSubActive(menu);
              const isDropdownOpen = !!(openDropdowns[menu.id] || menu.forceOpen);

              if (menu.hasDropdown) {
                return (
                  <li key={menu.id} className="zy-menu-item-container">
                    <button
                      className={`zy-menu-btn ${isActive ? 'active' : ''}`}
                      onClick={() => toggleDropdown(menu.id)}
                    >
                      {menu.icon}
                      <span className="zy-menu-label">{menu.label}</span>
                      <span className={`zy-arrow-icon ${isDropdownOpen ? 'open' : ''}`}>
                        {icons.chevron}
                      </span>
                    </button>

                    {/* Expandable Submenu in Sidebar */}
                    <div className={`zy-submenu-wrapper ${isDropdownOpen ? 'open' : ''}`}>
                      <ul className="zy-submenu-list">
                        {menu.submenus.map((sub) => (
                          <li key={sub.id}>
                            <button
                              className={`zy-submenu-item-btn ${activeItem === sub.id ? 'active' : ''}`}
                              onClick={() => setActiveItem(sub.id)}
                            >
                              <span className="zy-submenu-bullet" />
                              <span>{sub.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Popover Submenu (Hover when Collapsed) */}
                    {isCollapsed && (
                      <div className="zy-hover-popover">
                        <div className="zy-popover-title">{menu.label}</div>
                        {menu.submenus.map((sub) => (
                          <button
                            key={sub.id}
                            className={`zy-popover-item ${activeItem === sub.id ? 'active' : ''}`}
                            onClick={() => setActiveItem(sub.id)}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Collapsed Tooltip */}
                    {isCollapsed && <div className="zy-tooltip">{menu.label}</div>}
                  </li>
                );
              }

              return (
                <li key={menu.id} className="zy-menu-item-container">
                  <button
                    className={`zy-menu-btn ${activeItem === menu.id ? 'active' : ''}`}
                    onClick={() => setActiveItem(menu.id)}
                  >
                    {menu.icon}
                    <span className="zy-menu-label">{menu.label}</span>
                  </button>

                  {/* Collapsed Tooltip */}
                  {isCollapsed && <div className="zy-tooltip">{menu.label}</div>}
                </li>
              );
            })}
          </ul>
        </div>

        {/* FOOTER WIDGET SECTION */}
        <div className="zy-sidebar-footer">
          {/* Admin User Card */}
          <div className="zy-profile-widget-wrapper">
            <div className="zy-profile-widget" onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ cursor: 'pointer' }}>
              {user && user.foto ? (
                <img
                  src={user.foto.startsWith('http') ? user.foto : `/storage/${user.foto}`}
                  alt="Profile Avatar"
                  className="zy-profile-avatar"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop"
                  alt="Profile Avatar"
                  className="zy-profile-avatar"
                />
              )}
              <div className="zy-profile-info">
                <span className="zy-profile-name">{user ? user.nama : 'Bimo TA'}</span>
                <span className="zy-profile-role">{user ? (user.role === 'admin' ? 'Super Admin' : user.role.toUpperCase()) : 'Super Admin'}</span>
              </div>
            </div>

            {/* Profile Dropdown Options */}
            <div className="zy-profile-popover" style={{ display: isProfileOpen ? 'flex' : 'none' }}>
              <button className="zy-profile-popover-item" onClick={() => { setActiveItem('profil-admin'); setIsProfileOpen(false); }}>
                {icons.admin}
                <span>Profil Detail</span>
              </button>
              <button className="zy-profile-popover-item danger" onClick={() => onLogout ? onLogout() : alert('Logout action triggered.')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Theme Toggler */}
          <div className="zy-controls">
            <button
              className={`zy-theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
              title="Light Mode"
              aria-label="Light Mode"
            >
              {icons.sun}
            </button>
            <button
              className={`zy-theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
              title="Dark Mode"
              aria-label="Dark Mode"
            >
              {icons.moon}
            </button>
          </div>
        </div>

      </aside>
    </div>
  );
}
