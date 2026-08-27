/**
 * CustomerKatalog.jsx — Halaman /katalog customer.
 * Daftar paket layanan. Setiap card cuma punya satu CTA: "Lihat Detail" —
 * keputusan jalur (Pilih Paket vs Request Paket) terjadi di Halaman Detail
 * Paket (CustomerPaketDetail), bukan di sini. Form pemesanan (standar) dan
 * custom paket masing-masing jadi halaman tersendiri (bukan modal).
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerKatalog() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Search & sort — dikirim ke backend sebagai query param, bekerja bersamaan
  // dengan filter tab kategori (bukan saling menimpa).
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOption, setSortOption] = useState("nama_asc");

  useEffect(() => {
    window.axios.get("/api/kategori").then(res => { if (res.data.status === "success") setCategories(res.data.data); }).catch(() => {});
  }, []);

  // Debounce input pencarian supaya tidak fetch di setiap ketikan.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoadingPackages(true);
    const params = new URLSearchParams();
    if (selectedCategoryFilter !== "all") params.set("kategori", selectedCategoryFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("sort", sortOption);
    window.axios.get(`/api/paket?${params.toString()}`)
      .then(res => { if (res.data.status === "success") setPackages(res.data.data); })
      .catch(() => {})
      .finally(() => setLoadingPackages(false));
  }, [selectedCategoryFilter, debouncedSearch, sortOption]);

  const formatIDR = num => { if (!num) return "-"; return "Rp " + parseFloat(num).toLocaleString("id-ID", { maximumFractionDigits: 0 }); };
  // Total "Semua Paket" dihitung dari jumlah_paket per kategori (stabil, tidak
  // ikut menyusut saat search/sort aktif) — bukan dari packages.length, karena
  // packages sekarang sudah hasil filter dari backend.
  const totalPaketCount = categories.reduce((sum, cat) => sum + (cat.jumlah_paket || 0), 0);

  return (
    <>
      {/* PAGE HERO */}
      <section style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8EA 50%, #FFFFFF 100%)", padding: "5rem 0 3rem", textAlign: "center", color: "var(--color-text-main)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(226,154,0,0.08) 0%, transparent 70%)" }} />
        <div className="container" style={{ position: "relative" }}>
          <span className="section-tag">Pilihan Paket</span>
          <h1 className="section-title" style={{ color: "var(--color-text-main)", marginTop: "1rem" }}>Katalog Paket <span className="text-gradient">Layanan Terbaik</span></h1>
          <p className="section-subtitle" style={{ maxWidth: "600px", margin: "1.5rem auto 0", opacity: 0.75 }}>Pilih dari beragam paket standard terpopuler yang telah kami rancang dengan fasilitas lengkap dan harga ekonomis.</p>
        </div>
      </section>

      {/* KATALOG CONTENT */}
      <section className="catalog-section" style={{ paddingTop: "3rem" }}>
        <div className="container">
          {/* Search & Sort Toolbar */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "1.5rem" }}>
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: "320px" }}
              placeholder="Cari nama paket..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <select
              className="form-control"
              style={{ maxWidth: "220px" }}
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option value="nama_asc">Nama A-Z</option>
              <option value="nama_desc">Nama Z-A</option>
              <option value="harga_asc">Harga Termurah</option>
              <option value="harga_desc">Harga Termahal</option>
            </select>
          </div>

          <div className="catalog-categories">
            <button className={`catalog-cat-btn ${selectedCategoryFilter === "all" ? "active" : ""}`} onClick={() => setSelectedCategoryFilter("all")}>Semua Paket ({totalPaketCount})</button>
            {categories.map(cat => (<button key={cat.id_kategori} className={`catalog-cat-btn ${selectedCategoryFilter === cat.id_kategori.toString() ? "active" : ""}`} onClick={() => setSelectedCategoryFilter(cat.id_kategori.toString())}>{cat.nama_kategori} ({cat.jumlah_paket})</button>))}
          </div>
          {loadingPackages ? (<div className="catalog-loading"><div className="spinner" /><p>Memuat paket layanan...</p></div>) : (
            <div className="packages-grid">
              {packages.length === 0 && (
                <div className="no-status-notice text-center" style={{ gridColumn: "1 / -1" }}>
                  <h4>Tidak Ada Paket Ditemukan</h4>
                  <p>Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
                </div>
              )}
              {packages.map(pkg => (
                <div key={pkg.id_paket} className="package-card">
                  <div className="package-img-wrapper">
                    <img src={pkg.foto || "/images/login-hero.jpg"} alt={pkg.nama_paket} className="package-img" onError={e => { e.currentTarget.src = "/images/login-hero.jpg"; }} />
                    <span className="package-category-label">{pkg.kategori.nama_kategori}</span>
                  </div>
                  <div className="package-body">
                    <h3 className="package-title">{pkg.nama_paket}</h3>
                    <p className="package-desc">{pkg.deskripsi}</p>
                    {pkg.fasilitas && pkg.fasilitas.length > 0 && (
                      <div className="package-facility-chips">
                        {pkg.fasilitas.slice(0, 3).map(f => (
                          <span key={f.id_fasilitas} className="package-facility-chip">{f.nama_fasilitas}</span>
                        ))}
                        {pkg.fasilitas.length > 3 && (
                          <span className="package-facility-chip package-facility-chip-more">+{pkg.fasilitas.length - 3} lainnya</span>
                        )}
                      </div>
                    )}
                    <div className="package-footer">
                      <div className="package-price-box">
                        <span className="price-label">Harga Paket</span>
                        <span className="price-value">{formatIDR(pkg.harga)}</span>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/katalog/${pkg.id_paket}`)}>Lihat Detail</button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="package-card custom-package-promo-card">
                <div className="promo-card-content">
                  <div className="promo-icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg></div>
                  <h3 className="promo-title">Butuh Paket Custom?</h3>
                  <p className="promo-desc">Miliki visi event tersendiri? Padukan fasilitas, sesuaikan budget, dan rancang paket custom spesial Anda bersama planner profesional kami.</p>
                  <button className="btn btn-outline btn-full" onClick={() => navigate("/custom-paket/baru")}>Buat Custom Paket</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
