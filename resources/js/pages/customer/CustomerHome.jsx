/**
 * CustomerHome.jsx — Halaman utama (/) customer.
 * Berisi: Hero Slideshow + Features/Why Us section.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Fallback statis dipakai selagi /api/galeri belum merespons, atau kalau
// fetch gagal/kosong — supaya hero tidak pernah tampil kosong.
const staticHeroSlides = [
  {
    id: 'static-wedding',
    image: '/images/wedding.png',
    title: 'Pernikahan Megah & Elegan',
    desc: 'Wujudkan momen sakral sekali seumur hidup Anda dengan dekorasi eksklusif dan koordinasi tanpa cela.'
  },
  {
    id: 'static-launching',
    image: '/images/launching.png',
    title: 'Peluncuran Produk Spektakuler',
    desc: 'Curi perhatian pasar dengan konsep branding kreatif dan eksekusi event launching yang berkelas.'
  },
  {
    id: 'static-outbound',
    image: '/images/outbound.png',
    title: 'Outbound & Team Building Seru',
    desc: 'Tingkatkan soliditas dan performa tim Anda melalui aktivitas outdoor interaktif yang dirancang khusus.'
  },
  {
    id: 'static-birthday',
    image: '/images/birthday.png',
    title: 'Pesta Ulang Tahun Berkesan',
    desc: 'Ciptakan momen spesial hari jadi Anda dengan dekorasi tematik dan rangkaian hiburan yang meriah.'
  },
  {
    id: 'static-gathering',
    image: '/images/gathering.png',
    title: 'Company Gathering & Gala Dinner',
    desc: 'Pererat kebersamaan keluarga besar perusahaan Anda dalam suasana formal maupun santai penuh kehangatan.'
  },
  {
    id: 'static-study',
    image: '/images/study.png',
    title: 'Kunjungan Studi & Edukasi Terkoordinasi',
    desc: 'Kelola kegiatan studi lapangan sekolah maupun instansi dengan koordinasi peserta dan alur kunjungan yang tertata rapi.'
  }
];

export default function CustomerHome() {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState(staticHeroSlides);

  // Ambil data galeri yang sama dengan yang dipakai halaman Portfolio, supaya
  // showcase di Home otomatis ikut berubah saat admin menambah/mengedit/
  // menghapus foto lewat form Galeri Event — tidak perlu edit kode lagi.
  useEffect(() => {
    window.axios.get('/api/galeri')
      .then(res => {
        if (res.data.status === 'success' && res.data.data?.length > 0) {
          // Urutkan berdasarkan "Urutan Tampil" (ascending, terkecil duluan),
          // lalu batasi maksimal 6 slide untuk showcase.
          const sorted = [...res.data.data].sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
          setHeroSlides(sorted.slice(0, 6).map(item => ({
            id: item.id_galeri,
            image: item.foto || '/images/login-hero.jpg',
            title: item.judul,
            desc: item.deskripsi || ''
          })));
          setCurrentHeroSlide(0);
        }
        // Sukses tapi kosong: biarkan fallback statis yang sudah tampil.
      })
      .catch(() => {
        // Gagal fetch: biarkan fallback statis yang sudah tampil.
      });
  }, []);

  // Bergantung pada heroSlides.length supaya interval selalu selaras dengan
  // jumlah slide saat ini — termasuk saat data live menggantikan fallback.
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const credentials = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      title: 'Bersertifikasi BNSP',
      desc: 'Badan sertifikasi profesi resmi'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: '8+ Tahun Pengalaman',
      desc: 'Dalam industri event organizer'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      ),
      title: 'Tim Internal Terlatih',
      desc: 'Bukan tim lepas/cabutan'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      title: 'Badan Hukum Resmi',
      desc: 'Demi kepercayaan klien & vendor'
    }
  ];

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      title: 'Konsep Fleksibel',
      desc: 'Desain konsep event yang fleksibel dan dapat dikustomisasi penuh agar sesuai dengan visi, keunikan, serta rencana anggaran Anda.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Tim Berpengalaman',
      desc: 'Didukung oleh tim profesional dan vendor terbaik yang berpengalaman bertahun-tahun dalam mengeksekusi berbagai skala acara.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: 'Pemesanan Praktis',
      desc: 'Proses pemesanan paket event transparan, terintegrasi digital, dan didukung konsultasi interaktif kapan saja dibutuhkan.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      title: 'Layanan Terorganisir',
      desc: 'Manajemen operasional yang disiplin dan presisi, memastikan timeline berjalan tertib tanpa kendala pada hari pelaksanaan.'
    }
  ];

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section id="home" className="hero-section">
        <div className="hero-grid container">
          {/* Hero Left Content */}
          <div className="hero-content">
            <h1 className="hero-title">
              Wujudkan Event Impian <br />
              <span className="text-gradient">Sempurna & Berkelas</span> <br />
              Bersama ZY Production
            </h1>
            <p className="hero-desc">
              Kami merancang, mengelola, dan mengeksekusi setiap detail acara Anda dengan standar profesional tertinggi. Dari pernikahan megah hingga gathering korporat berskala besar.
            </p>
            <div className="hero-ctas">
              <Link to="/katalog" className="btn btn-primary btn-lg">
                Lihat Katalog Event
                <svg className="cta-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/about" className="btn btn-secondary btn-lg">
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>

          {/* Hero Right Slideshow */}
          <div className="hero-slider-container">
            <div className="hero-glass-card">
              <div className="slider-wrapper">
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
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
              <div className="slider-dots">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    className={`slider-dot ${idx === currentHeroSlide ? 'active' : ''}`}
                    onClick={() => setCurrentHeroSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES / WHY US SECTION ── */}
      <section id="why-us" className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Kenapa Harus ZY Production?</h2>
            <p className="section-subtitle">
              Dedikasi kami adalah menghadirkan kualitas terbaik pada setiap tahap koordinasi event. Rasakan keunggulan layanan menyeluruh kami.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feat, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon-wrapper">{feat.icon}</div>
                <h3 className="feature-card-title">{feat.title}</h3>
                <p className="feature-card-desc">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA menuju katalog */}
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/katalog" className="btn btn-primary btn-lg">
              Explore Katalog Paket
              <svg className="cta-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="none" stroke="currentColor" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CREDENTIALS / BADGE SECTION ── */}
      <section className="credentials-section">
        <div className="container">
          <div className="credentials-grid">
            {credentials.map((cred, idx) => (
              <div key={idx} className="credential-card">
                <div className="credential-icon-wrapper">{cred.icon}</div>
                <h3 className="credential-card-title">{cred.title}</h3>
                <p className="credential-card-desc">{cred.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
