/**
 * CustomerAbout.jsx — Halaman /about customer.
 * Berisi: Hero, Visi & Misi, Tentang ZY, What We Can Do, Dokumen Legalitas, Tim Kami.
 */
import { Link } from 'react-router-dom';

export default function CustomerAbout() {
  const team = [
    { name: 'Ahmad Fauzi', role: 'Founder & CEO', emoji: '👨‍💼' },
    { name: 'Siti Rahayu', role: 'Event Director', emoji: '👩‍💼' },
    { name: 'Budi Santoso', role: 'Creative Designer', emoji: '🎨' },
    { name: 'Dewi Lestari', role: 'Client Relations', emoji: '🤝' },
  ];

  const services = [
    {
      icon: '📋',
      title: 'Perencanaan Event',
      desc: 'Membantu menyusun konsep acara, kebutuhan teknis, rundown, dan estimasi pelaksanaan.',
      link: '/katalog',
      label: 'Detail Layanan',
    },
    {
      icon: '📦',
      title: 'Paket Standar',
      desc: 'Menyediakan pilihan paket layanan siap pesan dengan fasilitas yang telah dirancang sebelumnya.',
      link: '/katalog',
      label: 'Lihat Paket',
    },
    {
      icon: '✏️',
      title: 'Custom Paket',
      desc: 'Melayani kebutuhan event yang disesuaikan dengan tema, fasilitas, dan budget pengguna.',
      link: '/katalog?custom=true',
      label: 'Ajukan Request',
    },
    {
      icon: '📸',
      title: 'Dokumentasi & Produksi',
      desc: 'Mendukung kebutuhan dokumentasi acara, koordinasi vendor, dan pengelolaan pelaksanaan event.',
      link: '/portfolio',
      label: 'Lihat Portofolio',
    },
  ];

  const legalDocuments = [
    { title: 'Akta Pendirian Perusahaan', icon: '📄' },
    { title: 'Nomor Induk Berusaha (NIB)', icon: '🏢' },
    { title: 'Surat Izin Usaha Perdagangan (SIUP)', icon: '📜' },
    { title: 'Tanda Daftar Perusahaan (TDP)', icon: '🗂️' },
  ];

  return (
    <>
      {/* ── ABOUT HERO ── */}
      <section
        className="about-page-hero"
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
          padding: '5rem 0 3rem',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <div className="container">
          <span className="section-tag">Tentang Kami</span>
          <h1 className="section-title" style={{ color: '#fff', marginTop: '1rem' }}>
            ABOUT US
          </h1>
          <p
            className="section-subtitle"
            style={{ maxWidth: '680px', margin: '1.5rem auto 0', opacity: 0.8, fontSize: '15px', lineHeight: '1.7' }}
          >
            Halaman ini menampilkan profil singkat ZY Production sebagai penyedia layanan event organizer berbasis
            website yang membantu pengguna merencanakan dan memesan layanan event secara lebih terstruktur.
          </p>
        </div>
      </section>

      {/* ── VISI & MISI ── */}
      <section style={{ background: 'var(--color-surface, #1e1e2e)', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Visi */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: 'var(--color-gold, #D4AF37)',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '4px 12px',
                  borderRadius: '5px',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                }}
              >
                VISI
              </span>
              <h3 style={{ color: '#fff', fontSize: '17px', marginBottom: '0.75rem' }}>
                Menjadi Mitra Event yang Terpercaya
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13.5px', lineHeight: '1.7', margin: 0 }}>
                Menjadi penyedia layanan event organizer yang profesional, adaptif, dan mudah diakses melalui sistem
                digital untuk mendukung berbagai kebutuhan acara.
              </p>
            </div>

            {/* Misi */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: 'var(--color-gold, #D4AF37)',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '4px 12px',
                  borderRadius: '5px',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                }}
              >
                MISI
              </span>
              <h3 style={{ color: '#fff', fontSize: '17px', marginBottom: '0.75rem' }}>
                Mewujudkan Event Secara Terarah
              </h3>
              <ul
                style={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '13.5px',
                  lineHeight: '1.9',
                  margin: 0,
                  paddingLeft: '18px',
                }}
              >
                <li>Menyediakan layanan pemesanan paket event yang mudah dipahami dan diakses.</li>
                <li>Memberikan opsi paket standar dan custom sesuai kebutuhan klien.</li>
                <li>Menjaga kualitas koordinasi, komunikasi, dan dokumentasi setiap proyek event.</li>
                <li>Mengembangkan sistem layanan yang efisien, informatif, dan responsif.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TENTANG ZY PRODUCTION ── */}
      <section className="about-section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
            {/* Text */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <span className="section-tag">Tentang ZY Production</span>
              <h2 className="section-title" style={{ marginTop: '0.75rem' }}>
                Dari Passion Menjadi Profesi Terpercaya
              </h2>
              <p className="about-paragraph" style={{ marginTop: '1rem' }}>
                ZY Production hadir untuk membantu individu, komunitas, maupun instansi dalam mengelola kebutuhan
                acara dengan alur yang jelas, mulai dari konsultasi, pemilihan paket, pengajuan kebutuhan khusus,
                hingga proses pemantauan status layanan.
              </p>
              <p className="about-paragraph text-muted">
                ZY Production adalah event management partner tepercaya yang berkantor pusat di Indonesia. Kami
                mendedikasikan diri untuk merancang konsep acara kreatif yang orisinal, serta didukung oleh presisi
                koordinasi lapangan yang luar biasa.
              </p>
              <p className="about-paragraph text-muted">
                Dengan pengalaman lebih dari 10 tahun dan ratusan event sukses, kami membangun setiap acara dengan
                sentuhan profesionalisme tinggi, kreativitas tanpa batas, serta komitmen penuh terhadap kepuasan
                setiap klien.
              </p>
            </div>

            {/* Image */}
            <div className="about-visual">
              <div className="visual-collage">
                <img
                  src="/images/logo.jpg"
                  alt="ZY Production"
                  className="about-main-img"
                  style={{
                    objectFit: 'contain',
                    backgroundColor: '#000',
                    boxShadow: '0 0 60px rgba(226,154,0,0.25), 0 20px 40px rgba(0,0,0,0.4)',
                  }}
                />
                <div className="about-floating-card">
                  <p className="floating-number">500+</p>
                  <p className="floating-text">Event Sukses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE CAN DO? ── */}
      <section style={{ background: 'var(--color-surface, #1e1e2e)', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Layanan Kami</span>
            <h2 className="section-title" style={{ marginTop: '0.75rem' }}>What We Can Do?</h2>
            <p className="section-subtitle">
              Berikut adalah layanan utama yang kami tawarkan untuk membantu mewujudkan setiap kebutuhan acara Anda.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.25rem',
              marginTop: '3rem',
            }}
          >
            {services.map((svc, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                {/* Icon Placeholder */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '1rem',
                  }}
                >
                  {svc.icon}
                </div>
                <h4 style={{ color: '#fff', fontSize: '14.5px', marginBottom: '0.6rem' }}>{svc.title}</h4>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '12.5px',
                    lineHeight: '1.6',
                    margin: '0 0 1.25rem',
                    flex: 1,
                  }}
                >
                  {svc.desc}
                </p>
                <Link
                  to={svc.link}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {svc.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOKUMEN LEGALITAS ── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Legalitas</span>
            <h2 className="section-title" style={{ marginTop: '0.75rem' }}>Dokumen Legalitas Perusahaan</h2>
            <p className="section-subtitle">
              ZY Production beroperasi secara sah dan terdaftar resmi. Berikut adalah dokumen legalitas perusahaan
              kami.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              marginTop: '3rem',
            }}
          >
            {legalDocuments.map((doc, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(212,175,55,0.3)',
                  borderRadius: '14px',
                  padding: '2rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'background 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212,175,55,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                {/* Document Placeholder Visual */}
                <div
                  style={{
                    width: '70px',
                    height: '90px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    position: 'relative',
                  }}
                >
                  {doc.icon}
                  {/* Folded corner effect */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '18px',
                      height: '18px',
                      background: 'linear-gradient(225deg, rgba(212,175,55,0.3) 50%, transparent 50%)',
                      borderRadius: '0 8px 0 0',
                    }}
                  />
                </div>

                <div>
                  <h4 style={{ color: '#fff', fontSize: '13.5px', marginBottom: '0.4rem' }}>{doc.title}</h4>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '11.5px',
                      margin: 0,
                      fontStyle: 'italic',
                    }}
                  >
                    Dokumen segera tersedia
                  </p>
                </div>

                {/* Placeholder badge */}
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.25)',
                    color: 'var(--color-gold, #D4AF37)',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '999px',
                  }}
                >
                  Coming Soon
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.35)',
              fontSize: '12.5px',
              marginTop: '2rem',
              fontStyle: 'italic',
            }}
          >
            * Dokumen legalitas resmi akan segera diunggah. Untuk informasi lebih lanjut, silakan hubungi kami.
          </p>
        </div>
      </section>

      {/* ── TIM KAMI ── */}
      <section style={{ background: 'var(--color-surface, #1e1e2e)', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Orang-Orang Hebat</span>
            <h2 className="section-title" style={{ marginTop: '0.75rem' }}>Tim ZY Production</h2>
            <p className="section-subtitle">
              Profesional berpengalaman yang berdedikasi penuh untuk setiap event Anda.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginTop: '3rem',
            }}
          >
            {team.map((member, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{member.emoji}</div>
                <h4 style={{ color: '#fff', marginBottom: '0.25rem', fontSize: '1rem' }}>{member.name}</h4>
                <p style={{ color: 'var(--color-gold, #D4AF37)', fontSize: '0.8rem', margin: 0 }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
