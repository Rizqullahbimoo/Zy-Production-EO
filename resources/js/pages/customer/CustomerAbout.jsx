/**
 * CustomerAbout.jsx — Halaman /about customer.
 * Berisi: Hero, Visi & Misi, Tentang ZY, What We Can Do, Dokumen Legalitas, Tim Kami.
 */
import { Link } from 'react-router-dom';

export default function CustomerAbout() {
  const team = [
    { name: 'Ahmad Herryandi', role: 'Founder & CEO', photo: '/documents/assets/TEAM/ahmad-herryandi-avatar.jpg' },
    { name: 'Anggun Meutia', role: 'Event Director', photo: '/documents/assets/TEAM/anggun-meutia-avatar.jpg' },
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


  return (
    <>
      {/* ── ABOUT HERO ── */}
      <section
        className="about-page-hero"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8EA 50%, #FFFFFF 100%)',
          padding: '5rem 0 3rem',
          textAlign: 'center',
          color: 'var(--color-text-main)',
        }}
      >
        <div className="container">
          <span className="section-tag">Tentang Kami</span>
          <h1 className="section-title" style={{ color: 'var(--color-text-main)', marginTop: '1rem' }}>
            ABOUT US
          </h1>
          <p
            className="section-subtitle"
            style={{ maxWidth: '680px', margin: '1.5rem auto 0', opacity: 0.85, fontSize: '15px', lineHeight: '1.7' }}
          >
            Halaman ini menampilkan profil singkat ZY Production sebagai penyedia layanan event organizer berbasis
            website yang membantu pengguna merencanakan dan memesan layanan event secara lebih terstruktur.
          </p>
        </div>
      </section>

      {/* ── VISI & MISI ── */}
      <section style={{ background: 'var(--color-surface-2, #F8F9FA)', padding: '4rem 0' }}>
        <div className="container">
          <div className="about-visi-misi-grid">
            {/* Visi */}
            <div
              style={{
                background: 'var(--color-bg-card, #FFFFFF)',
                border: '1px solid var(--color-border, #E7E7E7)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: 'var(--color-primary-muted, rgba(226,154,0,0.12))',
                  border: '1px solid rgba(226,154,0,0.3)',
                  color: 'var(--color-primary, #E29A00)',
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
              <h3 style={{ color: 'var(--color-text-main)', fontSize: '17px', marginBottom: '0.75rem' }}>
                Menjadi Mitra Event yang Terpercaya
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13.5px', lineHeight: '1.7', margin: 0 }}>
                Menjadi penyedia layanan event organizer yang profesional, adaptif, dan mudah diakses melalui sistem
                digital untuk mendukung berbagai kebutuhan acara.
              </p>
            </div>

            {/* Misi */}
            <div
              style={{
                background: 'var(--color-bg-card, #FFFFFF)',
                border: '1px solid var(--color-border, #E7E7E7)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: 'var(--color-primary-muted, rgba(226,154,0,0.12))',
                  border: '1px solid rgba(226,154,0,0.3)',
                  color: 'var(--color-primary, #E29A00)',
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
              <h3 style={{ color: 'var(--color-text-main)', fontSize: '17px', marginBottom: '0.75rem' }}>
                Mewujudkan Event Secara Terarah
              </h3>
              <ul
                style={{
                  color: 'var(--color-text-muted)',
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
      <section className="about-section" style={{ padding: '5rem 0', overflow: 'hidden' }}>
        <div className="container">
          <div className="about-tentang-grid">

            {/* Text */}
            <div>
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

            {/* Photo Collage */}
            <div style={{ position: 'relative', height: '420px' }}>

              {/* Foto Besar — persegi panjang landscape, full width */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '55%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(30,22,6,0.18)',
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                  zIndex: 2,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 28px 60px rgba(30,22,6,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 20px 50px rgba(30,22,6,0.18)'; }}
              >
                <img
                  src="/documents/assets/about/foto tim 1.jpeg"
                  alt="Tim ZY Production"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Gradient overlay bottom */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                  background: 'linear-gradient(to top, rgba(30,22,6,0.55), transparent)',
                }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                  <span style={{
                    display: 'inline-block', background: 'rgba(226,154,0,0.9)',
                    color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>Tim Profesional</span>
                </div>
              </div>

              {/* Foto Kecil Kiri — bawah kiri */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: '48.5%',
                  height: '40%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 35px rgba(30,22,6,0.15)',
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                  zIndex: 2,
                  border: '3px solid #fff',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 20px 45px rgba(30,22,6,0.22)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 12px 35px rgba(30,22,6,0.15)'; }}
              >
                <img
                  src="/documents/assets/about/foto tim 2.jpeg"
                  alt="Tim ZY Production 2"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Foto Kecil Kanan — bawah kanan */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  width: '48.5%',
                  height: '40%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 35px rgba(30,22,6,0.15)',
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                  zIndex: 2,
                  border: '3px solid #fff',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 20px 45px rgba(30,22,6,0.22)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 12px 35px rgba(30,22,6,0.15)'; }}
              >
                <img
                  src="/documents/assets/about/foto tim 3.jpeg"
                  alt="Tim ZY Production 3"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Gold accent blob background */}
              <div style={{
                position: 'absolute',
                right: '-30px',
                top: '20%',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(226,154,0,0.18) 0%, transparent 70%)',
                zIndex: 1,
                pointerEvents: 'none',
              }} />

              {/* Decorative dots */}
              <div style={{
                position: 'absolute',
                left: '-16px',
                bottom: '15%',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 8px)',
                gap: '6px',
                zIndex: 1,
                pointerEvents: 'none',
              }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(226,154,0,0.4)' }} />
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE CAN DO? ── */}
      <section style={{ background: 'var(--color-surface-2, #F8F9FA)', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Layanan Kami</span>
            <h2 className="section-title" style={{ marginTop: '0.75rem' }}>What We Can Do?</h2>
            <p className="section-subtitle">
              Berikut adalah layanan utama yang kami tawarkan untuk membantu mewujudkan setiap kebutuhan acara Anda.
            </p>
          </div>

          <div className="about-services-grid" style={{ marginTop: '3rem' }}>
            {services.map((svc, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-bg-card, #FFFFFF)',
                  border: '1px solid var(--color-border, #E7E7E7)',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(30,22,6,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(226,154,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = 'var(--color-border, #E7E7E7)';
                }}
              >
                {/* Icon Placeholder */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'var(--color-primary-muted, rgba(226,154,0,0.1))',
                    border: '1px solid rgba(226,154,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '1rem',
                  }}
                >
                  {svc.icon}
                </div>
                <h4 style={{ color: 'var(--color-text-main)', fontSize: '14.5px', marginBottom: '0.6rem' }}>{svc.title}</h4>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
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
              ZY Production beroperasi secara sah dan terdaftar resmi. Klik dokumen untuk melihat preview.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginTop: '3rem',
            }}
          >
            {[
              {
                title: 'Nomor Induk Berusaha (NIB)',
                subtitle: 'Halaman 1 & 2',
                images: [
                  '/documents/assets/legalitas/NIB_page-0001.jpg',
                  '/documents/assets/legalitas/NIB_page-0002.jpg',
                ],
                badge: 'Terverifikasi',
              },
              {
                title: 'Sertifikat BNSP RI',
                subtitle: 'MICE (Meeting, Incentive, Convention, Exhibition)',
                images: ['/documents/assets/legalitas/SERTIFIKAT BNSP RI - MICE.jpg'],
                badge: 'Tersertifikasi',
              },
              {
                title: 'Sertifikat BNSP RI',
                subtitle: 'Experiential Learning',
                images: ['/documents/assets/legalitas/SERTIFIKAT BNSP RI - EXPERIENTAL LEARNING.jpg'],
                badge: 'Tersertifikasi',
              },
            ].map((doc, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-bg-card, #FFFFFF)',
                  border: '1px solid var(--color-border, #E7E7E7)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(30,22,6,0.14)';
                  e.currentTarget.style.borderColor = 'rgba(226,154,0,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = 'var(--color-border, #E7E7E7)';
                }}
                onClick={() => {
                  // Open lightbox modal
                  if (document.getElementById('legal-lightbox')) return;
                  const overlay = document.createElement('div');
                  overlay.id = 'legal-lightbox';
                  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;overflow-y:auto;animation:fadeIn 0.3s ease';
                  overlay.onclick = (ev) => { if (ev.target === overlay) overlay.remove(); };

                  // Close button
                  const closeBtn = document.createElement('button');
                  closeBtn.innerHTML = '✕';
                  closeBtn.style.cssText = 'position:fixed;top:1.5rem;right:1.5rem;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:1.5rem;width:44px;height:44px;border-radius:50%;cursor:pointer;z-index:10000;backdrop-filter:blur(10px);transition:background 0.2s';
                  closeBtn.onmouseenter = () => closeBtn.style.background = 'rgba(226,154,0,0.8)';
                  closeBtn.onmouseleave = () => closeBtn.style.background = 'rgba(255,255,255,0.15)';
                  closeBtn.onclick = () => overlay.remove();
                  overlay.appendChild(closeBtn);

                  // Title
                  const titleEl = document.createElement('h3');
                  titleEl.textContent = doc.title + (doc.subtitle ? ' — ' + doc.subtitle : '');
                  titleEl.style.cssText = 'color:#fff;font-size:1.1rem;margin-bottom:1.5rem;text-align:center';
                  overlay.appendChild(titleEl);

                  // Images container
                  const imgContainer = document.createElement('div');
                  imgContainer.style.cssText = 'display:flex;gap:1rem;max-width:90vw;max-height:80vh;align-items:flex-start;justify-content:center;flex-wrap:wrap';
                  doc.images.forEach(src => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = doc.title;
                    img.style.cssText = 'max-height:78vh;max-width:100%;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.4);object-fit:contain';
                    imgContainer.appendChild(img);
                  });
                  overlay.appendChild(imgContainer);

                  document.body.appendChild(overlay);
                }}
              >
                {/* Preview Image */}
                <div style={{
                  position: 'relative',
                  height: '260px',
                  background: 'var(--color-surface-2, #F4F4F4)',
                  overflow: 'hidden',
                }}>
                  <img
                    src={doc.images[0]}
                    alt={doc.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                    }}
                  />
                  {/* Overlay on hover hint */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(30,22,6,0.5) 0%, transparent 50%)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    paddingBottom: '1rem',
                  }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.95)',
                      color: 'var(--color-text-main, #1E1606)',
                      fontSize: '11px', fontWeight: 600,
                      padding: '5px 14px', borderRadius: '999px',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}>
                      🔍 Klik untuk Preview
                    </span>
                  </div>

                  {/* Badge */}
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(34, 139, 34, 0.9)',
                      color: '#fff', fontSize: '10px', fontWeight: 700,
                      padding: '4px 10px', borderRadius: '999px',
                      letterSpacing: '0.04em',
                      boxShadow: '0 2px 8px rgba(34,139,34,0.3)',
                    }}>✓ {doc.badge}</span>
                  </div>

                  {/* Multi-page indicator */}
                  {doc.images.length > 1 && (
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                      <span style={{
                        display: 'inline-block',
                        background: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff', fontSize: '10px', fontWeight: 600,
                        padding: '4px 10px', borderRadius: '999px',
                      }}>📄 {doc.images.length} Halaman</span>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div style={{ padding: '1.25rem' }}>
                  <h4 style={{
                    color: 'var(--color-text-main)',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    marginBottom: '0.3rem',
                  }}>{doc.title}</h4>
                  <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    margin: 0,
                  }}>{doc.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIM KAMI ── */}
      <section style={{ background: 'var(--color-surface-2, #F8F9FA)', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Orang-Orang Hebat</span>
            <h2 className="section-title" style={{ marginTop: '0.75rem' }}>Tim ZY Production</h2>
            <p className="section-subtitle">
              Profesional berpengalaman yang berdedikasi penuh untuk setiap event Anda.
            </p>
          </div>
          <div className="about-team-row" style={{ marginTop: '3rem' }}>
            {team.map((member, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-bg-card, #FFFFFF)',
                  border: '1px solid var(--color-border, #E7E7E7)',
                  borderRadius: '20px',
                  padding: '2.5rem 3rem',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  minWidth: '240px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(30,22,6,0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Photo */}
                <div style={{
                  width: '140px', height: '140px',
                  borderRadius: '50%',
                  margin: '0 auto 1.25rem',
                  overflow: 'hidden',
                  border: '3px solid rgba(226,154,0,0.35)',
                  boxShadow: '0 8px 24px rgba(226,154,0,0.15)',
                }}>
                  <img
                    src={member.photo}
                    alt={member.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </div>
                <h4 style={{ color: 'var(--color-text-main)', marginBottom: '0.3rem', fontSize: '1.05rem', fontWeight: 700 }}>{member.name}</h4>
                <p style={{ color: 'var(--color-primary, #E29A00)', fontSize: '0.8rem', margin: 0, fontWeight: 600 }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
