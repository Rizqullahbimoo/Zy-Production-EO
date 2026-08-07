/**
 * CustomerKatalog.jsx — Halaman /katalog customer.
 * Berisi: Daftar paket layanan + modal pemesanan paket bawaan + custom request modal.
 * Integrasi: Midtrans Snap untuk pembayaran paket bawaan.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CustomerKatalog() {
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  const [categories, setCategories]                   = useState([]);
  const [packages, setPackages]                       = useState([]);
  const [loadingPackages, setLoadingPackages]         = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const [showDetailModal, setShowDetailModal]         = useState(false);
  const [selectedDetailPaket, setSelectedDetailPaket] = useState(null);
  const [loadingDetail, setLoadingDetail]             = useState(false);

  const [showOrderModal, setShowOrderModal]           = useState(false);
  const [orderPackage, setOrderPackage]               = useState(null);
  const [orderForm, setOrderForm]                     = useState({ tanggal_acara: "", lokasi_acara: "", jumlah_tamu: "", catatan: "" });
  const [orderError, setOrderError]                   = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder]     = useState(false);
  const [orderResult, setOrderResult]                 = useState(null);

  const [showRequestModal, setShowRequestModal]       = useState(false);
  const [requestStep, setRequestStep]                 = useState(1);
  const [facilities, setFacilities]                   = useState([]);
  const [loadingFacilities, setLoadingFacilities]     = useState(false);
  const [formData, setFormData]                       = useState({ id_kategori: "", tanggal_acara: "", lokasi_acara: "", jumlah_tamu: "", budget_acara: "", catatan: "", fasilitas: [] });
  const [requestError, setRequestError]               = useState("");
  const [requestSuccess, setRequestSuccess]           = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    window.axios.get("/api/kategori").then(res => { if (res.data.status === "success") setCategories(res.data.data); }).catch(() => {});
    setLoadingPackages(true);
    window.axios.get("/api/paket").then(res => { if (res.data.status === "success") setPackages(res.data.data); }).catch(() => {}).finally(() => setLoadingPackages(false));
  }, []);

  useEffect(() => {
    if (formData.id_kategori) {
      setLoadingFacilities(true);
      window.axios.get(`/api/fasilitas?id_kategori=${formData.id_kategori}`)
        .then(res => { if (res.data.status === "success") { setFacilities(res.data.data); setFormData(prev => ({ ...prev, fasilitas: [] })); }})
        .catch(() => {}).finally(() => setLoadingFacilities(false));
    } else { setFacilities([]); }
  }, [formData.id_kategori]);

  const formatIDR = num => { if (!num) return "-"; return "Rp " + parseFloat(num).toLocaleString("id-ID", { maximumFractionDigits: 0 }); };
  const formatDateIndo = dateStr => { if (!dateStr) return "-"; const d = new Date(dateStr); const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]; return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`; };
  const filteredPackages = selectedCategoryFilter === "all" ? packages : packages.filter(p => p.kategori.id_kategori === parseInt(selectedCategoryFilter));

  const openOrderModal = pkg => {
    if (!token) { alert("Silakan login terlebih dahulu untuk memesan paket."); window.location.href = "/login"; return; }
    setOrderPackage(pkg); setOrderForm({ tanggal_acara: "", lokasi_acara: "", jumlah_tamu: "", catatan: "" }); setOrderError(""); setOrderResult(null); setShowOrderModal(true);
  };

  const openDetailModal = pkg => {
    setShowDetailModal(true);
    setSelectedDetailPaket(pkg);
    setLoadingDetail(true);
    window.axios.get(`/api/paket/${pkg.id_paket}`)
      .then(res => { if (res.data.status === "success") setSelectedDetailPaket(res.data.data); })
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  };

  const handlePesanFromDetail = () => {
    const pkg = selectedDetailPaket;
    setShowDetailModal(false);
    openOrderModal(pkg);
  };

  const handleAjukanCustomFromDetail = () => {
    const pkg = selectedDetailPaket;
    setShowDetailModal(false);
    openRequestModal({
      id_kategori: pkg.kategori?.id_kategori ? String(pkg.kategori.id_kategori) : "",
      catatan: "",
    });
  };

  const handleOrderFormChange = e => setOrderForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmitOrder = async e => {
    e.preventDefault();
    if (!orderForm.tanggal_acara) { setOrderError("Tanggal acara harus ditentukan."); return; }
    if (new Date(orderForm.tanggal_acara) <= new Date()) { setOrderError("Tanggal acara harus di masa mendatang."); return; }
    if (!orderForm.lokasi_acara.trim()) { setOrderError("Lokasi acara harus diisi."); return; }
    if (!orderForm.jumlah_tamu || parseInt(orderForm.jumlah_tamu) < 1) { setOrderError("Jumlah tamu minimal 1 orang."); return; }
    setOrderError(""); setIsSubmittingOrder(true);
    try {
      const res = await window.axios.post("/api/customer/pemesanan", { id_paket: orderPackage.id_paket, tanggal_acara: orderForm.tanggal_acara, lokasi_acara: orderForm.lokasi_acara, jumlah_tamu: parseInt(orderForm.jumlah_tamu), catatan: orderForm.catatan || null });
      if (res.data.status === "success") setOrderResult(res.data.data);
    } catch (err) { setOrderError(err?.response?.data?.message || "Terjadi kesalahan."); }
    finally { setIsSubmittingOrder(false); }
  };

  const handleInputChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFacilityToggle = facilityId => setFormData(prev => { const exists = prev.fasilitas.find(f => f.id_fasilitas === facilityId); if (exists) return { ...prev, fasilitas: prev.fasilitas.filter(f => f.id_fasilitas !== facilityId) }; else return { ...prev, fasilitas: [...prev.fasilitas, { id_fasilitas: facilityId, keterangan: "" }] }; });
  const handleFacilityDescChange = (facilityId, value) => setFormData(prev => ({ ...prev, fasilitas: prev.fasilitas.map(f => f.id_fasilitas === facilityId ? { ...f, keterangan: value } : f) }));
  const openRequestModal = (prefill = {}) => { if (!token) { alert("Silakan login terlebih dahulu."); window.location.href = "/login"; return; } setShowRequestModal(true); setRequestStep(1); setRequestSuccess(false); setRequestError(""); setFormData({ id_kategori: "", tanggal_acara: "", lokasi_acara: "", jumlah_tamu: "", budget_acara: "", catatan: "", fasilitas: [], ...prefill }); };
  const handleSubmitRequest = e => {
    e.preventDefault();
    if (!formData.id_kategori) { setRequestError("Kategori event harus dipilih."); return; }
    if (!formData.tanggal_acara) { setRequestError("Tanggal acara harus ditentukan."); return; }
    if (new Date(formData.tanggal_acara) <= new Date()) { setRequestError("Tanggal acara harus di masa mendatang."); return; }
    if (!formData.lokasi_acara.trim()) { setRequestError("Lokasi acara harus diisi."); return; }
    if (!formData.jumlah_tamu || parseInt(formData.jumlah_tamu) < 1) { setRequestError("Jumlah tamu minimal 1 orang."); return; }
    if (formData.fasilitas.length === 0) { setRequestError("Pilih minimal 1 fasilitas."); return; }
    setRequestError(""); setIsSubmittingRequest(true);
    window.axios.post("/api/customer/request-custom", { id_kategori: parseInt(formData.id_kategori), tanggal_acara: formData.tanggal_acara, lokasi_acara: formData.lokasi_acara, jumlah_tamu: parseInt(formData.jumlah_tamu), budget_acara: formData.budget_acara ? parseFloat(formData.budget_acara) : null, catatan: formData.catatan, fasilitas: formData.fasilitas })
      .then(res => { if (res.data.status === "success") setRequestSuccess(true); })
      .catch(err => setRequestError(err?.response?.data?.message || "Terjadi kesalahan."))
      .finally(() => setIsSubmittingRequest(false));
  };

  return (
    <>
      {/* PAGE HERO */}
      <section style={{ background: "linear-gradient(135deg, #08080f 0%, #12121e 50%, #0e0e1a 100%)", padding: "5rem 0 3rem", textAlign: "center", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(226,154,0,0.1) 0%, transparent 70%)" }} />
        <div className="container" style={{ position: "relative" }}>
          <span className="section-tag">Pilihan Paket</span>
          <h1 className="section-title" style={{ color: "#fff", marginTop: "1rem" }}>Katalog Paket <span className="text-gradient">Layanan Terbaik</span></h1>
          <p className="section-subtitle" style={{ maxWidth: "600px", margin: "1.5rem auto 0", opacity: 0.75 }}>Pilih dari beragam paket standard terpopuler yang telah kami rancang dengan fasilitas lengkap dan harga ekonomis.</p>
        </div>
      </section>

      {/* KATALOG CONTENT */}
      <section className="catalog-section" style={{ paddingTop: "3rem" }}>
        <div className="container">
          <div className="catalog-categories">
            <button className={`catalog-cat-btn ${selectedCategoryFilter === "all" ? "active" : ""}`} onClick={() => setSelectedCategoryFilter("all")}>Semua Paket ({packages.length})</button>
            {categories.map(cat => (<button key={cat.id_kategori} className={`catalog-cat-btn ${selectedCategoryFilter === cat.id_kategori.toString() ? "active" : ""}`} onClick={() => setSelectedCategoryFilter(cat.id_kategori.toString())}>{cat.nama_kategori} ({cat.jumlah_paket})</button>))}
          </div>
          {loadingPackages ? (<div className="catalog-loading"><div className="spinner" /><p>Memuat paket layanan...</p></div>) : (
            <div className="packages-grid">
              {filteredPackages.map(pkg => (
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
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openDetailModal(pkg)}>Lihat Detail</button>
                        <button className="btn btn-primary btn-sm" onClick={() => openOrderModal(pkg)}>Pesan Sekarang</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="package-card custom-package-promo-card">
                <div className="promo-card-content">
                  <div className="promo-icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg></div>
                  <h3 className="promo-title">Butuh Paket Custom?</h3>
                  <p className="promo-desc">Miliki visi event tersendiri? Padukan fasilitas, sesuaikan budget, dan rancang paket custom spesial Anda bersama planner profesional kami.</p>
                  <button className="btn btn-outline btn-full" onClick={() => openRequestModal()}>Buat Custom Paket</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODAL: PESAN PAKET BAWAAN */}
      {showOrderModal && orderPackage && (
        <div className="modal-backdrop" onClick={() => setShowOrderModal(false)}>
          <div className="modal-container" style={{ maxWidth: "560px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{orderResult ? "Pemesanan Berhasil!" : `Pesan ${orderPackage.nama_paket}`}</h3>
              <button className="close-btn" onClick={() => setShowOrderModal(false)}><svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body">
              {orderResult ? (
                <div className="order-success-view">
                  <div className="order-success-icon"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg></div>
                  <h3 style={{ color: "#fff", margin: 0 }}>Pemesanan Diterima!</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.6, maxWidth: "340px" }}>Pemesanan paket <strong style={{ color: "#fff" }}>{orderPackage.nama_paket}</strong> berhasil dibuat.</p>
                  <div className="order-success-code">{orderResult.kode_pemesanan}</div>
                  <div className="pay-now-section">
                    <span className="pay-now-label">Total yang harus dibayar</span>
                    <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)", textShadow: "0 0 20px rgba(226,154,0,0.4)" }}>{formatIDR(orderPackage.harga)}</span>
                    <div className="mou-locked-notice" style={{ width: "100%", justifyContent: "center", textAlign: "center" }}>
                      🔒 Admin akan menyiapkan dokumen MOU terlebih dahulu. Pantau & selesaikan proses tanda tangan MOU di halaman Status sebelum dapat membayar DP.
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => { setShowOrderModal(false); navigate("/status"); }} style={{ marginTop: "0.5rem" }}>Lihat Status</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrder}>
                  <div className="order-package-summary">
                    <img src={orderPackage.foto || "/images/login-hero.jpg"} alt={orderPackage.nama_paket} className="order-pkg-img" onError={e => { e.currentTarget.src = "/images/login-hero.jpg"; }} />
                    <div className="order-pkg-info"><div className="order-pkg-name">{orderPackage.nama_paket}</div><div className="order-pkg-cat">{orderPackage.kategori?.nama_kategori}</div></div>
                    <div className="order-pkg-price">{formatIDR(orderPackage.harga)}</div>
                  </div>
                  {orderError && <div className="error-alert">{orderError}</div>}
                  <div className="form-grid-2">
                    <div className="form-group"><label className="required-label">Tanggal Acara</label><input type="date" className="form-control" name="tanggal_acara" value={orderForm.tanggal_acara} onChange={handleOrderFormChange} required /></div>
                    <div className="form-group"><label className="required-label">Jumlah Tamu (Pax)</label><input type="number" className="form-control" name="jumlah_tamu" placeholder="Contoh: 150" value={orderForm.jumlah_tamu} onChange={handleOrderFormChange} min="1" required /></div>
                  </div>
                  <div className="form-group"><label className="required-label">Lokasi Acara</label><input type="text" className="form-control" name="lokasi_acara" placeholder="Contoh: Ballroom Hotel Grand, Jakarta" value={orderForm.lokasi_acara} onChange={handleOrderFormChange} required /></div>
                  <div className="form-group"><label>Catatan Tambahan</label><textarea className="form-control" name="catatan" rows="3" placeholder="Tema, permintaan khusus, atau informasi lainnya..." value={orderForm.catatan} onChange={handleOrderFormChange} /></div>
                  <div style={{ background: "rgba(226,154,0,0.06)", border: "1px solid rgba(226,154,0,0.2)", borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>Total Pembayaran</span>
                    <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-primary)" }}>{formatIDR(orderPackage.harga)}</span>
                  </div>
                  <div className="modal-footer-actions" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowOrderModal(false)}>Batal</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmittingOrder || !orderForm.tanggal_acara || !orderForm.lokasi_acara || !orderForm.jumlah_tamu}>{isSubmittingOrder ? "Memproses..." : "Konfirmasi Pemesanan"}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL PAKET */}
      {showDetailModal && selectedDetailPaket && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" style={{ maxWidth: "620px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDetailPaket.nama_paket}</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}><svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body">
              <img
                src={selectedDetailPaket.foto || "/images/login-hero.jpg"}
                alt={selectedDetailPaket.nama_paket}
                style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "12px", marginBottom: "1.25rem" }}
                onError={e => { e.currentTarget.src = "/images/login-hero.jpg"; }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span className="package-category-label" style={{ position: "static" }}>{selectedDetailPaket.kategori?.nama_kategori}</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary)" }}>{formatIDR(selectedDetailPaket.harga)}</span>
              </div>
              {selectedDetailPaket.deskripsi && (
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "1.5rem" }}>{selectedDetailPaket.deskripsi}</p>
              )}

              <h4 className="facilities-title">Fasilitas & Benefit</h4>
              {loadingDetail ? (
                <div className="loading-facilities-spinner"><div className="spinner" /><p>Memuat detail fasilitas...</p></div>
              ) : selectedDetailPaket.fasilitas && selectedDetailPaket.fasilitas.length > 0 ? (
                <div className="facilities-checklist-container">
                  {selectedDetailPaket.fasilitas.map(f => (
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

              <div className="custom-addon-cta">
                <p className="custom-addon-cta-title">✨ Butuh tambahan di luar daftar ini?</p>
                <p className="custom-addon-cta-desc">Ajukan sebagai Custom Paket dan dapatkan penawaran harga khusus dari tim kami.</p>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleAjukanCustomFromDetail}>Ajukan Custom Paket →</button>
              </div>

              <div className="modal-footer-actions" style={{ borderTop: "none", paddingTop: 0, marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowDetailModal(false)}>Tutup</button>
                <button type="button" className="btn btn-primary" onClick={handlePesanFromDetail}>Pesan Sekarang</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST CUSTOM PAKET */}
      {showRequestModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Buat Request Custom Paket</h3>
              <button className="close-btn" onClick={() => { setShowRequestModal(false); setRequestSuccess(false); }}><svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body">
              {requestSuccess ? (
                <div className="success-step text-center">
                  <div className="success-icon-wrapper"><svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></div>
                  <h3>Pengajuan Berhasil Dikirim!</h3>
                  <p>Custom paket Anda telah masuk ke sistem. Tim kami akan segera meninjau dan memberikan penawaran resmi.</p>
                  <div className="success-actions">
                    <button className="btn btn-primary" onClick={() => { setShowRequestModal(false); setRequestSuccess(false); navigate("/status"); }}>Pantau Status Pemesanan</button>
                    <button className="btn btn-outline" onClick={() => { setShowRequestModal(false); setRequestSuccess(false); }}>Tutup</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest}>
                  {requestError && <div className="error-alert">{requestError}</div>}
                  <div className="stepper-indicator">
                    <div className={`step-dot ${requestStep >= 1 ? "active" : ""}`}>1. Info Event</div>
                    <div className={`step-line ${requestStep >= 2 ? "active" : ""}`} />
                    <div className={`step-dot ${requestStep >= 2 ? "active" : ""}`}>2. Pilih Fasilitas</div>
                    <div className={`step-line ${requestStep >= 3 ? "active" : ""}`} />
                    <div className={`step-dot ${requestStep >= 3 ? "active" : ""}`}>3. Catatan & Kirim</div>
                  </div>
                  {requestStep === 1 && (
                    <div className="step-content">
                      <div className="form-group"><label className="required-label">Kategori Event</label><select className="form-control" name="id_kategori" value={formData.id_kategori} onChange={handleInputChange} required><option value="">-- Pilih Kategori Event --</option>{categories.map(cat => (<option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>))}</select></div>
                      <div className="form-grid-2">
                        <div className="form-group"><label className="required-label">Tanggal Acara</label><input type="date" className="form-control" name="tanggal_acara" value={formData.tanggal_acara} onChange={handleInputChange} required /></div>
                        <div className="form-group"><label className="required-label">Jumlah Tamu (Pax)</label><input type="number" className="form-control" name="jumlah_tamu" placeholder="Contoh: 250" value={formData.jumlah_tamu} onChange={handleInputChange} min="1" required /></div>
                      </div>
                      <div className="form-group"><label className="required-label">Lokasi Acara</label><input type="text" className="form-control" name="lokasi_acara" placeholder="Contoh: Ballroom Hotel Grand, Mampang" value={formData.lokasi_acara} onChange={handleInputChange} required /></div>
                      <div className="form-group"><label>Rencana Budget Maksimal (Rp)</label><input type="number" className="form-control" name="budget_acara" placeholder="Masukkan angka, contoh: 50000000" value={formData.budget_acara} onChange={handleInputChange} /><span className="input-tip">Kosongkan jika ingin dihitung otomatis.</span></div>
                      <div className="modal-footer-actions"><span className="step-info">Langkah 1 dari 3</span><button type="button" className="btn btn-primary" disabled={!formData.id_kategori || !formData.tanggal_acara || !formData.lokasi_acara || !formData.jumlah_tamu} onClick={() => setRequestStep(2)}>Lanjut: Pilih Fasilitas</button></div>
                    </div>
                  )}
                  {requestStep === 2 && (
                    <div className="step-content">
                      <h4 className="facilities-title">Pilih Fasilitas & Layanan Pendukung</h4>
                      <p className="facilities-subtitle">Fasilitas disesuaikan dengan kategori event Anda.</p>
                      {loadingFacilities ? (<div className="loading-facilities-spinner"><div className="spinner" /><p>Mengambil fasilitas...</p></div>) : facilities.length === 0 ? (<div className="no-facilities-notice"><p>Tidak ada fasilitas standar. Tulis fasilitas pada kolom catatan.</p></div>) : (
                        <div className="facilities-checklist-container">
                          {facilities.map(fac => { const isChecked = !!formData.fasilitas.find(f => f.id_fasilitas === fac.id_fasilitas); const currentFacObj = formData.fasilitas.find(f => f.id_fasilitas === fac.id_fasilitas); return (<div key={fac.id_fasilitas} className={`facility-checklist-item ${isChecked ? "selected" : ""}`}><div className="checkbox-row" onClick={() => handleFacilityToggle(fac.id_fasilitas)}><div className={`custom-checkbox ${isChecked ? "checked" : ""}`}>{isChecked && (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>)}</div><div className="facility-label-desc"><span className="facility-name">{fac.nama_fasilitas}</span>{fac.deskripsi && <span className="facility-desc">{fac.deskripsi}</span>}</div></div>{isChecked && (<div className="facility-input-detail"><input type="text" className="form-control form-control-sm" placeholder="Detail permintaan khusus (opsional)..." value={currentFacObj?.keterangan || ""} onChange={e => handleFacilityDescChange(fac.id_fasilitas, e.target.value)} /></div>)}</div>); })}
                        </div>
                      )}
                      <div className="modal-footer-actions"><button type="button" className="btn btn-outline" onClick={() => setRequestStep(1)}>Kembali</button><span className="step-info">Langkah 2 dari 3</span><button type="button" className="btn btn-primary" disabled={formData.fasilitas.length === 0} onClick={() => setRequestStep(3)}>Lanjut: Catatan Akhir</button></div>
                    </div>
                  )}
                  {requestStep === 3 && (
                    <div className="step-content">
                      <div className="form-group"><label>Catatan Tambahan / Deskripsi Rencana Event</label><textarea className="form-control" name="catatan" rows="5" placeholder="Instruksi khusus, tema warna, layout, dll..." value={formData.catatan} onChange={handleInputChange} /></div>
                      <div className="summary-card">
                        <h4>Ringkasan Pengajuan</h4>
                        <div className="summary-grid">
                          <div><span>Kategori:</span> <strong>{categories.find(c => c.id_kategori.toString() === formData.id_kategori)?.nama_kategori || "-"}</strong></div>
                          <div><span>Tanggal:</span> <strong>{formatDateIndo(formData.tanggal_acara)}</strong></div>
                          <div><span>Tamu:</span> <strong>{formData.jumlah_tamu} Pax</strong></div>
                          <div><span>Lokasi:</span> <strong>{formData.lokasi_acara}</strong></div>
                          <div><span>Budget:</span> <strong>{formData.budget_acara ? formatIDR(formData.budget_acara) : "Otomatis"}</strong></div>
                          <div><span>Fasilitas:</span> <strong>{formData.fasilitas.length} Layanan</strong></div>
                        </div>
                      </div>
                      <div className="modal-footer-actions"><button type="button" className="btn btn-outline" onClick={() => setRequestStep(2)}>Kembali</button><span className="step-info">Langkah 3 dari 3</span><button type="submit" className="btn btn-primary" disabled={isSubmittingRequest}>{isSubmittingRequest ? "Mengirim..." : "Kirim Pengajuan"}</button></div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
