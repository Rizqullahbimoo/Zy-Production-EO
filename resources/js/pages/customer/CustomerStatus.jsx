/**
 * CustomerStatus.jsx — Halaman /status customer.
 * Berisi: Tab paket bawaan & tab custom paket, dengan integrasi bayar via Midtrans.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MouStatusCard from "../../components/customer/MouStatusCard";

/* ── Midtrans Snap Loader ──────────────────────────────────────────── */
function loadSnapScript() {
  return new Promise((resolve, reject) => {
    if (window.snap) { resolve(window.snap); return; }
    const script = document.createElement("script");
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true";
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "");
    script.onload = () => resolve(window.snap);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function CustomerStatus() {
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  /* ── Tabs ── */
  const [activeTab, setActiveTab] = useState("paket"); // "paket" | "custom"

  /* ── Tab: Paket Bawaan ── */
  const [myPemesanan, setMyPemesanan] = useState([]);
  const [loadingPemesanan, setLoadingPemesanan] = useState(false);
  const [selectedPemesanan, setSelectedPemesanan] = useState(null);
  const [isPayingPemesanan, setIsPayingPemesanan] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  /* ── Tab: Custom ── */
  const [myRequests, setMyRequests] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isPayingCustom, setIsPayingCustom] = useState(false);

  /* ── TC-20: Modal Konfirmasi Approve Penawaran ── */
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [pendingApproveOffer, setPendingApproveOffer] = useState(null);
  const [isApprovingOffer, setIsApprovingOffer] = useState(false);

  /* ── TC-21: Modal Form Revisi Penawaran ── */
  const [showRevisiModal, setShowRevisiModal] = useState(false);
  const [pendingRevisiOffer, setPendingRevisiOffer] = useState(null);
  const [catatanRevisi, setCatatanRevisi] = useState('');
  const [isSubmittingRevisi, setIsSubmittingRevisi] = useState(false);
  const [revisiError, setRevisiError] = useState('');

  /* ── Tab: Pesan Masuk ── */
  const [myPesan, setMyPesan] = useState([]);
  const [loadingPesan, setLoadingPesan] = useState(false);
  const [selectedPesan, setSelectedPesan] = useState(null);

  /* ── Ulasan Modal ── */
  const [showUlasanModal, setShowUlasanModal] = useState(false);
  const [ulasanData, setUlasanData] = useState({ id_pemesanan: null, id_request: null, rating: 5, komentar: '' });
  const [isSubmittingUlasan, setIsSubmittingUlasan] = useState(false);

  /* ── Toast notification (pengganti alert() bawaan browser) ── */
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }
  const showToast = (type, message) => setToast({ type, message });
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const formatIDR = num => { if (!num) return "-"; return "Rp " + parseFloat(num).toLocaleString("id-ID", { maximumFractionDigits: 0 }); };
  const formatDateIndo = dateStr => { if (!dateStr) return "-"; const d = new Date(dateStr); const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]; return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`; };

  const getStatusBadge = status => {
    switch (status) {
      case "menunggu": return "badge-warning";
      case "dikonfirmasi":
      case "diterima": return "badge-success";
      case "ditawarkan": return "badge-info";
      case "dibatalkan":
      case "ditolak": return "badge-danger";
      case "selesai": return "badge-primary";
      default: return "badge-secondary";
    }
  };
  const getStatusLabel = status => {
    const m = { menunggu: "⏳ Menunggu Review", dikonfirmasi: "✅ Dikonfirmasi", diterima: "✅ Diterima Client", ditawarkan: "💼 Ada Penawaran", dibatalkan: "❌ Dibatalkan", ditolak: "❌ Ditolak", selesai: "🎉 Selesai" };
    return m[status] || status;
  };

  const getPaymentBadge = ps => {
    switch (ps) {
      case "paid": return "badge-paid";
      case "dp_paid":
      case "pending": return "badge-warning";
      case "failed":
      case "expired": return "badge-danger";
      default: return "badge-unpaid";
    }
  };
  const getPaymentLabel = ps => {
    const m = { unpaid: "Belum Dibayar", pending: "Pembayaran Menunggu", dp_paid: "🟡 DP Lunas — Menunggu Pelunasan", paid: "✅ Lunas", failed: "❌ Gagal", expired: "⏰ Kadaluwarsa", refund: "↩ Refund" };
    return m[ps] || ps;
  };

  const fetchPemesanan = () => {
    if (!token) return;
    setLoadingPemesanan(true);
    window.axios.get("/api/customer/pemesanan")
      .then(res => {
        if (res.data.status === "success") {
          setMyPemesanan(res.data.data);
          setSelectedPemesanan(prev => {
            if (prev) {
              const updated = res.data.data.find(p => p.id_pemesanan === prev.id_pemesanan);
              return updated || prev;
            }
            return res.data.data.length > 0 ? res.data.data[0] : null;
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPemesanan(false));
  };

  const fetchMyRequests = () => {
    if (!token) return;
    setLoadingStatus(true);
    window.axios.get("/api/customer/request-custom")
      .then(res => {
        if (res.data.status === "success") {
          setMyRequests(res.data.data);
          setSelectedRequest(prev => {
            if (prev) {
              const updated = res.data.data.find(r => r.id_request === prev.id_request);
              return updated || prev;
            }
            return res.data.data.length > 0 ? res.data.data[0] : null;
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false));
  };

  const fetchMyPesan = () => {
    if (!token) return;
    setLoadingPesan(true);
    window.axios.get("/api/customer/pesan")
      .then(res => {
        if (res.data.status === "success") {
          setMyPesan(res.data.data);
          setSelectedPesan(prev => {
            if (prev) {
              const updated = res.data.data.find(r => r.id === prev.id);
              return updated || prev;
            }
            return res.data.data.length > 0 ? res.data.data[0] : null;
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPesan(false));
  };

  useEffect(() => {
    fetchPemesanan();
    fetchMyRequests();
    fetchMyPesan();
    loadSnapScript().catch(() => {});
  }, []);

  /* ── Pay for Paket Bawaan ── */
  const handlePayPemesanan = async (pemesanan) => {
    setIsPayingPemesanan(true);
    try {
      const snap = await loadSnapScript();
      const res = await window.axios.post(`/api/customer/payment/token-paket/${pemesanan.id_pemesanan}`);
      if (res.data.status === "success") {
        snap.pay(res.data.snap_token, {
          onSuccess: async (result) => {
            await window.axios.post(`/api/customer/payment/sync/${result.order_id}`);
            fetchPemesanan();
          },
          onPending: () => { showToast('success', "Pembayaran tertunda. Status akan diperbarui otomatis."); fetchPemesanan(); },
          onError: () => { showToast('error', "Pembayaran gagal. Silakan coba lagi."); },
          onClose: () => {},
        });
      }
    } catch (err) { showToast('error', "Gagal membuka pembayaran: " + (err?.response?.data?.message || err.message)); }
    finally { setIsPayingPemesanan(false); }
  };

  /* ── Pay for Custom Penawaran ── */
  const handlePayCustom = async (penawaran) => {
    setIsPayingCustom(true);
    try {
      const snap = await loadSnapScript();
      const res = await window.axios.post(`/api/customer/payment/token-custom/${penawaran.id_penawaran}`);
      if (res.data.status === "success") {
        snap.pay(res.data.snap_token, {
          onSuccess: async (result) => {
            await window.axios.post(`/api/customer/payment/sync/${result.order_id}`);
            fetchMyRequests();
          },
          onPending: () => { showToast('success', "Pembayaran tertunda. Status akan diperbarui otomatis."); fetchMyRequests(); },
          onError: () => { showToast('error', "Pembayaran gagal. Silakan coba lagi."); },
          onClose: () => {},
        });
      }
    } catch (err) { showToast('error', "Gagal membuka pembayaran: " + (err?.response?.data?.message || err.message)); }
    finally { setIsPayingCustom(false); }
  };

  /* ── Sinkronisasi Status Pembayaran Manual (fallback localhost) ── */
  const handleSyncStatus = async (orderId, afterSync) => {
    if (!orderId) { showToast('error', 'Order ID tidak ditemukan. Coba refresh halaman.'); return; }
    setIsSyncing(true);
    try {
      await window.axios.post(`/api/customer/payment/sync/${orderId}`);
      showToast('success', 'Status pembayaran berhasil disinkronisasi.');
      afterSync();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal sinkronisasi status.');
    } finally {
      setIsSyncing(false);
    }
  };

  /* ── TC-20: Approve Penawaran ── */
  const handleApproveOffer = (offer) => {
    setPendingApproveOffer(offer);
    setShowApproveModal(true);
  };

  const confirmApproveOffer = () => {
    if (!pendingApproveOffer) return;
    setIsApprovingOffer(true);
    window.axios.post(`/api/customer/penawaran/${pendingApproveOffer.id_penawaran}/approve`)
      .then(res => {
        if (res.data.status === 'success') {
          showToast('success', 'Penawaran berhasil disetujui! Admin akan segera menghubungi Anda.');
          setShowApproveModal(false);
          setPendingApproveOffer(null);
          fetchMyRequests();
        }
      })
      .catch(err => {
        showToast('error', err.response?.data?.message || 'Gagal menyetujui penawaran.');
        setShowApproveModal(false);
      })
      .finally(() => setIsApprovingOffer(false));
  };

  /* ── TC-21: Ajukan Revisi Penawaran ── */
  const handleRevisiOffer = (offer) => {
    setPendingRevisiOffer(offer);
    setCatatanRevisi('');
    setRevisiError('');
    setShowRevisiModal(true);
  };

  const confirmRevisiOffer = () => {
    if (!catatanRevisi.trim()) {
      setRevisiError('Catatan revisi wajib diisi.');
      return;
    }
    setIsSubmittingRevisi(true);
    window.axios.post(`/api/customer/penawaran/${pendingRevisiOffer.id_penawaran}/revisi`, {
      catatan_revisi: catatanRevisi,
    })
      .then(res => {
        if (res.data.status === 'success') {
          showToast('success', 'Permintaan revisi berhasil dikirim ke admin.');
          setShowRevisiModal(false);
          setPendingRevisiOffer(null);
          setCatatanRevisi('');
          fetchMyRequests();
        }
      })
      .catch(err => {
        showToast('error', err.response?.data?.message || 'Gagal mengirim permintaan revisi.');
        setShowRevisiModal(false);
      })
      .finally(() => setIsSubmittingRevisi(false));
  };

  const handleDownloadInvoice = (type, id) => {
    const endpoint = `/api/customer/${type === 'paket' ? `pemesanan/${id}` : `request-custom/${id}`}/invoice`;
    window.axios.get(endpoint, { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice_ZY_Production_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(async err => {
        // TC-56: Response error dalam bentuk blob — perlu di-parse dulu ke JSON
        if (err.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const json = JSON.parse(text);
            showToast('error', json.message || 'Gagal mengunduh invoice.');
          } catch {
            showToast('error', 'Gagal mengunduh invoice PDF.');
          }
        } else {
          showToast('error', err.response?.data?.message || 'Gagal mengunduh invoice PDF.');
        }
      });
  };

  const handleSubmitUlasan = (e) => {
    e.preventDefault();
    setIsSubmittingUlasan(true);
    window.axios.post('/api/customer/ulasan', ulasanData)
      .then(res => {
        if (res.data.status === 'success') {
          showToast('success', 'Ulasan berhasil dikirim! Terima kasih atas penilaian Anda.');
          setShowUlasanModal(false);
          setUlasanData({ id_pemesanan: null, id_request: null, rating: 5, komentar: '' });
          fetchPemesanan();
          fetchMyRequests();
        }
      })
      .catch(err => showToast('error', err.response?.data?.message || 'Gagal mengirim ulasan'))
      .finally(() => setIsSubmittingUlasan(false));
  };

  if (!token) {
    return (
      <>
        <section style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8EA 50%, #FFFFFF 100%)", padding: "5rem 0 3rem", textAlign: "center", color: "var(--color-text-main)" }}>
          <div className="container"><span className="section-tag">Status Pemesanan</span><h1 className="section-title" style={{ color: "var(--color-text-main)", marginTop: "1rem" }}>Lacak <span className="text-gradient">Status Pengajuan</span> Anda</h1></div>
        </section>
        <section style={{ padding: "6rem 0", textAlign: "center" }}>
          <div className="container">
            <div style={{ maxWidth: "480px", margin: "0 auto", background: "var(--color-bg-card, #FFFFFF)", border: "1px solid var(--color-border, #E7E7E7)", borderRadius: "20px", padding: "3rem 2rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🔒</div>
              <h3 style={{ color: "var(--color-text-main)", marginBottom: "1rem" }}>Login Diperlukan</h3>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", lineHeight: 1.7 }}>Untuk melihat dan melacak status pemesanan Anda, silakan login terlebih dahulu ke akun ZY Production Anda.</p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <a href="/login" className="btn btn-primary">Login Sekarang</a>
                <a href="/register" className="btn btn-outline">Daftar Akun</a>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* PAGE HERO */}
      <section style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8EA 50%, #FFFFFF 100%)", padding: "5rem 0 3rem", textAlign: "center", color: "var(--color-text-main)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(226,154,0,0.08) 0%, transparent 70%)" }} />
        <div className="container" style={{ position: "relative" }}>
          <span className="section-tag">Status Pemesanan</span>
          <h1 className="section-title" style={{ color: "var(--color-text-main)", marginTop: "1rem" }}>Lacak <span className="text-gradient">Status Pemesanan</span> Anda</h1>
          <p className="section-subtitle" style={{ maxWidth: "600px", margin: "1.5rem auto 0", opacity: 0.75 }}>Pantau perkembangan setiap paket bawaan maupun request custom yang telah Anda ajukan secara real-time.</p>
        </div>
      </section>

      {/* STATUS CONTENT */}
      <section style={{ padding: "3rem 0" }}>
        <div className="container">

          {/* Tab Bar + Refresh */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", gap: "1rem", flexWrap: "wrap" }}>
            <div className="status-tabs-bar" style={{ flex: "1", maxWidth: "600px" }}>
              <button className={`status-tab-btn ${activeTab === "paket" ? "active" : ""}`} onClick={() => setActiveTab("paket")}>
                📦 Paket Bawaan {myPemesanan.length > 0 && `(${myPemesanan.length})`}
              </button>
              <button className={`status-tab-btn ${activeTab === "custom" ? "active" : ""}`} onClick={() => setActiveTab("custom")}>
                ✨ Custom Paket {myRequests.length > 0 && `(${myRequests.length})`}
              </button>
              <button className={`status-tab-btn ${activeTab === "pesan" ? "active" : ""}`} onClick={() => setActiveTab("pesan")}>
                📩 Pesan Masuk {myPesan.length > 0 && `(${myPesan.length})`}
              </button>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => { fetchPemesanan(); fetchMyRequests(); fetchMyPesan(); }} disabled={loadingPemesanan || loadingStatus || loadingPesan}>
              {(loadingPemesanan || loadingStatus || loadingPesan) ? "Memuat..." : "↻ Refresh"}
            </button>
          </div>

          {/* ═══════════════════════════════════════════
              TAB: PAKET BAWAAN
          ═══════════════════════════════════════════ */}
          {activeTab === "paket" && (
            <>
              {loadingPemesanan && myPemesanan.length === 0 ? (
                <div className="status-loading"><div className="spinner" /><p>Mengambil data pemesanan Anda...</p></div>
              ) : myPemesanan.length === 0 ? (
                <div className="no-status-notice text-center">
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <h4>Belum Ada Pemesanan Paket</h4>
                  <p>Anda belum memesan paket bawaan apapun. Pilih paket favorit Anda di katalog sekarang!</p>
                  <Link to="/katalog" className="btn btn-primary">Lihat Katalog Paket</Link>
                </div>
              ) : (
                <div className="status-layout-grid">
                  {/* Left: List */}
                  <div className="status-sidebar-list">
                    <h4 className="list-title">Pemesanan Anda</h4>
                    <div className="status-cards-scroll">
                      {myPemesanan.map(p => (
                        <div key={p.id_pemesanan} className={`pemesanan-item-card ${selectedPemesanan?.id_pemesanan === p.id_pemesanan ? "active" : ""}`} onClick={() => setSelectedPemesanan(p)}>
                          <div className="status-item-header">
                            <span className="req-code" style={{ fontSize: "0.7rem" }}>{p.kode_pemesanan}</span>
                            <span className={`status-badge ${getStatusBadge(p.status_pemesanan)}`}>{p.status_pemesanan.toUpperCase()}</span>
                          </div>
                          <h4 className="req-category">{p.paket_layanan?.nama_paket || "Paket Layanan"}</h4>
                          <p className="req-date">📅 {formatDateIndo(p.tanggal_acara)}</p>
                          <div className="payment-status-row">
                            <span className="payment-status-label">Pembayaran:</span>
                            <span className={`status-badge ${getPaymentBadge(p.payment_status)}`} style={{ fontSize: "10px" }}>
                              {getPaymentLabel(p.payment_status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Detail */}
                  <div className="status-detail-pane">
                    {selectedPemesanan ? (
                      <div className="detail-pane-content">
                        <div className="detail-pane-header">
                          <div>
                            <h3>{selectedPemesanan.paket_layanan?.nama_paket}</h3>
                            <p className="submit-timestamp">Kode: <strong style={{ color: "var(--color-primary)", letterSpacing: "1px" }}>{selectedPemesanan.kode_pemesanan}</strong></p>
                          </div>
                          <span className={`status-badge-lg ${getStatusBadge(selectedPemesanan.status_pemesanan)}`}>{getStatusLabel(selectedPemesanan.status_pemesanan)}</span>
                        </div>

                        <div className="detail-info-block">
                          <h4>Informasi Pemesanan</h4>
                          <div className="detail-info-grid">
                            <div className="info-cell"><span className="cell-lbl">Tanggal Acara</span><span className="cell-val">{formatDateIndo(selectedPemesanan.tanggal_acara)}</span></div>
                            <div className="info-cell"><span className="cell-lbl">Lokasi</span><span className="cell-val">{selectedPemesanan.lokasi_acara}</span></div>
                            <div className="info-cell"><span className="cell-lbl">Jumlah Tamu</span><span className="cell-val">{selectedPemesanan.jumlah_tamu ?? "-"} Pax</span></div>
                            <div className="info-cell"><span className="cell-lbl">Harga Paket</span><span className="cell-val" style={{ color: "var(--color-primary)", fontWeight: 800 }}>{formatIDR(selectedPemesanan.paket_layanan?.harga)}</span></div>
                          </div>
                        </div>

                        {selectedPemesanan.catatan && (
                          <div className="detail-notes-block"><h4>Catatan</h4><p className="notes-text">{selectedPemesanan.catatan}</p></div>
                        )}

                        {/* MOU Status Section */}
                        {selectedPemesanan.status_pemesanan !== "dibatalkan" && (
                          <MouStatusCard mou={selectedPemesanan.dokumen_mou} tipe="pemesanan" id={selectedPemesanan.id_pemesanan} onUploaded={fetchPemesanan} />
                        )}

                        {/* Payment Section */}
                        <div className="detail-offers-block">
                          <h4>💳 Status Pembayaran</h4>
                          <div className="offer-box">
                            <div className="offer-price">
                              <span>Harga Total Paket</span>
                              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{formatIDR(selectedPemesanan.paket_layanan?.harga)}</h3>
                            </div>
                            <div className="offer-price" style={{ marginTop: '8px' }}>
                              <span style={{ color: 'var(--color-primary)' }}>💰 DP (Down Payment) yang Harus Dibayar</span>
                              <h3>{formatIDR(selectedPemesanan.dp_amount || (selectedPemesanan.paket_layanan?.harga ? selectedPemesanan.paket_layanan.harga * 0.3 : 0))}</h3>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '8px 0 0', fontStyle: 'italic' }}>* Sisa pelunasan dibayarkan sesuai ketentuan yang tercantum dalam dokumen MOU.</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: '12px' }}>
                              <span className={`status-badge-lg ${getPaymentBadge(selectedPemesanan.payment_status)}`}>
                                {getPaymentLabel(selectedPemesanan.payment_status)}
                              </span>
                              {(selectedPemesanan.payment_status === "unpaid" || selectedPemesanan.payment_status === "failed" || selectedPemesanan.payment_status === "expired" || !selectedPemesanan.payment_status) && selectedPemesanan.status_pemesanan !== "dibatalkan" && selectedPemesanan.dokumen_mou?.status_mou === "selesai" && (
                                <button
                                  className="btn-pay-midtrans"
                                  onClick={() => handlePayPemesanan(selectedPemesanan)}
                                  disabled={isPayingPemesanan}
                                >
                                  {isPayingPemesanan ? (<><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Membuka...</>) : (<><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> Bayar DP Sekarang</>)}
                                </button>
                              )}
                              {selectedPemesanan.payment_status === "pending" && selectedPemesanan.dokumen_mou?.status_mou === "selesai" && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <button className="btn-pay-midtrans" onClick={() => handlePayPemesanan(selectedPemesanan)} disabled={isPayingPemesanan}>
                                    {isPayingPemesanan ? "Membuka..." : "Lanjutkan Pembayaran DP"}
                                  </button>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleSyncStatus(selectedPemesanan.midtrans_order_id, fetchPemesanan)}
                                    disabled={isSyncing}
                                    title="Sinkronisasi status dari Midtrans"
                                  >
                                    {isSyncing ? '⏳ Memuat...' : '🔄 Cek Status Bayar'}
                                  </button>
                                </div>
                              )}
                            </div>
                            {(selectedPemesanan.payment_status === "unpaid" || selectedPemesanan.payment_status === "failed" || !selectedPemesanan.payment_status) && selectedPemesanan.status_pemesanan !== "dibatalkan" && selectedPemesanan.dokumen_mou?.status_mou !== "selesai" && (
                              <div className="mou-locked-notice">
                                🔒 Selesaikan proses tanda tangan dokumen MOU terlebih dahulu sebelum dapat membayar DP.
                              </div>
                            )}
                            {(selectedPemesanan.payment_status === "unpaid" || selectedPemesanan.payment_status === "failed" || !selectedPemesanan.payment_status) && (
                              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: '8px 0 0' }}>
                                Didukung: Transfer Bank, Kartu Kredit/Debit, GoPay, OVO, QRIS & lebih.
                              </p>
                            )}

                            {selectedPemesanan.payment_status === "paid" && (
                              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="btn btn-outline btn-sm" onClick={() => handleDownloadInvoice('paket', selectedPemesanan.id_pemesanan)}>
                                  📄 Unduh Invoice
                                </button>
                                {selectedPemesanan.status_pemesanan === "selesai" && !selectedPemesanan.ulasan && (
                                  <button className="btn btn-primary btn-sm" onClick={() => {
                                    setUlasanData({ id_pemesanan: selectedPemesanan.id_pemesanan, id_request: null, rating: 5, komentar: '' });
                                    setShowUlasanModal(true);
                                  }}>
                                    ⭐ Beri Ulasan
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="detail-pane-empty text-center">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <p>Pilih pemesanan di panel kiri untuk melihat detail & melanjutkan pembayaran.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════
              TAB: CUSTOM PAKET
          ═══════════════════════════════════════════ */}
          {activeTab === "custom" && (
            <>
              {loadingStatus && myRequests.length === 0 ? (
                <div className="status-loading"><div className="spinner" /><p>Mengambil data pengajuan Anda...</p></div>
              ) : myRequests.length === 0 ? (
                <div className="no-status-notice text-center">
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <h4>Belum Ada Pengajuan Custom</h4>
                  <p>Anda belum memiliki request custom paket yang sedang berjalan.</p>
                  <Link to="/katalog" className="btn btn-primary">Ajukan Custom Paket Sekarang</Link>
                </div>
              ) : (
                <div className="status-layout-grid">
                  {/* Left: List */}
                  <div className="status-sidebar-list">
                    <h4 className="list-title">Pengajuan Anda</h4>
                    <div className="status-cards-scroll">
                      {myRequests.map(req => (
                        <div key={req.id_request} className={`status-item-card ${selectedRequest?.id_request === req.id_request ? "active" : ""}`} onClick={() => setSelectedRequest(req)}>
                          <div className="status-item-header">
                            <span className="req-code">{req.kode_request}</span>
                            <span className={`status-badge ${getStatusBadge(req.status_request)}`}>{req.status_request.toUpperCase()}</span>
                          </div>
                          <h4 className="req-category">{req.kategori_event?.nama_kategori || "Event Custom"}</h4>
                          <p className="req-date">📅 {formatDateIndo(req.tanggal_acara)}</p>
                          <div className="req-footer"><span>📍 {req.lokasi_acara}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Detail */}
                  <div className="status-detail-pane">
                    {selectedRequest ? (
                      <div className="detail-pane-content">
                        <div className="detail-pane-header">
                          <div>
                            <h3>Request Custom {selectedRequest.kode_request}</h3>
                            <p className="submit-timestamp">Diajukan: {new Date(selectedRequest.tanggal_request || selectedRequest.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} WIB</p>
                          </div>
                          <span className={`status-badge-lg ${getStatusBadge(selectedRequest.status_request)}`}>{getStatusLabel(selectedRequest.status_request)}</span>
                        </div>

                        <div className="detail-info-block">
                          <h4>Informasi Dasar Acara</h4>
                          <div className="detail-info-grid">
                            <div className="info-cell"><span className="cell-lbl">Kategori</span><span className="cell-val">{selectedRequest.kategori_event?.nama_kategori}</span></div>
                            <div className="info-cell"><span className="cell-lbl">Tanggal Pelaksanaan</span><span className="cell-val">{formatDateIndo(selectedRequest.tanggal_acara)}</span></div>
                            <div className="info-cell"><span className="cell-lbl">Lokasi Acara</span><span className="cell-val">{selectedRequest.lokasi_acara}</span></div>
                            <div className="info-cell"><span className="cell-lbl">Jumlah Tamu</span><span className="cell-val">{selectedRequest.jumlah_tamu} Pax</span></div>
                            <div className="info-cell"><span className="cell-lbl">Budget Diajukan</span><span className="cell-val">{selectedRequest.budget_acara ? formatIDR(selectedRequest.budget_acara) : "Sesuai Penawaran"}</span></div>
                          </div>
                        </div>

                        {selectedRequest.catatan && (<div className="detail-notes-block"><h4>Catatan Tambahan</h4><p className="notes-text">{selectedRequest.catatan}</p></div>)}

                        {/* MOU Status Section */}
                        {selectedRequest.penawaran_custom && selectedRequest.penawaran_custom.length > 0 && selectedRequest.status_request !== "ditolak" && (
                          <MouStatusCard mou={selectedRequest.dokumen_mou} tipe="custom" id={selectedRequest.id_request} onUploaded={fetchMyRequests} />
                        )}

                        {/* Penawaran + Tombol Bayar */}
                        {selectedRequest.penawaran_custom && selectedRequest.penawaran_custom.length > 0 ? (
                          <div className="detail-offers-block">
                            <h4>👑 Penawaran Harga dari Admin</h4>
                            {selectedRequest.penawaran_custom.map(offer => (
                              <div key={offer.id_penawaran} className="offer-box">
                                <div className="offer-header">
                                  <span className="offer-tag">Tawaran Resmi</span>
                                  <span className="offer-date">Diajukan: {formatDateIndo(offer.created_at)}</span>
                                </div>
                                <div className="offer-price">
                                  <span>Total Anggaran Event</span>
                                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{formatIDR(offer.total_penawaran)}</h3>
                                </div>
                                <div className="offer-price" style={{ marginTop: '8px' }}>
                                  <span style={{ color: 'var(--color-primary)' }}>💰 DP (Down Payment) yang Harus Dibayar</span>
                                  <h3>{formatIDR(offer.dp_awal || (offer.total_penawaran ? offer.total_penawaran * 0.3 : 0))}</h3>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '8px 0 0', fontStyle: 'italic' }}>* Sisa pelunasan dibayarkan sesuai ketentuan yang tercantum dalam dokumen MOU.</p>
                                {offer.catatan_admin && (
                                  <div className="offer-desc"><strong>Catatan Admin:</strong><p>{offer.catatan_admin}</p></div>
                                )}
                                {offer.catatan_revisi_customer && (
                                  <div className="offer-desc" style={{ background: 'rgba(226,154,0,0.06)', border: '1px solid rgba(226,154,0,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '8px' }}>
                                    <strong style={{ color: 'var(--color-primary)' }}>📝 Catatan Revisi Anda:</strong>
                                    <p style={{ margin: '4px 0 0' }}>{offer.catatan_revisi_customer}</p>
                                  </div>
                                )}
                                <div className="offer-status-label">
                                  <span>Status Penawaran: </span>
                                  <strong>{offer.status_penawaran.toUpperCase()}</strong>
                                </div>

                                {/* TC-20 & TC-21: Tombol Setujui/Revisi — hanya muncul saat status 'menunggu' */}
                                {offer.status_penawaran === 'menunggu' && (
                                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                                    <button
                                      id={`btn-approve-offer-${offer.id_penawaran}`}
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleApproveOffer(offer)}
                                      style={{ flex: 1, minWidth: '140px' }}
                                    >
                                      ✅ Setujui Penawaran
                                    </button>
                                    <button
                                      id={`btn-revisi-offer-${offer.id_penawaran}`}
                                      className="btn btn-outline btn-sm"
                                      onClick={() => handleRevisiOffer(offer)}
                                      style={{ flex: 1, minWidth: '140px' }}
                                    >
                                      ✏️ Ajukan Revisi
                                    </button>
                                  </div>
                                )}

                                {/* Payment Status + Pay Button */}
                                {offer.payment_status && (
                                  <div className="payment-status-row" style={{ marginTop: "12px" }}>
                                    <span className="payment-status-label">Pembayaran DP:</span>
                                    <span className={`status-badge ${getPaymentBadge(offer.payment_status)}`}>{getPaymentLabel(offer.payment_status)}</span>
                                  </div>
                                )}

                                <div className="offer-actions-container" style={{ marginTop: "12px" }}>
                                  {(offer.payment_status === "unpaid" || offer.payment_status === "failed" || offer.payment_status === "expired" || !offer.payment_status) && offer.status_penawaran !== "ditolak" && selectedRequest.dokumen_mou?.status_mou === "selesai" ? (
                                    <button
                                      className="btn-pay-midtrans"
                                      onClick={() => handlePayCustom(offer)}
                                      disabled={isPayingCustom}
                                      style={{ width: "100%", justifyContent: "center" }}
                                    >
                                      {isPayingCustom ? (<><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Membuka Pembayaran...</>) : (<><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> Bayar DP Sekarang via Midtrans</>)}
                                    </button>
                                  ) : offer.payment_status === "pending" && selectedRequest.dokumen_mou?.status_mou === "selesai" ? (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                      <button className="btn-pay-midtrans" onClick={() => handlePayCustom(offer)} disabled={isPayingCustom} style={{ flex: 1, justifyContent: 'center' }}>Lanjutkan Pembayaran DP</button>
                                      <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleSyncStatus(offer.midtrans_order_id, fetchMyRequests)}
                                        disabled={isSyncing}
                                        title="Sinkronisasi status dari Midtrans"
                                      >
                                        {isSyncing ? '⏳ Memuat...' : '🔄 Cek Status Bayar'}
                                      </button>
                                    </div>
                                  ) : offer.status_penawaran !== "ditolak" && offer.payment_status !== "paid" && offer.payment_status !== "dp_paid" ? (
                                    <div className="mou-locked-notice">
                                      🔒 Selesaikan proses tanda tangan dokumen MOU terlebih dahulu sebelum dapat membayar DP.
                                    </div>
                                  ) : null}
                                  {(offer.payment_status === "dp_paid" || offer.payment_status === "paid") && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                      <button className="btn btn-outline btn-sm" onClick={() => handleDownloadInvoice('custom', offer.id_penawaran)}>
                                        📄 Unduh Invoice
                                      </button>
                                      {selectedRequest.status_request === "selesai" && !selectedRequest.ulasan && (
                                        <button className="btn btn-primary btn-sm" onClick={() => {
                                          setUlasanData({ id_pemesanan: null, id_request: selectedRequest.id_request, rating: 5, komentar: '' });
                                          setShowUlasanModal(true);
                                        }}>
                                          ⭐ Beri Ulasan
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  {offer.payment_status !== "paid" && offer.payment_status !== "dp_paid" && offer.status_penawaran !== 'menunggu' && (
                                    <p className="whatsapp-prompt" style={{ marginTop: "10px" }}>
                                      💡 Untuk negosiasi lebih lanjut, hubungi kami di WhatsApp <strong>+62 812-7777-427</strong> dengan kode <strong>{selectedRequest.kode_request}</strong>.
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          selectedRequest.status_request === "menunggu" && (
                            <div className="waiting-offer-notice">
                              <div><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 14 14" /></svg></div>
                              <div><h5>Menunggu Penawaran Admin</h5><p>Tim planner kami sedang meninjau spesifikasi fasilitas yang Anda pilih untuk menghitung biaya penawaran resmi.</p></div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="detail-pane-empty text-center">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <p>Pilih salah satu nomor pengajuan di panel kiri untuk melihat rincian dan penawaran harga.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════
              TAB: PESAN MASUK
          ═══════════════════════════════════════════ */}
          {activeTab === "pesan" && (
            <>
              {loadingPesan && myPesan.length === 0 ? (
                <div className="status-loading"><div className="spinner" /><p>Mengambil data pesan Anda...</p></div>
              ) : myPesan.length === 0 ? (
                <div className="no-status-notice text-center">
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <h4>Belum Ada Pesan</h4>
                  <p>Anda belum mengirimkan pesan atau pertanyaan apapun ke Admin.</p>
                  <Link to="/contact" className="btn btn-primary">Kirim Pesan Sekarang</Link>
                </div>
              ) : (
                <div className="status-layout-grid">
                  {/* Left: List */}
                  <div className="status-sidebar-list">
                    <h4 className="list-title">Riwayat Pesan</h4>
                    <div className="status-cards-scroll">
                      {myPesan.map(p => (
                        <div key={p.id} className={`pemesanan-item-card ${selectedPesan?.id === p.id ? "active" : ""}`} onClick={() => setSelectedPesan(p)}>
                          <div className="status-item-header">
                            <span className="req-code" style={{ fontSize: "0.75rem", textTransform: 'capitalize' }}>Pertanyaan</span>
                            <span className={`status-badge ${p.status === 'dibalas' ? 'badge-success' : 'badge-warning'}`}>
                              {p.status === 'dibalas' ? 'DIBALAS' : 'MENUNGGU'}
                            </span>
                          </div>
                          <p className="req-date">📅 {formatDateIndo(p.created_at)}</p>
                          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.pesan}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Detail */}
                  <div className="status-detail-pane">
                    {selectedPesan ? (
                      <div className="detail-content fade-in">
                        <div className="detail-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
                          <h2 className="detail-title">Detail Pesan</h2>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.9rem" }}>📅 Dikirim: {formatDateIndo(selectedPesan.created_at)}</p>
                            <span className={`status-badge ${selectedPesan.status === 'dibalas' ? 'badge-success' : 'badge-warning'}`}>
                              {selectedPesan.status === 'dibalas' ? 'Telah Dibalas' : 'Menunggu Balasan'}
                            </span>
                          </div>
                        </div>

                        <div className="detail-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                          {/* Chat Bubble: Customer */}
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface-2, #F8F9FA)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>Anda</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(selectedPesan.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <div style={{ background: "var(--color-surface-2, #F8F9FA)", padding: "1.25rem", borderRadius: "0 12px 12px 12px", border: "1px solid var(--color-border)", lineHeight: 1.6, color: 'var(--color-text-main)' }}>
                                {selectedPesan.pesan}
                              </div>
                            </div>
                          </div>

                          {/* Chat Bubble: Admin */}
                          {selectedPesan.status === 'dibalas' ? (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '1rem' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #e29a00 0%, #ffc107 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(226,154,0,0.3)' }}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1A1A1A" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <span style={{ fontWeight: '600', color: '#B27B00' }}>Admin ZY Production</span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(selectedPesan.updated_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div style={{ background: "rgba(226,154,0,0.06)", padding: "1.25rem", borderRadius: "0 12px 12px 12px", border: "1px solid rgba(226,154,0,0.25)", lineHeight: 1.6, color: 'var(--color-text-main)' }}>
                                  {selectedPesan.balasan_admin}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ marginTop: "1rem", textAlign: "center", padding: "2rem", background: "var(--color-surface-2, #F8F9FA)", borderRadius: "12px", border: "1px dashed var(--color-border)" }}>
                              <div style={{ marginBottom: "1rem", color: "var(--color-text-muted)" }}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 14 14" /></svg></div>
                              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Mohon kesediaannya menunggu. Tim Planner ZY Production akan segera merespons pertanyaan Anda.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="detail-pane-empty text-center">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <p>Pilih pesan di panel kiri untuk melihat isi pesan dan balasan dari admin.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick links */}
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>Ingin memesan atau mengajukan custom paket baru?</p>
            <Link to="/katalog" className="btn btn-outline">Kembali ke Katalog</Link>
          </div>
        </div>
      </section>

      {/* ── TC-20: Modal Konfirmasi Setujui Penawaran ── */}
      {showApproveModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '15px', width: '90%', maxWidth: '420px', border: '1px solid var(--color-border, #E7E7E7)', boxShadow: '0 20px 50px rgba(30,22,6,0.18)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
              <h3 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Setujui Penawaran?</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Dengan menyetujui, Anda menyatakan sepakat atas harga penawaran yang diajukan admin. Proses selanjutnya akan dilanjutkan ke tahap MOU dan pembayaran DP.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                id="btn-confirm-approve"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={confirmApproveOffer}
                disabled={isApprovingOffer}
              >
                {isApprovingOffer ? 'Memproses...' : 'Ya, Setujui'}
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => { setShowApproveModal(false); setPendingApproveOffer(null); }}
                disabled={isApprovingOffer}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TC-21: Modal Form Ajukan Revisi Penawaran ── */}
      {showRevisiModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '15px', width: '90%', maxWidth: '440px', border: '1px solid var(--color-border, #E7E7E7)', boxShadow: '0 20px 50px rgba(30,22,6,0.18)' }}>
            <h3 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>✏️ Ajukan Revisi</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
              Jelaskan bagian mana yang perlu direvisi. Admin akan meninjau dan mengajukan penawaran baru.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Catatan Revisi <span style={{ color: '#C92A2A' }}>*</span></label>
              <textarea
                id="input-catatan-revisi"
                className="form-control"
                rows="4"
                placeholder="Contoh: Mohon ditambahkan dekorasi tambahan dan sesuaikan DP menjadi 20%..."
                value={catatanRevisi}
                onChange={e => { setCatatanRevisi(e.target.value); if (revisiError) setRevisiError(''); }}
                style={{ width: '100%', padding: '0.8rem', background: '#F8F9FA', border: `1px solid ${revisiError ? '#C92A2A' : 'var(--color-border, #E7E7E7)'}`, color: 'var(--color-text-main)', borderRadius: '8px', resize: 'vertical', boxSizing: 'border-box' }}
              />
              {revisiError && (
                <p style={{ color: '#C92A2A', fontSize: '0.8rem', marginTop: '4px' }}>{revisiError}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                id="btn-confirm-revisi"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={confirmRevisiOffer}
                disabled={isSubmittingRevisi}
              >
                {isSubmittingRevisi ? 'Mengirim...' : 'Kirim Revisi'}
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => { setShowRevisiModal(false); setPendingRevisiOffer(null); setCatatanRevisi(''); setRevisiError(''); }}
                disabled={isSubmittingRevisi}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ulasan Modal */}
      {showUlasanModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
          <form onSubmit={handleSubmitUlasan} style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '15px', width: '90%', maxWidth: '400px', border: '1px solid var(--color-border, #E7E7E7)', boxShadow: '0 20px 50px rgba(30,22,6,0.18)' }}>
            <h3 style={{ color: 'var(--color-text-main)', marginBottom: '1.5rem', textAlign: 'center' }}>⭐ Beri Penilaian</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Rating (1-5)</label>
              <select
                className="form-control"
                value={ulasanData.rating}
                onChange={e => setUlasanData({...ulasanData, rating: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#F8F9FA', border: '1px solid var(--color-border, #E7E7E7)', color: 'var(--color-text-main)', borderRadius: '8px' }}
              >
                {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Bintang</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Komentar (Opsional)</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Ceritakan pengalaman Anda..."
                value={ulasanData.komentar}
                onChange={e => setUlasanData({...ulasanData, komentar: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#F8F9FA', border: '1px solid var(--color-border, #E7E7E7)', color: 'var(--color-text-main)', borderRadius: '8px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmittingUlasan}>
                {isSubmittingUlasan ? 'Menyimpan...' : 'Kirim Ulasan'}
              </button>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowUlasanModal(false)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast notification — pengganti alert() bawaan browser */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            minWidth: '280px',
            maxWidth: '420px',
            background: '#FFFFFF',
            border: `1px solid ${toast.type === 'success' ? 'rgba(226,154,0,0.35)' : '#FFC9C9'}`,
            borderLeft: `4px solid ${toast.type === 'success' ? 'var(--color-primary, #E29A00)' : '#C92A2A'}`,
            color: 'var(--color-text-main)',
            borderRadius: '10px',
            padding: '0.9rem 1.1rem',
            boxShadow: '0 20px 50px rgba(30,22,6,0.18)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1, padding: 0 }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
