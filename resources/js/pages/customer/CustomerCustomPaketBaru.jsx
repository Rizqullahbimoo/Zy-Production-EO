/**
 * CustomerCustomPaketBaru.jsx — Halaman /custom-paket/baru customer.
 * Halaman penuh form request custom paket — dulu berupa modal di CustomerKatalog.
 * Bisa diakses independen (dari promo "Buat Custom Paket" di Katalog) atau
 * membawa referensi kategori dari paket asal via query param ?kategori=:id
 * (dari tombol "Request Paket" di Halaman Detail Paket).
 *
 * Daftar fasilitas TIDAK hardcoded — sama seperti modal lama, di-fetch dinamis
 * dari GET /api/fasilitas?id_kategori=X sesuai kategori event yang dipilih.
 * Nama/Email/No. HP ditampilkan read-only dari profil akun yang login (bukan
 * input baru) — backend (RequestCustomController::store) selalu memakai
 * Auth::user() sebagai pemilik request, tidak menerima field ini dari form.
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

export default function CustomerCustomPaketBaru() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem("auth_token");
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "null"); } catch { return null; }
  })();

  const [categories, setCategories] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  const [formData, setFormData] = useState({
    id_kategori: searchParams.get("kategori") || "",
    tanggal_acara: "", lokasi_acara: "", jumlah_tamu: "", budget_acara: "", catatan: "", fasilitas: [],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestResult, setRequestResult] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (type, message) => setToast({ type, message });
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!token) {
      showToast('error', "Silakan login terlebih dahulu.");
      setTimeout(() => { navigate("/login"); }, 1200);
    }
  }, [token]);

  useEffect(() => {
    window.axios.get("/api/kategori").then(res => { if (res.data.status === "success") setCategories(res.data.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (formData.id_kategori) {
      setLoadingFacilities(true);
      window.axios.get(`/api/fasilitas?id_kategori=${formData.id_kategori}`)
        .then(res => { if (res.data.status === "success") setFacilities(res.data.data); })
        .catch(() => {})
        .finally(() => setLoadingFacilities(false));
    } else {
      setFacilities([]);
    }
  }, [formData.id_kategori]);

  const formatIDR = num => { if (!num) return "-"; return "Rp " + parseFloat(num).toLocaleString("id-ID", { maximumFractionDigits: 0 }); };
  const minEventDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const selectedKategoriNama = categories.find(c => c.id_kategori.toString() === formData.id_kategori)?.nama_kategori;

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, ...(name === 'id_kategori' ? { fasilitas: [] } : {}) }));
    setFieldErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev));
  };

  const handleFieldBlur = e => {
    const { name, value } = e.target;
    if (!String(value).trim()) setFieldErrors(prev => ({ ...prev, [name]: 'Field ini wajib diisi.' }));
  };

  const handleFacilityToggle = facilityId => setFormData(prev => {
    const exists = prev.fasilitas.find(f => f.id_fasilitas === facilityId);
    if (exists) return { ...prev, fasilitas: prev.fasilitas.filter(f => f.id_fasilitas !== facilityId) };
    return { ...prev, fasilitas: [...prev.fasilitas, { id_fasilitas: facilityId, keterangan: "" }] };
  });

  const handleFacilityDescChange = (facilityId, value) => setFormData(prev => ({
    ...prev, fasilitas: prev.fasilitas.map(f => f.id_fasilitas === facilityId ? { ...f, keterangan: value } : f),
  }));

  const handleSubmit = e => {
    e.preventDefault();
    const errors = {};
    if (!formData.id_kategori) errors.id_kategori = "Kategori event harus dipilih.";
    if (!formData.tanggal_acara) errors.tanggal_acara = "Tanggal acara harus ditentukan.";
    else if (new Date(formData.tanggal_acara) <= new Date()) errors.tanggal_acara = "Tanggal acara harus di masa mendatang.";
    if (!formData.lokasi_acara.trim()) errors.lokasi_acara = "Lokasi acara harus diisi.";
    if (!formData.jumlah_tamu || parseInt(formData.jumlah_tamu) < 1) errors.jumlah_tamu = "Jumlah tamu minimal 1 orang.";
    setFieldErrors(errors);

    if (formData.fasilitas.length === 0) { setRequestError("Pilih minimal 1 fasilitas."); return; }
    if (Object.keys(errors).length > 0) return;

    setRequestError(""); setIsSubmitting(true);
    window.axios.post("/api/customer/request-custom", {
      id_kategori: parseInt(formData.id_kategori),
      tanggal_acara: formData.tanggal_acara,
      lokasi_acara: formData.lokasi_acara,
      jumlah_tamu: parseInt(formData.jumlah_tamu),
      budget_acara: formData.budget_acara ? parseFloat(formData.budget_acara) : null,
      catatan: formData.catatan,
      fasilitas: formData.fasilitas,
    })
      .then(res => { if (res.data.status === "success") setRequestResult(res.data.data); })
      .catch(err => setRequestError(err?.response?.data?.message || "Terjadi kesalahan."))
      .finally(() => setIsSubmitting(false));
  };

  if (!token) return null;

  return (
    <>
      {/* PAGE HERO */}
      <section style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8EA 50%, #FFFFFF 100%)", padding: "3rem 0 2rem", color: "var(--color-text-main)" }}>
        <div className="container">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: "1.5rem" }}>
            ← Kembali
          </button>
          <h1 className="section-title" style={{ color: "var(--color-text-main)" }}>
            {requestResult ? "Pengajuan Berhasil Dikirim!" : "Custom Paket"}
          </h1>
          {!requestResult && (
            <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
              Paket: {selectedKategoriNama || "Pilih kategori event di bawah"}
            </p>
          )}
        </div>
      </section>

      {/* FORM CONTENT */}
      <section style={{ paddingBottom: "5rem" }}>
        <div className="container" style={{ maxWidth: "760px" }}>
          {requestResult ? (
            <div className="success-step text-center">
              <div className="success-icon-wrapper"><svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></div>
              <h3>Pengajuan Berhasil Dikirim!</h3>
              <p>Custom paket Anda telah masuk ke sistem. Tim kami akan segera meninjau dan memberikan penawaran resmi.</p>
              <div className="success-actions">
                <button className="btn btn-primary" onClick={() => navigate("/status")}>Pantau Status Pemesanan</button>
                <Link to="/katalog" className="btn btn-outline">Kembali ke Katalog</Link>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit}>
              {requestError && <div className="error-alert">{requestError}</div>}

              <div className="form-group">
                <label className="required-label">Kategori Event</label>
                <select className={`form-control ${fieldErrors.id_kategori ? 'is-invalid' : ''}`} style={fieldErrors.id_kategori ? {borderColor: '#dc3545', backgroundColor: '#fff8f8'} : {}} name="id_kategori" value={formData.id_kategori} onChange={handleInputChange} onBlur={handleFieldBlur}>
                  <option value="">-- Pilih Kategori Event --</option>
                  {categories.map(cat => (<option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>))}
                </select>
                {fieldErrors.id_kategori && <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{fieldErrors.id_kategori}</span>}
              </div>

              <div className="form-group">
                <label>Budget Acara (Rp)</label>
                <input type="number" className="form-control" name="budget_acara" placeholder="Masukkan estimasi budget, contoh: 50000000" value={formData.budget_acara} onChange={handleInputChange} min="0" />
                <span className="input-tip">Kosongkan jika ingin dihitung otomatis oleh tim kami.</span>
              </div>

              {/* Dua kolom: Pilih Fasilitas | Fasilitas Dipilih */}
              <div className="form-grid-2" style={{ alignItems: "start", marginTop: "1.5rem" }}>
                <div>
                  <h4 className="facilities-title">Pilih Fasilitas</h4>
                  {!formData.id_kategori ? (
                    <div className="no-facilities-notice"><p>Pilih kategori event terlebih dahulu untuk melihat daftar fasilitas.</p></div>
                  ) : loadingFacilities ? (
                    <div className="loading-facilities-spinner"><div className="spinner" /><p>Mengambil fasilitas...</p></div>
                  ) : facilities.length === 0 ? (
                    <div className="no-facilities-notice"><p>Tidak ada fasilitas standar untuk kategori ini. Tulis kebutuhan Anda pada kolom catatan.</p></div>
                  ) : (
                    <div className="facilities-checklist-container">
                      {facilities.map(fac => {
                        const isChecked = !!formData.fasilitas.find(f => f.id_fasilitas === fac.id_fasilitas);
                        const currentFacObj = formData.fasilitas.find(f => f.id_fasilitas === fac.id_fasilitas);
                        return (
                          <div key={fac.id_fasilitas} className={`facility-checklist-item ${isChecked ? "selected" : ""}`}>
                            <div className="checkbox-row" onClick={() => handleFacilityToggle(fac.id_fasilitas)}>
                              <div className={`custom-checkbox ${isChecked ? "checked" : ""}`}>{isChecked && (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>)}</div>
                              <div className="facility-label-desc"><span className="facility-name">{fac.nama_fasilitas}</span>{fac.deskripsi && <span className="facility-desc">{fac.deskripsi}</span>}</div>
                            </div>
                            {isChecked && (
                              <div className="facility-input-detail">
                                <input type="text" className="form-control form-control-sm" placeholder="Detail permintaan khusus (opsional)..." value={currentFacObj?.keterangan || ""} onChange={e => handleFacilityDescChange(fac.id_fasilitas, e.target.value)} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="facilities-title">Fasilitas Dipilih</h4>
                  {formData.fasilitas.length === 0 ? (
                    <div className="no-facilities-notice"><p>Belum ada fasilitas yang dipilih.</p></div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {formData.fasilitas.map(f => {
                        const fac = facilities.find(x => x.id_fasilitas === f.id_fasilitas);
                        return (
                          <span key={f.id_fasilitas} className="package-facility-chip" style={{ position: "static" }}>
                            {fac?.nama_fasilitas || `Fasilitas #${f.id_fasilitas}`}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Data Acara */}
              <h4 className="facilities-title" style={{ marginTop: "2rem" }}>Data Acara</h4>
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
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="required-label">Tanggal Acara</label>
                  <input type="date" className={`form-control ${fieldErrors.tanggal_acara ? 'is-invalid' : ''}`} style={fieldErrors.tanggal_acara ? {borderColor: '#dc3545', backgroundColor: '#fff8f8'} : {}} name="tanggal_acara" value={formData.tanggal_acara} onChange={handleInputChange} onBlur={handleFieldBlur} min={minEventDate} />
                  {fieldErrors.tanggal_acara && <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{fieldErrors.tanggal_acara}</span>}
                </div>
                <div className="form-group">
                  <label className="required-label">Jumlah Tamu (Pax)</label>
                  <input type="number" className={`form-control ${fieldErrors.jumlah_tamu ? 'is-invalid' : ''}`} style={fieldErrors.jumlah_tamu ? {borderColor: '#dc3545', backgroundColor: '#fff8f8'} : {}} name="jumlah_tamu" placeholder="Contoh: 250" value={formData.jumlah_tamu} onChange={handleInputChange} onBlur={handleFieldBlur} min="1" />
                  {fieldErrors.jumlah_tamu && <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{fieldErrors.jumlah_tamu}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="required-label">Lokasi Acara</label>
                <input type="text" className={`form-control ${fieldErrors.lokasi_acara ? 'is-invalid' : ''}`} style={fieldErrors.lokasi_acara ? {borderColor: '#dc3545', backgroundColor: '#fff8f8'} : {}} name="lokasi_acara" placeholder="Contoh: Ballroom Hotel Grand, Mampang" value={formData.lokasi_acara} onChange={handleInputChange} onBlur={handleFieldBlur} />
                {fieldErrors.lokasi_acara && <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{fieldErrors.lokasi_acara}</span>}
              </div>
              <div className="form-group"><label>Catatan</label><textarea className="form-control" name="catatan" rows="4" placeholder="Instruksi khusus, tema warna, layout, dll..." value={formData.catatan} onChange={handleInputChange} /></div>

              <div className="modal-footer-actions" style={{ borderTop: "none", paddingTop: 0, marginTop: "1.5rem" }}>
                <Link to="/katalog" className="btn btn-outline">Kembali</Link>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Mengirim..." : "Kirim Request"}</button>
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
