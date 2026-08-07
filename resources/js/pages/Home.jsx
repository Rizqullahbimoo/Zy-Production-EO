import { useState, useEffect, useRef } from 'react';
import '../../css/pages/home.css';

export default function HomePage() {
  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Data States
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Custom Request Form Stepper State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestStep, setRequestStep] = useState(1);
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  // Custom Request Form Values
  const [formData, setFormData] = useState({
    id_kategori: '',
    tanggal_acara: '',
    lokasi_acara: '',
    jumlah_tamu: '',
    budget_acara: '',
    catatan: '',
    fasilitas: [] // Array of { id_fasilitas, keterangan }
  });

  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Order Status Tracker Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);

  // Refs for Scroll Navigation
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const portfolioRef = useRef(null);
  const catalogRef = useRef(null);
  const contactRef = useRef(null);

  // Hero slideshow state
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const heroSlides = [
    {
      image: '/images/wedding.png',
      title: 'Pernikahan Megah & Elegan',
      desc: 'Wujudkan momen sakral sekali seumur hidup Anda dengan dekorasi eksklusif dan koordinasi tanpa cela.'
    },
    {
      image: '/images/launching.png',
      title: 'Peluncuran Produk Spektakuler',
      desc: 'Curi perhatian pasar dengan konsep branding kreatif dan eksekusi event launching yang berkelas.'
    },
    {
      image: '/images/outbound.png',
      title: 'Outbound & Team Building Seru',
      desc: 'Tingkatkan soliditas dan performa tim Anda melalui aktivitas outdoor interaktif yang dirancang khusus.'
    },
    {
      image: '/images/gathering.png',
      title: 'Company Gathering & Gala Dinner',
      desc: 'Pererat kebersamaan keluarga besar perusahaan Anda dalam suasana formal maupun santai penuh kehangatan.'
    }
  ];

  // Portfolio items
  const portfolioItems = [
    { id: 1, image: '/images/wedding.png', title: 'Grand Wedding Bimo & Rara', category: 'Wedding', desc: 'Hotel Mulia Senayan, Jakarta' },
    { id: 2, image: '/images/launching.png', title: 'ZY Tech Brand Launch', category: 'Launching', desc: 'Indo Convention Hall, Jakarta' },
    { id: 3, image: '/images/outbound.png', title: 'Outbound Bank Mandiri', category: 'Outbound', desc: 'Taman Safari, Bogor' },
    { id: 4, image: '/images/birthday.png', title: 'Sweet 17 Clarissa', category: 'Party', desc: 'The Ritz-Carlton, Mega Kuningan' },
    { id: 5, image: '/images/gathering.png', title: 'Gala Dinner Astra International', category: 'Gathering', desc: 'InterContinental, Bandung' },
    { id: 6, image: '/images/study.png', title: 'Study Field HighScope School', category: 'Other', desc: 'Museum Nasional Indonesia' }
  ];

  const [activePortfolioTab, setActivePortfolioTab] = useState('All');

  // Load Auth state & initial data
  useEffect(() => {
    // Check Local Storage
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    // Fetch Categories
    window.axios.get('/api/kategori')
      .then(res => {
        if (res.data.status === 'success') {
          setCategories(res.data.data);
        }
      })
      .catch(err => console.error('Failed to load categories', err));

    // Fetch Packages
    fetchPackages();

    // Fetch Testimonials
    window.axios.get('/api/ulasan')
      .then(res => {
        if (res.data.status === 'success') {
          setTestimonials(res.data.data);
        }
      })
      .catch(err => console.error('Failed to load testimonials', err));

    // Auto rotate hero slides every 5 seconds
    const slideInterval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  const fetchPackages = () => {
    setLoadingPackages(true);
    window.axios.get('/api/paket')
      .then(res => {
        if (res.data.status === 'success') {
          setPackages(res.data.data);
        }
      })
      .catch(err => console.error('Failed to load packages', err))
      .finally(() => setLoadingPackages(false));
  };

  // Fetch facilities when category changes in custom request
  useEffect(() => {
    if (formData.id_kategori) {
      setLoadingFacilities(true);
      window.axios.get(`/api/fasilitas?id_kategori=${formData.id_kategori}`)
        .then(res => {
          if (res.data.status === 'success') {
            setFacilities(res.data.data);
            // Reset facilities checklist
            setFormData(prev => ({ ...prev, fasilitas: [] }));
          }
        })
        .catch(err => console.error('Failed to load facilities', err))
        .finally(() => setLoadingFacilities(false));
    } else {
      setFacilities([]);
    }
  }, [formData.id_kategori]);

  // Handler for custom request inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle facility toggle in custom request
  const handleFacilityToggle = (facilityId) => {
    setFormData(prev => {
      const exists = prev.fasilitas.find(f => f.id_fasilitas === facilityId);
      if (exists) {
        return {
          ...prev,
          fasilitas: prev.fasilitas.filter(f => f.id_fasilitas !== facilityId)
        };
      } else {
        return {
          ...prev,
          fasilitas: [...prev.fasilitas, { id_fasilitas: facilityId, keterangan: '' }]
        };
      }
    });
  };

  // Handle facility description/keterangan change
  const handleFacilityDescChange = (facilityId, value) => {
    setFormData(prev => ({
      ...prev,
      fasilitas: prev.fasilitas.map(f =>
        f.id_fasilitas === facilityId ? { ...f, keterangan: value } : f
      )
    }));
  };

  // Submit custom request
  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!token) {
      alert('Silakan login terlebih dahulu untuk mengajukan custom paket.');
      window.location.href = '/login';
      return;
    }

    // Local Validation
    if (!formData.id_kategori) {
      setRequestError('Kategori event harus dipilih.');
      return;
    }
    if (!formData.tanggal_acara) {
      setRequestError('Tanggal acara harus ditentukan.');
      return;
    }
    const today = new Date();
    const eventDate = new Date(formData.tanggal_acara);
    if (eventDate <= today) {
      setRequestError('Tanggal acara harus di masa mendatang (setelah hari ini).');
      return;
    }
    if (!formData.lokasi_acara.trim()) {
      setRequestError('Lokasi acara harus diisi.');
      return;
    }
    if (!formData.jumlah_tamu || parseInt(formData.jumlah_tamu) < 1) {
      setRequestError('Jumlah tamu minimal adalah 1 orang.');
      return;
    }
    if (formData.fasilitas.length === 0) {
      setRequestError('Pilih minimal 1 fasilitas layanan untuk request custom.');
      return;
    }

    setRequestError('');
    setIsSubmittingRequest(true);

    window.axios.post('/api/customer/request-custom', {
      id_kategori: parseInt(formData.id_kategori),
      tanggal_acara: formData.tanggal_acara,
      lokasi_acara: formData.lokasi_acara,
      jumlah_tamu: parseInt(formData.jumlah_tamu),
      budget_acara: formData.budget_acara ? parseFloat(formData.budget_acara) : null,
      catatan: formData.catatan,
      fasilitas: formData.fasilitas
    })
      .then(res => {
        if (res.data.status === 'success') {
          setRequestSuccess(true);
          // Refresh status list if status modal is opened
          fetchMyRequests();
        }
      })
      .catch(err => {
        const errorMsg = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan request custom.';
        setRequestError(errorMsg);
      })
      .finally(() => {
        setIsSubmittingRequest(false);
      });
  };

  // Fetch customer custom requests
  const fetchMyRequests = () => {
    if (!token) return;
    setLoadingStatus(true);
    window.axios.get('/api/customer/request-custom')
      .then(res => {
        if (res.data.status === 'success') {
          setMyRequests(res.data.data);
        }
      })
      .catch(err => console.error('Failed to fetch status', err))
      .finally(() => setLoadingStatus(false));
  };

  const handleOpenStatusModal = () => {
    if (!token) {
      alert('Silakan login terlebih dahulu untuk melacak status pemesanan.');
      window.location.href = '/login';
      return;
    }
    setShowStatusModal(true);
    setSelectedRequestDetail(null);
    fetchMyRequests();
  };

  // Logout function
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
          alert('Berhasil Logout!');
          window.location.href = '/';
        })
        .catch(err => {
          console.error('Logout error', err);
          // Fallback if session expired
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
          setToken(null);
          window.location.reload();
        });
    }
  };

  // Helper to scroll smoothly to ref
  const scrollToRef = (ref) => {
    setIsMobileMenuOpen(false);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Formatting currency IDR
  const formatIDR = (num) => {
    if (!num) return '-';
    return 'Rp ' + parseFloat(num).toLocaleString('id-ID', { maximumFractionDigits: 0 });
  };

  // Format Date Indo
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Filter packages based on category tab
  const filteredPackages = selectedCategoryFilter === 'all'
    ? packages
    : packages.filter(p => p.kategori.id_kategori === parseInt(selectedCategoryFilter));

  const filteredPortfolio = activePortfolioTab === 'All'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activePortfolioTab);

  // Status helper mapping
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'menunggu': return 'badge-warning';
      case 'dikonfirmasi': return 'badge-success';
      case 'ditawarkan': return 'badge-info';
      case 'dibatalkan': return 'badge-danger';
      case 'selesai': return 'badge-primary';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="home-layout">
      {/* ── HEADER NAVIGATION ── */}
      <header className="home-header">
        <div className="header-container">
          {/* Logo Branding */}
          <div className="logo-brand" onClick={() => scrollToRef(homeRef)}>
            <img src="/images/logo-icon.png" alt="ZY Logo" className="logo-img" />
            <span className="logo-text">ZY <span className="text-gold">Production</span></span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <button className="nav-link" onClick={() => scrollToRef(homeRef)}>Home</button>
            <button className="nav-link" onClick={() => scrollToRef(aboutRef)}>About</button>
            <button className="nav-link" onClick={() => scrollToRef(portfolioRef)}>Portfolio</button>
            <button className="nav-link" onClick={() => scrollToRef(catalogRef)}>Katalog</button>
            <button className="nav-link" onClick={() => scrollToRef(contactRef)}>Contact</button>
            <button className="nav-link" onClick={handleOpenStatusModal}>Status</button>
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
                        <span className="user-role-badge">{user.role === 'admin' ? '👑 Administrator' : '🙋 Customer'}</span>
                      </div>
                      <hr className="dropdown-divider" />
                      <button
                        className="dropdown-item"
                        onClick={() => { setShowProfileDropdown(false); handleOpenStatusModal(); }}
                      >
                        <svg className="dropdown-icon" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="none" stroke="currentColor" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Status Pemesanan
                      </button>

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

            {/* Mobile Menu Burger Icon */}
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

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="mobile-drawer">
            <nav className="mobile-nav-links">
              <button className="mobile-nav-link" onClick={() => scrollToRef(homeRef)}>Home</button>
              <button className="mobile-nav-link" onClick={() => scrollToRef(aboutRef)}>About</button>
              <button className="mobile-nav-link" onClick={() => scrollToRef(portfolioRef)}>Portfolio</button>
              <button className="mobile-nav-link" onClick={() => scrollToRef(catalogRef)}>Katalog</button>
              <button className="mobile-nav-link" onClick={() => scrollToRef(contactRef)}>Contact</button>
              <button className="mobile-nav-link" onClick={handleOpenStatusModal}>Status</button>
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

      {/* ── HERO SECTION ── */}
      <section id="home" ref={homeRef} className="hero-section">
        <div className="hero-grid container">
          {/* Hero Left Content */}
          <div className="hero-content">
            <span className="hero-badge">
              <span className="pulse-dot"></span>
              ✨ Professional Event Organizer
            </span>
            <h1 className="hero-title">
              Wujudkan Event Impian <br />
              <span className="text-gradient">Sempurna & Berkelas</span> <br />
              Bersama ZY Production
            </h1>
            <p className="hero-desc">
              Kami merancang, mengelola, dan mengeksekusi setiap detail acara Anda dengan standar profesional tertinggi. Dari pernikahan megah hingga gathering korporat berskala besar.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-primary btn-lg" onClick={() => scrollToRef(catalogRef)}>
                Lihat Katalog Event
                <svg className="cta-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => scrollToRef(aboutRef)}>
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          {/* Hero Right Slideshow Graphic */}
          <div className="hero-slider-container">
            <div className="hero-glass-card">
              <div className="slider-wrapper">
                {heroSlides.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`slider-slide ${idx === currentHeroSlide ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                  >
                    <div className="slide-overlay">
                      <div className="slide-caption">
                        <span className="slide-category-badge">Showcase {idx + 1}</span>
                        <h3>{slide.title}</h3>
                        <p>{slide.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider Dots */}
              <div className="slider-dots">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    className={`slider-dot ${idx === currentHeroSlide ? 'active' : ''}`}
                    onClick={() => setCurrentHeroSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="why-us" className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Kenapa Harus ZY Production?</h2>
            <p className="section-subtitle">
              Dedikasi kami adalah menghadirkan kualitas terbaik pada setiap tahap koordinasi event. Rasakan keunggulan layanan menyeluruh kami.
            </p>
          </div>

          <div className="features-grid">
            {/* Card 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="feature-card-title">Konsep Fleksibel</h3>
              <p className="feature-card-desc">
                Desain konsep event yang fleksibel dan dapat dikustomisasi penuh agar sesuai dengan visi, keunikan, serta rencana anggaran Anda.
              </p>
            </div>

            {/* Card 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="feature-card-title">Tim Berpengalaman</h3>
              <p className="feature-card-desc">
                Didukung oleh tim profesional dan vendor terbaik yang berpengalaman bertahun-tahun dalam mengeksekusi berbagai skala acara.
              </p>
            </div>

            {/* Card 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="feature-card-title">Pemesanan Praktis</h3>
              <p className="feature-card-desc">
                Proses pemesanan paket event transparan, terintegrasi digital, dan didukung konsultasi interaktif kapan saja dibutuhkan.
              </p>
            </div>

            {/* Card 4 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="feature-card-title">Layanan Terorganisir</h3>
              <p className="feature-card-desc">
                Manajemen operasional yang disiplin dan presisi, memastikan timeline berjalan tertib tanpa kendala pada hari pelaksanaan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" ref={aboutRef} className="about-section">
        <div className="container grid-two-cols">
          <div className="about-visual">
            <div className="visual-collage">
              <img src="/images/login-hero.jpg" alt="About Showcase" className="about-main-img" />
              <div className="about-floating-card">
                <p className="floating-number">500+</p>
                <p className="floating-text">Event Sukses</p>
              </div>
            </div>
          </div>

          <div className="about-content">
            <span className="section-tag">Tentang Kami</span>
            <h2 className="section-title">Dedikasi Membangun Kenangan yang Tak Terlupakan</h2>
            <p className="about-paragraph">
              ZY Production adalah event management partner tepercaya yang berkantor pusat di Indonesia. Kami mendedikasikan diri untuk merancang konsep acara kreatif yang orisinal, serta didukung oleh presisi koordinasi lapangan yang luar biasa.
            </p>
            <p className="about-paragraph text-muted">
              Baik acara intimate keluarga kecil seperti ulang tahun atau pesta pernikahan megah, hingga kegiatan outbound serta rapat korporat berskala ratusan peserta — kami siap menyelesaikannya secara eksklusif. Kami mendengarkan kebutuhan klien secara teliti dan menerjemahkannya ke dalam realita yang memukau.
            </p>

            <div className="about-stats">
              <div className="stat-item">
                <h4>99%</h4>
                <p>Kepuasan Klien</p>
              </div>
              <div className="stat-item">
                <h4>10+</h4>
                <p>Kota Jangkauan</p>
              </div>
              <div className="stat-item">
                <h4>5★</h4>
                <p>Rating Vendor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO SECTION ── */}
      <section id="portfolio" ref={portfolioRef} className="portfolio-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Galeri Dokumentasi Event</h2>
            <p className="section-subtitle">
              Intip sekilas kemeriahan, keindahan, dan suasana hangat yang berhasil kami abadikan pada event-event sebelumnya.
            </p>
          </div>

          {/* Portfolio Filter Tabs */}
          <div className="filter-tabs">
            {['All', 'Wedding', 'Launching', 'Outbound', 'Party', 'Gathering'].map(tab => (
              <button
                key={tab}
                className={`filter-tab ${activePortfolioTab === tab ? 'active' : ''}`}
                onClick={() => setActivePortfolioTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className="portfolio-grid">
            {filteredPortfolio.map(item => (
              <div key={item.id} className="portfolio-item-card">
                <div className="portfolio-img-box">
                  <img src={item.image} alt={item.title} className="portfolio-img" />
                  <div className="portfolio-hover-overlay">
                    <span className="portfolio-item-cat">{item.category}</span>
                    <h4 className="portfolio-item-title">{item.title}</h4>
                    <p className="portfolio-item-location">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KATALOG & PAKET LAYANAN SECTION ── */}
      <section id="katalog" ref={catalogRef} className="catalog-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Pilihan Paket</span>
            <h2 className="section-title">Katalog Paket Layanan Terbaik Kami</h2>
            <p className="section-subtitle">
              Pilih dari beragam paket standard terpopuler yang telah kami rancang dengan fasilitas lengkap dan harga ekonomis.
            </p>
          </div>

          {/* Catalog Filter Tabs */}
          <div className="catalog-categories">
            <button
              className={`catalog-cat-btn ${selectedCategoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategoryFilter('all')}
            >
              Semua Paket ({packages.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id_kategori}
                className={`catalog-cat-btn ${selectedCategoryFilter === cat.id_kategori.toString() ? 'active' : ''}`}
                onClick={() => setSelectedCategoryFilter(cat.id_kategori.toString())}
              >
                {cat.nama_kategori} ({cat.jumlah_paket})
              </button>
            ))}
          </div>

          {/* Packages Grid */}
          {loadingPackages ? (
            <div className="catalog-loading">
              <div className="spinner" />
              <p>Memuat paket layanan...</p>
            </div>
          ) : (
            <div className="packages-grid">
              {filteredPackages.map(pkg => (
                <div key={pkg.id_paket} className="package-card">
                  <div className="package-img-wrapper">
                    <img
                      src={pkg.foto || '/images/login-hero.jpg'}
                      alt={pkg.nama_paket}
                      className="package-img"
                      onError={(e) => {
                        e.currentTarget.src = '/images/login-hero.jpg';
                      }}
                    />
                    <span className="package-category-label">{pkg.kategori.nama_kategori}</span>
                  </div>
                  <div className="package-body">
                    <h3 className="package-title">{pkg.nama_paket}</h3>
                    <p className="package-desc">{pkg.deskripsi}</p>
                    <div className="package-footer">
                      <div className="package-price-box">
                        <span className="price-label">Mulai Dari</span>
                        <span className="price-value">{formatIDR(pkg.harga)}</span>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          if (!token) {
                            alert('Silakan login terlebih dahulu untuk melakukan pemesanan.');
                            window.location.href = '/login';
                          } else {
                            // Open custom request prefilled or standard checkout notice
                            alert(`Untuk memesan paket "${pkg.nama_paket}", Anda dapat langsung berkonsultasi melalui form Request Custom Paket kami.`);
                            setShowRequestModal(true);
                            setFormData(prev => ({
                              ...prev,
                              id_kategori: pkg.kategori.id_kategori.toString(),
                              catatan: "",
                            }));
                          }
                        }}
                      >
                        Detail & Pesan
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Special Custom Package Invitation Card */}
              <div className="package-card custom-package-promo-card">
                <div className="promo-card-content">
                  <div className="promo-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="promo-title">Butuh Paket Custom?</h3>
                  <p className="promo-desc">
                    Miliki visi event tersendiri? Padukan fasilitas, sesuaikan budget, dan rancang paket custom spesial Anda bersama planner profesional kami.
                  </p>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => {
                      if (!token) {
                        alert('Silakan login terlebih dahulu untuk mengajukan custom paket.');
                        window.location.href = '/login';
                      } else {
                        setShowRequestModal(true);
                        setRequestStep(1);
                        setRequestSuccess(false);
                        setRequestError('');
                        setFormData({
                          id_kategori: '',
                          tanggal_acara: '',
                          lokasi_acara: '',
                          jumlah_tamu: '',
                          budget_acara: '',
                          catatan: '',
                          fasilitas: []
                        });
                      }
                    }}
                  >
                    Buat Custom Paket
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CLIENTS SECTION ── */}
      <section className="clients-section">
        <div className="container">
          <div className="section-header text-center">
            <h3 className="section-tag-small">Kemitraan Terpercaya</h3>
            <h2 className="section-title">Client Kami!</h2>
          </div>

          <div className="clients-grid">
            {['TechCorp', 'GlobalBiz', 'MediaGroup', 'StarStudio', 'JavaVentures', 'IndoPrime'].map((client, idx) => (
              <div key={idx} className="client-logo-circle">
                <div className="client-logo-content">
                  <span className="client-initials">{client.substring(0,2)}</span>
                  <span className="client-name">{client}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Ulasan Klien</span>
            <h2 className="section-title">Apa Kata Mereka?</h2>
            <p className="section-subtitle">
              Kepuasan klien adalah prioritas utama kami. Berikut adalah pengalaman mereka yang telah mempercayakan momen spesialnya bersama ZY Production.
            </p>
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>Belum ada ulasan saat ini.</div>
          ) : (
            <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {testimonials.map(item => (
                <div key={item.id_ulasan} className="testimonial-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(226,154,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e29a00', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {item.user.nama.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#fff' }}>{item.user.nama}</h4>
                      <div style={{ color: '#e29a00', marginTop: '0.2rem' }}>
                        {"★".repeat(item.rating)}{"☆".repeat(5-item.rating)}
                      </div>
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{item.komentar || 'Sangat memuaskan dan direkomendasikan!'}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section id="contact" ref={contactRef} className="contact-section">
        <div className="container grid-two-cols">
          {/* Left Column: Info */}
          <div className="contact-info">
            <span className="section-tag">Hubungi Kami</span>
            <h2 className="section-title">Konsultasikan Acara Impian Anda Sekarang</h2>
            <p className="contact-desc">
              Punya pertanyaan terkait paket, kapasitas, atau ingin melakukan meeting presentasi konsep? Tim CS kami aktif melayani Anda.
            </p>

            <div className="contact-methods">
              <div className="method-item">
                <div className="method-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h5>Telepon & WhatsApp</h5>
                  <p>+62 821-3456-7890</p>
                </div>
              </div>

              <div className="method-item">
                <div className="method-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h5>Surel Bisnis</h5>
                  <p>info@zyproduction.com</p>
                </div>
              </div>

              <div className="method-item">
                <div className="method-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h5>Alamat Kantor Pusat</h5>
                  <p>Jl. Kemang Raya No. 45B, Mampang Prapatan, Jakarta Selatan, 12730</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-card">
            <h3>Kirim Pesan Langsung</h3>
            <p>Tinggalkan kontak Anda, kami akan segera merespons dalam waktu 1x24 jam kerja.</p>

            <form onSubmit={(e) => { e.preventDefault(); alert('Pesan berhasil terkirim! Terima kasih telah menghubungi ZY Production.'); e.currentTarget.reset(); }}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input type="text" className="form-control" placeholder="Masukkan nama Anda" required />
              </div>
              <div className="form-group">
                <label>Email & No. WhatsApp</label>
                <input type="text" className="form-control" placeholder="Contoh: user@email.com / 0812..." required />
              </div>
              <div className="form-group">
                <label>Pesan Pertanyaan</label>
                <textarea className="form-control" rows="4" placeholder="Jelaskan kebutuhan rencana event Anda..." required></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Kirim Pertanyaan</button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="container footer-grid">
          {/* Col 1 */}
          <div className="footer-col brand-col">
            <div className="logo-brand">
              <img src="/images/logo-icon.png" alt="ZY Logo" className="logo-img" />
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
              <li><button onClick={() => scrollToRef(homeRef)}>Home</button></li>
              <li><button onClick={() => scrollToRef(aboutRef)}>About</button></li>
              <li><button onClick={() => scrollToRef(portfolioRef)}>Portfolio</button></li>
              <li><button onClick={() => scrollToRef(catalogRef)}>Katalog Paket</button></li>
              <li><button onClick={handleOpenStatusModal}>Lacak Status</button></li>
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


      {/* ── MODAL: REQUEST CUSTOM PAKET ── */}
      {showRequestModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Buat Request Custom Paket</h3>
              <button className="close-btn" onClick={() => { setShowRequestModal(false); setRequestSuccess(false); }}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {requestSuccess ? (
                <div className="success-step text-center">
                  <div className="success-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3>Pengajuan Berhasil Dikirim!</h3>
                  <p>
                    Custom paket Anda telah masuk ke sistem. Tim kami akan segera meninjau, menyusun penawaran terbaik, dan memperbarui status pemesanan Anda.
                  </p>
                  <div className="success-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowRequestModal(false);
                        setRequestSuccess(false);
                        handleOpenStatusModal();
                      }}
                    >
                      Pantau Status Pemesanan
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => { setShowRequestModal(false); setRequestSuccess(false); }}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest}>
                  {requestError && <div className="error-alert">{requestError}</div>}

                  {/* Stepper indicators */}
                  <div className="stepper-indicator">
                    <div className={`step-dot ${requestStep >= 1 ? 'active' : ''}`}>1. Info Event</div>
                    <div className={`step-line ${requestStep >= 2 ? 'active' : ''}`} />
                    <div className={`step-dot ${requestStep >= 2 ? 'active' : ''}`}>2. Pilih Fasilitas</div>
                    <div className={`step-line ${requestStep >= 3 ? 'active' : ''}`} />
                    <div className={`step-dot ${requestStep >= 3 ? 'active' : ''}`}>3. Catatan & Kirim</div>
                  </div>

                  {/* STEP 1: Basic Info */}
                  {requestStep === 1 && (
                    <div className="step-content">
                      <div className="form-group">
                        <label className="required-label">Kategori Event</label>
                        <select
                          className="form-control"
                          name="id_kategori"
                          value={formData.id_kategori}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">-- Pilih Kategori Event --</option>
                          {categories.map(cat => (
                            <option key={cat.id_kategori} value={cat.id_kategori}>
                              {cat.nama_kategori}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="required-label">Tanggal Acara</label>
                          <input
                            type="date"
                            className="form-control"
                            name="tanggal_acara"
                            value={formData.tanggal_acara}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="required-label">Jumlah Tamu (Pax)</label>
                          <input
                            type="number"
                            className="form-control"
                            name="jumlah_tamu"
                            placeholder="Contoh: 250"
                            value={formData.jumlah_tamu}
                            onChange={handleInputChange}
                            min="1"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="required-label">Lokasi Acara (Kota/Gedung)</label>
                        <input
                          type="text"
                          className="form-control"
                          name="lokasi_acara"
                          placeholder="Contoh: Ballroom Hotel Grand, Mampang"
                          value={formData.lokasi_acara}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Rencana Budget Maksimal (Rp)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="budget_acara"
                          placeholder="Masukkan angka, contoh: 50000000"
                          value={formData.budget_acara}
                          onChange={handleInputChange}
                        />
                        <span className="input-tip">Kosongkan jika ingin dihitung otomatis oleh perencana kami.</span>
                      </div>

                      <div className="modal-footer-actions">
                        <span className="step-info">Langkah 1 dari 3</span>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={!formData.id_kategori || !formData.tanggal_acara || !formData.lokasi_acara || !formData.jumlah_tamu}
                          onClick={() => setRequestStep(2)}
                        >
                          Lanjut: Pilih Fasilitas
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Choose Facilities */}
                  {requestStep === 2 && (
                    <div className="step-content">
                      <h4 className="facilities-title">
                        Pilih Fasilitas & Layanan Pendukung
                      </h4>
                      <p className="facilities-subtitle">
                        Fasilitas disesuaikan dengan kategori event Anda. Klik checkbox untuk menyertakan.
                      </p>

                      {loadingFacilities ? (
                        <div className="loading-facilities-spinner">
                          <div className="spinner" />
                          <p>Mengambil fasilitas terkait kategori...</p>
                        </div>
                      ) : facilities.length === 0 ? (
                        <div className="no-facilities-notice">
                          <p>Tidak ada fasilitas standar terdaftar untuk kategori ini. Anda dapat menulis fasilitas manual pada kolom catatan di langkah selanjutnya.</p>
                        </div>
                      ) : (
                        <div className="facilities-checklist-container">
                          {facilities.map(fac => {
                            const isChecked = !!formData.fasilitas.find(f => f.id_fasilitas === fac.id_fasilitas);
                            const currentFacObj = formData.fasilitas.find(f => f.id_fasilitas === fac.id_fasilitas);

                            return (
                              <div key={fac.id_fasilitas} className={`facility-checklist-item ${isChecked ? 'selected' : ''}`}>
                                <div className="checkbox-row" onClick={() => handleFacilityToggle(fac.id_fasilitas)}>
                                  <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                                    {isChecked && (
                                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="facility-label-desc">
                                    <span className="facility-name">{fac.nama_fasilitas}</span>
                                    {fac.deskripsi && <span className="facility-desc">{fac.deskripsi}</span>}
                                  </div>
                                </div>

                                {isChecked && (
                                  <div className="facility-input-detail">
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      placeholder="Tambahkan detail permintaan khusus untuk fasilitas ini (opsional)..."
                                      value={currentFacObj?.keterangan || ''}
                                      onChange={(e) => handleFacilityDescChange(fac.id_fasilitas, e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="modal-footer-actions">
                        <button type="button" className="btn btn-outline" onClick={() => setRequestStep(1)}>
                          Kembali
                        </button>
                        <span className="step-info">Langkah 2 dari 3</span>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={formData.fasilitas.length === 0}
                          onClick={() => setRequestStep(3)}
                        >
                          Lanjut: Catatan Akhir
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Summary & Notes */}
                  {requestStep === 3 && (
                    <div className="step-content">
                      <div className="form-group">
                        <label>Catatan Tambahan / Deskripsi Rencana Event</label>
                        <textarea
                          className="form-control"
                          name="catatan"
                          rows="5"
                          placeholder="Tulis instruksi khusus, tema warna, layout yang diinginkan, atau pertanyaan tambahan..."
                          value={formData.catatan}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>

                      <div className="summary-card">
                        <h4>Ringkasan Pengajuan</h4>
                        <div className="summary-grid">
                          <div>
                            <span>Kategori:</span>
                            <strong>
                              {categories.find(c => c.id_kategori.toString() === formData.id_kategori)?.nama_kategori || '-'}
                            </strong>
                          </div>
                          <div>
                            <span>Tanggal:</span>
                            <strong>{formatDateIndo(formData.tanggal_acara)}</strong>
                          </div>
                          <div>
                            <span>Tamu:</span>
                            <strong>{formData.jumlah_tamu} Pax</strong>
                          </div>
                          <div>
                            <span>Lokasi:</span>
                            <strong>{formData.lokasi_acara}</strong>
                          </div>
                          <div>
                            <span>Budget:</span>
                            <strong>{formData.budget_acara ? formatIDR(formData.budget_acara) : 'Otomatis'}</strong>
                          </div>
                          <div>
                            <span>Fasilitas Terpilih:</span>
                            <strong>{formData.fasilitas.length} Layanan</strong>
                          </div>
                        </div>
                      </div>

                      <div className="modal-footer-actions">
                        <button type="button" className="btn btn-outline" onClick={() => setRequestStep(2)}>
                          Kembali
                        </button>
                        <span className="step-info">Langkah 3 dari 3</span>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmittingRequest}
                        >
                          {isSubmittingRequest ? 'Mengirim...' : 'Kirim Pengajuan'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ── MODAL: LACAK STATUS PEMESANAN ── */}
      {showStatusModal && (
        <div className="modal-backdrop">
          <div className="modal-container status-modal-width">
            <div className="modal-header">
              <h3>Lacak Status Pemesanan & Request Custom</h3>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body status-modal-body">
              {loadingStatus ? (
                <div className="status-loading">
                  <div className="spinner" />
                  <p>Mengambil data pengajuan Anda...</p>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="no-status-notice text-center">
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <h4>Belum Ada Pengajuan Custom</h4>
                  <p>Anda belum memiliki request custom paket yang sedang berjalan.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowStatusModal(false);
                      setShowRequestModal(true);
                      setRequestStep(1);
                      setRequestSuccess(false);
                    }}
                  >
                    Ajukan Custom Paket Sekarang
                  </button>
                </div>
              ) : (
                <div className="status-layout-grid">
                  {/* Left List */}
                  <div className="status-sidebar-list">
                    <h4 className="list-title">Daftar Pengajuan Anda</h4>
                    <div className="status-cards-scroll">
                      {myRequests.map(req => (
                        <div
                          key={req.id_request}
                          className={`status-item-card ${selectedRequestDetail?.id_request === req.id_request ? 'active' : ''}`}
                          onClick={() => setSelectedRequestDetail(req)}
                        >
                          <div className="status-item-header">
                            <span className="req-code">REQ #{req.id_request}</span>
                            <span className={`status-badge ${getStatusBadgeClass(req.status_request)}`}>
                              {req.status_request.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="req-category">{req.kategori_event?.nama_kategori || 'Event Custom'}</h4>
                          <p className="req-date">📅 {formatDateIndo(req.tanggal_acara)}</p>
                          <div className="req-footer">
                            <span>📍 {req.lokasi_acara}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Detail Pane */}
                  <div className="status-detail-pane">
                    {selectedRequestDetail ? (
                      <div className="detail-pane-content">
                        <div className="detail-pane-header">
                          <div>
                            <h3>Request Custom #{selectedRequestDetail.id_request}</h3>
                            <p className="submit-timestamp">Diajukan pada: {new Date(selectedRequestDetail.tanggal_request || selectedRequestDetail.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                          </div>
                          <span className={`status-badge-lg ${getStatusBadgeClass(selectedRequestDetail.status_request)}`}>
                            {selectedRequestDetail.status_request.toUpperCase()}
                          </span>
                        </div>

                        <div className="detail-info-block">
                          <h4>Informasi Dasar Acara</h4>
                          <div className="detail-info-grid">
                            <div className="info-cell">
                              <span className="cell-lbl">Kategori</span>
                              <span className="cell-val">{selectedRequestDetail.kategori_event?.nama_kategori}</span>
                            </div>
                            <div className="info-cell">
                              <span className="cell-lbl">Tanggal Pelaksanaan</span>
                              <span className="cell-val">{formatDateIndo(selectedRequestDetail.tanggal_acara)}</span>
                            </div>
                            <div className="info-cell">
                              <span className="cell-lbl">Lokasi Acara</span>
                              <span className="cell-val">{selectedRequestDetail.lokasi_acara}</span>
                            </div>
                            <div className="info-cell">
                              <span className="cell-lbl">Jumlah Tamu Undangan</span>
                              <span className="cell-val">{selectedRequestDetail.jumlah_tamu} Pax</span>
                            </div>
                            <div className="info-cell">
                              <span className="cell-lbl">Budget yang Diajukan</span>
                              <span className="cell-val">{selectedRequestDetail.budget_acara ? formatIDR(selectedRequestDetail.budget_acara) : 'Sesuai Penawaran'}</span>
                            </div>
                          </div>
                        </div>

                        {selectedRequestDetail.catatan && (
                          <div className="detail-notes-block">
                            <h4>Catatan Tambahan Customer</h4>
                            <p className="notes-text">{selectedRequestDetail.catatan}</p>
                          </div>
                        )}

                        {/* Penawaran Section */}
                        {selectedRequestDetail.penawaran_custom && selectedRequestDetail.penawaran_custom.length > 0 ? (
                          <div className="detail-offers-block">
                            <h4>👑 Penawaran Harga dari Admin</h4>
                            {selectedRequestDetail.penawaran_custom.map(offer => (
                              <div key={offer.id_penawaran} className="offer-box">
                                <div className="offer-header">
                                  <span className="offer-tag">Tawaran Resmi</span>
                                  <span className="offer-date">Diajukan: {formatDateIndo(offer.created_at)}</span>
                                </div>
                                <div className="offer-price">
                                  <span>Total Anggaran Ditawarkan</span>
                                  <h3>{formatIDR(offer.harga_penawaran)}</h3>
                                </div>
                                {offer.deskripsi && (
                                  <div className="offer-desc">
                                    <strong>Rincian Penawaran:</strong>
                                    <p>{offer.deskripsi}</p>
                                  </div>
                                )}
                                <div className="offer-status-label">
                                  <span>Status Penawaran: </span>
                                  <strong>{offer.status_penawaran.toUpperCase()}</strong>
                                </div>
                                <div className="offer-actions-container">
                                  <p className="whatsapp-prompt">
                                    💡 Untuk menyetujui, menegosiasikan rincian, atau melakukan pembayaran, silakan hubungi tim sales kami di nomor WhatsApp <strong>+62 821-3456-7890</strong> dengan melampirkan Kode Request <strong>REQ #{selectedRequestDetail.id_request}</strong>.
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          selectedRequestDetail.status_request === 'menunggu' && (
                            <div className="waiting-offer-notice">
                              <div className="icon-pulse">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 14 14" />
                                </svg>
                              </div>
                              <div>
                                <h5>Menunggu Penawaran Admin</h5>
                                <p>Tim planner kami sedang meninjau spesifikasi fasilitas yang Anda pilih untuk menghitung biaya penawaran resmi. Rincian penawaran akan muncul di sini.</p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="detail-pane-empty text-center">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <p>Pilih salah satu nomor pengajuan di panel sebelah kiri untuk melihat rincian pemesanan, daftar fasilitas terpilih, dan penawaran harga.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
