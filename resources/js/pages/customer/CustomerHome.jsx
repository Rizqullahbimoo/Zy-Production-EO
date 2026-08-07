/**
 * CustomerHome.jsx — Halaman utama (/) customer.
 * Berisi: Hero Slideshow + Features/Why Us section.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CustomerHome() {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
                  <span className="client-initials">{client.substring(0, 2)}</span>
                  <span className="client-name">{client}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
