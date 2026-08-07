/**
 * CustomerAbout.jsx — Halaman /about customer.
 * Berisi: Tentang Kami section + statistik perusahaan.
 */
export default function CustomerAbout() {
  const stats = [
    { value: '500+', label: 'Event Sukses' },
    { value: '99%',  label: 'Kepuasan Klien' },
    { value: '10+',  label: 'Kota Jangkauan' },
    { value: '5★',   label: 'Rating Vendor' },
  ];

  const team = [
    { name: 'Ahmad Fauzi', role: 'Founder & CEO', emoji: '👨‍💼' },
    { name: 'Siti Rahayu', role: 'Event Director', emoji: '👩‍💼' },
    { name: 'Budi Santoso', role: 'Creative Designer', emoji: '🎨' },
    { name: 'Dewi Lestari', role: 'Client Relations', emoji: '🤝' },
  ];

  const milestones = [
    { year: '2015', title: 'ZY Production Berdiri', desc: 'Mulai dari event kecil keluarga dan komunitas lokal di Jakarta.' },
    { year: '2017', title: 'Ekspansi Korporat', desc: 'Mulai melayani klien korporasi besar seperti konferensi dan gala dinner.' },
    { year: '2019', title: '100+ Event Milestone', desc: 'Mencapai 100 event sukses dengan rating kepuasan klien 98%.' },
    { year: '2022', title: 'Platform Digital', desc: 'Meluncurkan sistem pemesanan custom paket berbasis digital.' },
    { year: '2025', title: '500+ Event Sukses', desc: 'Dipercaya oleh ratusan klien dari berbagai industri di 10+ kota Indonesia.' },
  ];

  return (
    <>
      {/* ── ABOUT HERO ── */}
      <section className="about-page-hero" style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '5rem 0 3rem',
        textAlign: 'center',
        color: '#fff'
      }}>
        <div className="container">
          <span className="section-tag">Tentang Kami</span>
          <h1 className="section-title" style={{ color: '#fff', marginTop: '1rem' }}>
            Dedikasi Membangun <br />
            <span className="text-gradient">Kenangan Tak Terlupakan</span>
          </h1>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '1.5rem auto 0', opacity: 0.8 }}>
            Lebih dari satu dekade kami hadir untuk mewujudkan setiap acara menjadi momen yang berkesan dan bermakna bagi klien kami.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'var(--color-surface, #1e1e2e)', padding: '3rem 0' }}>
        <div className="container">
          <div className="about-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {stats.map((stat, i) => (
              <div key={i} className="stat-item" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold, #D4AF37)', marginBottom: '0.5rem' }}>{stat.value}</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT CONTENT ── */}
      <section className="about-section">
        <div className="container grid-two-cols">
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

          <div className="about-content">
            <span className="section-tag">Tentang Kami</span>
            <h2 className="section-title">Dari Passion Menjadi Profesi Terpercaya</h2>
            <p className="about-paragraph">
              ZY Production adalah event management partner tepercaya yang berkantor pusat di Indonesia. Kami mendedikasikan diri untuk merancang konsep acara kreatif yang orisinal, serta didukung oleh presisi koordinasi lapangan yang luar biasa.
            </p>
            <p className="about-paragraph text-muted">
              Baik acara intimate keluarga kecil seperti ulang tahun atau pesta pernikahan megah, hingga kegiatan outbound serta rapat korporat berskala ratusan peserta — kami siap menyelesaikannya secara eksklusif. Kami mendengarkan kebutuhan klien secara teliti dan menerjemahkannya ke dalam realita yang memukau.
            </p>
            <p className="about-paragraph text-muted">
              Dengan pengalaman lebih dari 10 tahun dan ratusan event sukses, kami membangun setiap acara dengan sentuhan profesionalisme tinggi, kreativitas tanpa batas, serta komitmen penuh terhadap kepuasan setiap klien.
            </p>
          </div>
        </div>
      </section>

      {/* ── TIMELINE PERJALANAN ── */}
      <section style={{ background: 'var(--color-surface, #1e1e2e)', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Jejak Langkah Kami</span>
            <h2 className="section-title">Perjalanan ZY Production</h2>
          </div>
          <div style={{ marginTop: '3rem', position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'linear-gradient(to bottom, var(--color-gold, #D4AF37), transparent)',
              transform: 'translateX(-50%)'
            }} />
            {milestones.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end',
                marginBottom: '2rem',
                paddingLeft: i % 2 === 0 ? '0' : '55%',
                paddingRight: i % 2 === 0 ? '55%' : '0',
                position: 'relative'
              }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '1.2rem',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'var(--color-gold, #D4AF37)',
                  border: '3px solid #1e1e2e',
                  transform: 'translateX(-50%)',
                  zIndex: 1
                }} />
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  maxWidth: '380px',
                  width: '100%'
                }}>
                  <span style={{
                    display: 'inline-block',
                    background: 'var(--color-gold, #D4AF37)',
                    color: '#0f0f1a',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.75rem',
                    borderRadius: '999px',
                    marginBottom: '0.5rem'
                  }}>{m.year}</span>
                  <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.4rem' }}>{m.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: 0 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIM KAMI ── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Orang-Orang Hebat</span>
            <h2 className="section-title">Tim ZY Production</h2>
            <p className="section-subtitle">Profesional berpengalaman yang berdedikasi penuh untuk setiap event Anda.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
            {team.map((member, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
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
