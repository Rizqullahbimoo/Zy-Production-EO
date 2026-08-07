/**
 * CustomerContact.jsx — Halaman /contact customer.
 * Berisi: Informasi kontak + form pesan langsung.
 */
import { useState } from 'react';

export default function CustomerContact() {
  const [formState, setFormState] = useState({ nama: '', kontak: '', pesan: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await window.axios.post('/api/pesan', {
        nama_lengkap: formState.nama,
        kontak: formState.kontak,
        pesan: formState.pesan
      });

      if (response.data?.status === 'success') {
        setIsSubmitted(true);
        setFormState({ nama: '', kontak: '', pesan: '' });
      } else {
        alert('Gagal mengirim pesan, silakan coba lagi.');
      }
    } catch (err) {
      console.error('Error submitting pesan:', err);
      alert('Terjadi kesalahan saat mengirim pesan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: 'Telepon & WhatsApp',
      value: '+62 821-3456-7890',
      link: 'https://wa.me/6282134567890',
      linkLabel: 'Chat WhatsApp →'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      title: 'Surel Bisnis',
      value: 'info@zyproduction.com',
      link: 'mailto:info@zyproduction.com',
      linkLabel: 'Kirim Email →'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      title: 'Alamat Kantor Pusat',
      value: 'Jl. Kemang Raya No. 45B, Mampang Prapatan, Jakarta Selatan, 12730',
      link: 'https://maps.google.com',
      linkLabel: 'Lihat di Maps →'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: 'Jam Operasional',
      value: 'Senin – Sabtu: 09:00 – 18:00 WIB',
      sub: 'Minggu & Hari Libur: Tutup'
    },
  ];

  const faqs = [
    {
      q: 'Berapa lama proses konfirmasi pemesanan?',
      a: 'Setelah request custom dikirimkan, tim kami akan merespons dan memberikan penawaran resmi dalam 1-2 hari kerja.'
    },
    {
      q: 'Apakah tersedia paket untuk event outdoor?',
      a: 'Ya, kami memiliki paket yang dapat dikustomisasi untuk event indoor maupun outdoor, termasuk outbound dan team building.'
    },
    {
      q: 'Bagaimana cara melakukan pembayaran?',
      a: 'Pembayaran dilakukan melalui transfer bank setelah penawaran resmi disetujui. Tim CS kami akan memberikan panduan lengkap.'
    },
    {
      q: 'Apakah bisa melakukan survei lokasi terlebih dahulu?',
      a: 'Tentu saja. Kami menyediakan layanan survei lokasi dan konsultasi tatap muka tanpa biaya tambahan.'
    },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      {/* ── PAGE HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '5rem 0 3rem',
        textAlign: 'center',
        color: '#fff'
      }}>
        <div className="container">
          <span className="section-tag">Hubungi Kami</span>
          <h1 className="section-title" style={{ color: '#fff', marginTop: '1rem' }}>
            Konsultasikan Acara Impian <span className="text-gradient">Anda Sekarang</span>
          </h1>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '1.5rem auto 0', opacity: 0.8 }}>
            Punya pertanyaan terkait paket, kapasitas, atau ingin meeting presentasi konsep? Tim CS kami aktif melayani Anda.
          </p>
        </div>
      </section>

      {/* ── CONTACT METHODS + FORM ── */}
      <section className="contact-section" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="container grid-two-cols">

          {/* Left: Contact Info */}
          <div className="contact-info">
            <h2 className="section-title">Informasi Kontak</h2>
            <div className="contact-methods">
              {contactMethods.map((method, i) => (
                <div key={i} className="method-item">
                  <div className="method-icon">{method.icon}</div>
                  <div>
                    <h5>{method.title}</h5>
                    <p style={{ margin: '0.25rem 0' }}>{method.value}</p>
                    {method.sub && <p style={{ margin: '0.1rem 0', opacity: 0.6, fontSize: '0.85rem' }}>{method.sub}</p>}
                    {method.link && (
                      <a
                        href={method.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-gold, #D4AF37)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {method.linkLabel}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>Ikuti Kami di Media Sosial</h4>
              <div className="social-links">
                {['instagram', 'facebook', 'youtube'].map((s, idx) => (
                  <a key={idx} href={`https://${s}.com`} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                    <span className="sr-only">{s}</span>
                    {s === 'instagram' && (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    )}
                    {s === 'facebook' && (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    )}
                    {s === 'youtube' && (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="contact-form-card">
            {isSubmitted ? (
              <div className="text-center" style={{ padding: '3rem 0' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ marginBottom: '0.75rem' }}>Pesan Terkirim!</h3>
                <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>Terima kasih telah menghubungi ZY Production. Kami akan merespons dalam 1×24 jam kerja.</p>
                <button className="btn btn-primary" onClick={() => setIsSubmitted(false)}>
                  Kirim Pesan Lagi
                </button>
              </div>
            ) : (
              <>
                <h3>Kirim Pesan Langsung</h3>
                <p>Tinggalkan kontak Anda, kami akan segera merespons dalam waktu 1×24 jam kerja.</p>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input
                      type="text"
                      name="nama"
                      className="form-control"
                      placeholder="Masukkan nama Anda"
                      value={formState.nama}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email & No. WhatsApp</label>
                    <input
                      type="text"
                      name="kontak"
                      className="form-control"
                      placeholder="Contoh: user@email.com / 0812..."
                      value={formState.kontak}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pesan Pertanyaan</label>
                    <textarea
                      name="pesan"
                      className="form-control"
                      rows="5"
                      placeholder="Jelaskan kebutuhan rencana event Anda..."
                      value={formState.pesan}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pertanyaan'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section style={{ background: 'var(--color-surface, #1e1e2e)', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
          </div>
          <div style={{ maxWidth: '720px', margin: '3rem auto 0' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '0',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '1.25rem 0',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                  }}
                >
                  {faq.q}
                  <svg
                    viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(180deg)' : 'none', flexShrink: 0, marginLeft: '1rem' }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: '1.25rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
