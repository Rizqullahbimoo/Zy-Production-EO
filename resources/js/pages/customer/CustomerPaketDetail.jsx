/**
 * CustomerPaketDetail.jsx — Halaman /katalog/:id customer.
 * Halaman penuh detail satu paket layanan. Mengambil data langsung dari API
 * berdasarkan :id di URL (bukan lewat state yang dioper dari halaman Katalog),
 * supaya tetap berfungsi kalau dibuka langsung dari link atau di-refresh browser.
 *
 * Struktur (rujukan wireframe Hi-Fi V1, gaya visual tetap ikut CSS yang sudah ada):
 *   1. Judul + tagline singkat
 *   2. Dua kolom: Informasi Paket | Fasilitas Paket
 *   3. Blok "Pilih Jalur Layanan" — Pilih Paket / Request Paket
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function CustomerPaketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paket, setPaket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    window.axios.get(`/api/paket/${id}`)
      .then(res => {
        if (res.data.status === "success") setPaket(res.data.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const formatIDR = num => { if (!num) return "-"; return "Rp " + parseFloat(num).toLocaleString("id-ID", { maximumFractionDigits: 0 }); };

  const handleRequestPaket = () => {
    const kategoriId = paket?.kategori?.id_kategori ? `?kategori=${paket.kategori.id_kategori}` : "";
    navigate(`/custom-paket/baru${kategoriId}`);
  };

  if (loading) {
    return (
      <section style={{ padding: "6rem 0" }}>
        <div className="container">
          <div className="catalog-loading"><div className="spinner" /><p>Memuat detail paket...</p></div>
        </div>
      </section>
    );
  }

  if (notFound || !paket) {
    return (
      <section style={{ padding: "6rem 0", textAlign: "center" }}>
        <div className="container">
          <div style={{ maxWidth: "480px", margin: "0 auto", background: "var(--color-bg-card, #FFFFFF)", border: "1px solid var(--color-border, #E7E7E7)", borderRadius: "20px", padding: "3rem 2rem" }}>
            <h3 style={{ color: "var(--color-text-main)", marginBottom: "1rem" }}>Paket Tidak Ditemukan</h3>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>Paket layanan yang Anda cari tidak tersedia atau sudah tidak aktif.</p>
            <Link to="/katalog" className="btn btn-primary">Kembali ke Katalog</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* PAGE HERO */}
      <section style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8EA 50%, #FFFFFF 100%)", padding: "3rem 0 2rem", color: "var(--color-text-main)" }}>
        <div className="container">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: "1.5rem" }}>
            ← Kembali ke Katalog
          </button>

          <img
            src={paket.foto || "/images/login-hero.jpg"}
            alt={paket.nama_paket}
            style={{ width: "100%", maxWidth: "800px", height: "320px", objectFit: "cover", borderRadius: "16px", marginBottom: "1.5rem" }}
            onError={e => { e.currentTarget.src = "/images/login-hero.jpg"; }}
          />

          <div style={{ maxWidth: "800px" }}>
            <span className="package-category-label" style={{ position: "static", display: "inline-block", marginBottom: "0.5rem" }}>{paket.kategori?.nama_kategori}</span>
            <h1 className="section-title" style={{ color: "var(--color-text-main)", margin: 0, fontSize: "2rem" }}>{paket.nama_paket}</h1>
            <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem", fontSize: "1.05rem" }}>
              Paket layanan {paket.kategori?.nama_kategori?.toLowerCase()} dengan harga mulai {formatIDR(paket.harga)}.
            </p>
          </div>
        </div>
      </section>

      {/* DETAIL CONTENT */}
      <section style={{ paddingBottom: "5rem", paddingTop: "2rem" }}>
        <div className="container" style={{ maxWidth: "800px" }}>

          {/* Dua kolom: Informasi Paket | Fasilitas Paket */}
          <div className="form-grid-2" style={{ alignItems: "start", marginBottom: "2rem" }}>
            <div>
              <h4 className="facilities-title">Informasi Paket</h4>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                {paket.deskripsi || "Belum ada deskripsi lengkap untuk paket ini."}
              </p>
              <div style={{ marginTop: "1.25rem", fontSize: "1.4rem", fontWeight: 800, color: "var(--color-primary)" }}>
                {formatIDR(paket.harga)}
              </div>
            </div>

            <div>
              <h4 className="facilities-title">Fasilitas Paket</h4>
              {paket.fasilitas && paket.fasilitas.length > 0 ? (
                <div className="facilities-checklist-container">
                  {paket.fasilitas.map(f => (
                    <div key={f.id_fasilitas} className="facility-checklist-item selected">
                      <div className="checkbox-row" style={{ cursor: "default" }}>
                        <div className="custom-checkbox checked"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>
                        <div className="facility-label-desc">
                          <span className="facility-name">{f.nama_fasilitas}{f.qty > 1 ? ` (x${f.qty})` : ""}</span>
                          {(f.deskripsi || f.keterangan) && <span className="facility-desc">{f.keterangan || f.deskripsi}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-facilities-notice"><p>Belum ada fasilitas khusus yang ditentukan untuk paket ini.</p></div>
              )}
            </div>
          </div>

          {/* Pilih Jalur Layanan */}
          <div className="custom-addon-cta" style={{ textAlign: "center" }}>
            <p className="custom-addon-cta-title">Pilih Jalur Layanan</p>
            <p className="custom-addon-cta-desc">
              Pesan paket ini sesuai rincian di atas, atau ajukan sebagai Custom Paket kalau Anda butuh penyesuaian fasilitas & budget.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
              <button type="button" className="btn btn-primary" onClick={() => navigate(`/pemesanan/baru/${paket.id_paket}`)}>Pilih Paket</button>
              <button type="button" className="btn btn-outline" onClick={handleRequestPaket}>Request Paket</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
