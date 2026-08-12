/**
 * CustomerPortfolio.jsx — Halaman /portfolio customer.
 * Berisi: Galeri dokumentasi event dengan filter tabs per kategori.
 * Portfolio items sekarang fetch dari API galeri backend.
 */
import { useState, useEffect } from 'react';

export default function CustomerPortfolio() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  // Static fallback portfolio jika galeri backend kosong
  const staticPortfolio = [
    { id: 1, image: '/images/wedding.png',   title: 'Grand Wedding Bimo & Rara',      category: 'Wedding',   desc: 'Hotel Mulia Senayan, Jakarta' },
    { id: 2, image: '/images/launching.png', title: 'ZY Tech Brand Launch',           category: 'Launching', desc: 'Indo Convention Hall, Jakarta' },
    { id: 3, image: '/images/outbound.png',  title: 'Outbound Bank Mandiri',          category: 'Outbound',  desc: 'Taman Safari, Bogor' },
    { id: 4, image: '/images/birthday.png',  title: 'Sweet 17 Clarissa',              category: 'Party',     desc: 'The Ritz-Carlton, Mega Kuningan' },
    { id: 5, image: '/images/gathering.png', title: 'Gala Dinner Astra International',category: 'Gathering', desc: 'InterContinental, Bandung' },
    { id: 6, image: '/images/study.png',     title: 'Study Field HighScope School',   category: 'Other',     desc: 'Museum Nasional Indonesia' },
  ];

  useEffect(() => {
    window.axios.get('/api/galeri')
      .then(res => {
        if (res.data.status === 'success' && res.data.data?.length > 0) {
          setGalleryItems(res.data.data.map(item => ({
            id: item.id_galeri,
            image: item.foto || '/images/login-hero.jpg',
            title: item.judul,
            category: 'Event',
            desc: item.deskripsi || '',
            tanggal: item.tanggal
          })));
        } else {
          setGalleryItems(staticPortfolio);
        }
      })
      .catch(() => setGalleryItems(staticPortfolio))
      .finally(() => setLoadingGallery(false));
  }, []);

  const tabs = ['All', ...new Set(galleryItems.map(i => i.category))];

  const filtered = activeTab === 'All'
    ? galleryItems
    : galleryItems.filter(i => i.category === activeTab);

  return (
    <>
      {/* ── PAGE HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8EA 50%, #FFFFFF 100%)',
        padding: '5rem 0 3rem',
        textAlign: 'center',
        color: 'var(--color-text-main)'
      }}>
        <div className="container">
          <span className="section-tag">Karya Terbaik Kami</span>
          <h1 className="section-title" style={{ color: 'var(--color-text-main)', marginTop: '1rem' }}>
            Galeri Dokumentasi <span className="text-gradient">Event</span>
          </h1>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '1.5rem auto 0', opacity: 0.8 }}>
            Intip sekilas kemeriahan, keindahan, dan suasana hangat yang berhasil kami abadikan pada event-event sebelumnya.
          </p>
        </div>
      </section>

      {/* ── PORTFOLIO GALLERY ── */}
      <section className="portfolio-section" style={{ paddingTop: '3rem' }}>
        <div className="container">

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {loadingGallery ? (
            <div className="catalog-loading">
              <div className="spinner" />
              <p>Memuat galeri...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center" style={{ padding: '4rem 0', opacity: 0.6 }}>
              <p>Tidak ada item galeri untuk kategori ini.</p>
            </div>
          ) : (
            <div className="portfolio-grid" style={{ marginTop: '2rem' }}>
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="portfolio-item-card"
                  onClick={() => setSelectedItem(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="portfolio-img-box">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="portfolio-img"
                      onError={e => { e.currentTarget.src = '/images/login-hero.jpg'; }}
                    />
                    <div className="portfolio-hover-overlay">
                      <span className="portfolio-item-cat">{item.category}</span>
                      <h4 className="portfolio-item-title">{item.title}</h4>
                      <p className="portfolio-item-location">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            marginTop: '4rem',
            padding: '2rem',
            background: 'var(--color-surface-2, #F8F9FA)',
            borderRadius: '16px',
            border: '1px solid var(--color-border, #E7E7E7)'
          }}>
            {[
              { val: '500+', lbl: 'Event Terdokumentasi' },
              { val: '50+',  lbl: 'Fotografer Partner' },
              { val: '100%', lbl: 'Momen Terabadikan' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary, #E29A00)' }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX MODAL ── */}
      {selectedItem && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedItem(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '700px', padding: 0, overflow: 'hidden' }}
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block' }}
              onError={e => { e.currentTarget.src = '/images/login-hero.jpg'; }}
            />
            <div style={{ padding: '1.5rem' }}>
              <span style={{
                display: 'inline-block',
                background: 'var(--color-primary, #E29A00)',
                color: '#1A1A1A',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.75rem',
                borderRadius: '999px',
                marginBottom: '0.75rem'
              }}>{selectedItem.category}</span>
              <h3 style={{ margin: '0 0 0.5rem' }}>{selectedItem.title}</h3>
              {selectedItem.desc && <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{selectedItem.desc}</p>}
              <button
                className="btn btn-outline"
                style={{ marginTop: '1rem' }}
                onClick={() => setSelectedItem(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
