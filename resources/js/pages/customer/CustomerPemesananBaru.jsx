/**
 * CustomerPemesananBaru.jsx — Halaman /pemesanan/baru/:paketId customer.
 * Halaman penuh form pemesanan paket bawaan. Mengambil data paket langsung
 * dari API berdasarkan :paketId di URL, supaya tetap berfungsi kalau dibuka
 * langsung dari link atau di-refresh browser.
 *
 * Nama/Email/No. HP ditampilkan read-only dari profil akun yang sedang login
 * (bukan input baru) — backend (PemesananCustomerController::store) memang
 * selalu memakai Auth::user() sebagai pemilik pemesanan, tidak menerima
 * field ini dari form.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function CustomerPemesananBaru() {
  const { paketId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "null"); } catch { return null; }
  })();

  const [paket, setPaket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [orderForm, setOrderForm] = useState({ tanggal_acara: "", lokasi_acara: "", jumlah_tamu: "", catatan: "" });
  const [orderFieldErrors, setOrderFieldErrors] = useState({});
  const [orderError, setOrderError] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (type, message) => setToast({ type, message });
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!token) {
      showToast('error', "Silakan login terlebih dahulu untuk memesan paket.");
      setTimeout(() => { navigate("/login"); }, 1200);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setNotFound(false);
    window.axios.get(`/api/paket/${paketId}`)
      .then(res => {
        if (res.data.status === "success") setPaket(res.data.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [paketId, token]);

  const formatIDR = num => { if (!num) return "-"; return "Rp " + parseFloat(num).toLocaleString("id-ID", { maximumFractionDigits: 0 }); };
  // Tanggal acara minimal besok — sinkron dengan validasi backend (`after:today`).
  const minEventDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const handleOrderFormChange = e => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
    if (orderFieldErrors[name]) setOrderFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleOrderFieldBlur = e => {
    const { name, value } = e.target;
    if (!String(value).trim()) {
      setOrderFieldErrors(prev => ({ ...prev, [name]: 'Field ini wajib diisi.' }));
    }
  };

  const handleSubmitOrder = async e => {
    e.preventDefault();
    const errors = {};
    if (!orderForm.tanggal_acara) errors.tanggal_acara = "Tanggal acara harus ditentukan.";
    else if (new Date(orderForm.tanggal_acara) <= new Date()) errors.tanggal_acara = "Tanggal acara harus di masa mendatang.";
    if (!orderForm.lokasi_acara.trim()) errors.lokasi_acara = "Lokasi acara harus diisi.";
    if (!orderForm.jumlah_tamu || parseInt(orderForm.jumlah_tamu) < 1) errors.jumlah_tamu = "Jumlah tamu minimal 1 orang.";

    setOrderFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setOrderError(""); setIsSubmittingOrder(true);
    try {
      const res = await window.axios.post("/api/customer/pemesanan", {
        id_paket: paket.id_paket,
        tanggal_acara: orderForm.tanggal_acara,
        lokasi_acara: orderForm.lokasi_acara,
        jumlah_tamu: parseInt(orderForm.jumlah_tamu),
        catatan: orderForm.catatan || null,
      });
      if (res.data.status === "success") setOrderResult(res.data.data);
    } catch (err) { setOrderError(err?.response?.data?.message || "Terjadi kesalahan."); }
    finally { setIsSubmittingOrder(false); }
  };

  if (!token) return null;

  if (loading) {
    return (
      <section style={{ padding: "6rem 0" }}>
        <div className="container">
          <div className="catalog-loading"><div className="spinner" /><p>Memuat data paket...</p></div>
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
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>Paket layanan yang Anda coba pesan tidak tersedia atau sudah tidak aktif.</p>
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
          <button type="button" onClick={() => navigate(`/katalog/${paket.id_paket}`)} className="btn btn-outline btn-sm" style={{ marginBottom: "1.5rem" }}>
            ← Kembali
          </button>
          <h1 className="section-title" style={{ color: "var(--color-text-main)" }}>
            {orderResult ? "Pemesanan Berhasil!" : "Form Pemesanan"}
          </h1>
          {!orderResult && (
            <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
              Paket: {paket.nama_paket} - {paket.kategori?.nama_kategori}
            </p>
          )}
        </div>
      </section>

      {/* FORM CONTENT */}
      <section style={{ paddingBottom: "5rem" }}>
        <div className="container" style={{ maxWidth: "620px" }}>
          {orderResult ? (
            <div className="order-success-view">
              <div className="order-success-icon"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg></div>
              <h3 style={{ color: "var(--color-text-main)", margin: 0 }}>Pemesanan Diterima!</h3>
              <p style={{ color: "var(--color-text-muted)", margin: 0, lineHeight: 1.6, maxWidth: "340px" }}>Pemesanan paket <strong style={{ color: "var(--color-text-main)" }}>{paket.nama_paket}</strong> berhasil dibuat.</p>
              <div className="order-success-code">{orderResult.kode_pemesanan}</div>
              <div className="pay-now-section">
                <span className="pay-now-label">Total yang harus dibayar</span>
                <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)" }}>{formatIDR(paket.harga)}</span>
                <div className="mou-locked-notice" style={{ width: "100%", justifyContent: "center", textAlign: "center" }}>
                  🔒 Admin akan menyiapkan dokumen MOU terlebih dahulu. Pantau & selesaikan proses tanda tangan MOU di halaman Status sebelum dapat membayar DP.
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => navigate("/status")} style={{ marginTop: "0.5rem" }}>Lihat Status</button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmitOrder}>
              {/* Ringkasan Paket (read-only) */}
              <div style={{ background: "rgba(226,154,0,0.06)", border: "1px solid rgba(226,154,0,0.2)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <h4 className="facilities-title" style={{ marginTop: 0 }}>Ringkasan Paket</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div><span className="cell-lbl" style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Nama Paket</span><strong>{paket.nama_paket}</strong></div>
                  <div><span className="cell-lbl" style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Kategori</span><strong>{paket.kategori?.nama_kategori}</strong></div>
                  <div><span className="cell-lbl" style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Harga Paket</span><strong style={{ color: "var(--color-primary)" }}>{formatIDR(paket.harga)}</strong></div>
                </div>
              </div>

              {orderError && <div className="error-alert">{orderError}</div>}

              <h4 className="facilities-title">Data Pemesanan</h4>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input type="text" className="form-control" value={profile?.nama || ""} readOnly disabled style={{ backgroundColor: "#F8F9FA" }} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" value={profile?.email || ""} readOnly disabled style={{ backgroundColor: "#F8F9FA" }} />
                </div>
              </div>
              <div className="form-group">
                <label>No. Handphone</label>
                <input type="text" className="form-control" value={profile?.no_hp || "-"} readOnly disabled style={{ backgroundColor: "#F8F9FA", maxWidth: "50%" }} />
              </div>

              <div className="form-group">
                <label className="required-label">Tanggal Acara</label>
                <input type="date" className={`form-control ${orderFieldErrors.tanggal_acara ? 'is-invalid' : ''}`} style={orderFieldErrors.tanggal_acara ? {borderColor: '#dc3545', backgroundColor: '#fff8f8'} : {}} name="tanggal_acara" value={orderForm.tanggal_acara} onChange={handleOrderFormChange} onBlur={handleOrderFieldBlur} min={minEventDate} required />
                {orderFieldErrors.tanggal_acara && <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{orderFieldErrors.tanggal_acara}</span>}
              </div>
              <div className="form-group">
                <label className="required-label">Lokasi Acara</label>
                <input type="text" className={`form-control ${orderFieldErrors.lokasi_acara ? 'is-invalid' : ''}`} style={orderFieldErrors.lokasi_acara ? {borderColor: '#dc3545', backgroundColor: '#fff8f8'} : {}} name="lokasi_acara" placeholder="Contoh: Ballroom Hotel Grand, Jakarta" value={orderForm.lokasi_acara} onChange={handleOrderFormChange} onBlur={handleOrderFieldBlur} required />
                {orderFieldErrors.lokasi_acara && <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{orderFieldErrors.lokasi_acara}</span>}
              </div>
              <div className="form-group">
                <label className="required-label">Jumlah Tamu (Pax)</label>
                <input type="number" className={`form-control ${orderFieldErrors.jumlah_tamu ? 'is-invalid' : ''}`} style={orderFieldErrors.jumlah_tamu ? {borderColor: '#dc3545', backgroundColor: '#fff8f8'} : {}} name="jumlah_tamu" placeholder="Contoh: 150" value={orderForm.jumlah_tamu} onChange={handleOrderFormChange} onBlur={handleOrderFieldBlur} min="1" required />
                {orderFieldErrors.jumlah_tamu && <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{orderFieldErrors.jumlah_tamu}</span>}
              </div>
              <div className="form-group"><label>Catatan</label><textarea className="form-control" name="catatan" rows="3" placeholder="Tema, permintaan khusus, atau informasi lainnya..." value={orderForm.catatan} onChange={handleOrderFormChange} /></div>

              <div className="modal-footer-actions" style={{ borderTop: "none", paddingTop: 0, marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-outline" onClick={() => navigate(`/katalog/${paket.id_paket}`)}>Kembali</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingOrder}>{isSubmittingOrder ? "Memproses..." : "Kirim Pemesanan"}</button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
            minWidth: '280px', maxWidth: '420px', background: '#FFFFFF',
            border: `1px solid ${toast.type === 'success' ? 'rgba(226,154,0,0.35)' : '#FFC9C9'}`,
            borderLeft: `4px solid ${toast.type === 'success' ? 'var(--color-primary, #E29A00)' : '#C92A2A'}`,
            color: 'var(--color-text-main)', borderRadius: '10px', padding: '0.9rem 1.1rem',
            boxShadow: '0 20px 50px rgba(30,22,6,0.18)', display: 'flex', alignItems: 'flex-start',
            gap: '0.75rem', fontSize: '0.9rem', lineHeight: 1.5,
          }}
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Tutup notifikasi" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1, padding: 0 }}>✕</button>
        </div>
      )}
    </>
  );
}
