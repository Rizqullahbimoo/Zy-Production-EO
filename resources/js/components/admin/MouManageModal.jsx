/**
 * MouManageModal.jsx — Modal admin untuk mengelola proses Dokumen MOU.
 * Tampilan berubah sesuai status_mou: belum_ada, menunggu_ttd_customer, menunggu_ttd_admin, selesai.
 */
import { useState, useEffect } from "react";

const STATUS_BADGE = {
  belum_ada: "status-selesai-dicek",
  menunggu_ttd_customer: "status-menunggu-verifikasi",
  menunggu_ttd_admin: "status-menunggu-konfirmasi",
  selesai: "status-diproses",
};

const STATUS_LABEL = {
  belum_ada: "Belum Ada",
  menunggu_ttd_customer: "Menunggu TTD Customer",
  menunggu_ttd_admin: "Menunggu TTD Admin",
  selesai: "Selesai",
};

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (fileName) => {
  if (!fileName) return "📄";
  const ext = fileName.split(".").pop().toLowerCase();
  if (ext === "pdf") return "📕";
  if (["jpg", "jpeg", "png"].includes(ext)) return "🖼️";
  return "📄";
};

/** Styled drag-and-drop file upload zone — didefinisikan di luar komponen utama */
function FileDropzone({ inputId, file, onFileChange }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById(inputId).click()}
      style={{
        border: `2px dashed ${isDragging ? "var(--primary)" : file ? "#2f9e44" : "#ced4da"}`,
        borderRadius: "10px",
        padding: "1.5rem 1rem",
        textAlign: "center",
        cursor: "pointer",
        background: isDragging
          ? "rgba(226,154,0,0.06)"
          : file
          ? "rgba(47,158,68,0.05)"
          : "#f8f9fa",
        transition: "all 0.2s ease",
        marginBottom: "1rem",
        userSelect: "none",
      }}
    >
      <input
        id={inputId}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: "none" }}
        onChange={(e) => onFileChange(e.target.files[0] || null)}
      />

      {file ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "2rem" }}>{getFileIcon(file.name)}</span>
          <span style={{ fontWeight: 700, color: "#2f9e44", fontSize: "0.9rem", wordBreak: "break-all" }}>
            {file.name}
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {formatFileSize(file.size)}
          </span>
          <span
            style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "0.25rem", textDecoration: "underline" }}
            onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
          >
            Ganti file
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#adb5bd" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span style={{ fontWeight: 600, color: "var(--dark)", fontSize: "0.9rem" }}>
            {isDragging ? "Lepas file di sini…" : "Klik atau seret file ke sini"}
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            PDF, JPG, PNG — Maks 5MB
          </span>
        </div>
      )}
    </div>
  );
}

export default function MouManageModal({ tipe, id, idMou, onClose, onChanged, showToast }) {
  const [mou, setMou] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idMou) { setMou(null); return; }
    setIsLoading(true);
    window.axios.get(`/api/admin/mou/${idMou}`)
      .then((res) => { if (res.data.status === "success") setMou(res.data.data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [idMou]);

  const status = mou?.status_mou || "belum_ada";

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) setError("");
  };

  const handleUploadDraft = (e) => {
    e.preventDefault();
    if (!file) { setError("Pilih file draf terlebih dahulu."); return; }
    setError(""); setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    window.axios.post(`/api/admin/mou/draft/${tipe}/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => {
        if (res.data.status === "success") {
          setFile(null);
          setMou(res.data.data);
          showToast && showToast('success', 'Draf MOU berhasil diunggah! Customer sudah bisa mengunduh & menandatangani.');
          onChanged && onChanged();
        }
      })
      .catch((err) => setError(err?.response?.data?.message || "Gagal mengunggah draf MOU."))
      .finally(() => setIsSubmitting(false));
  };

  const handleUploadFinal = (e) => {
    e.preventDefault();
    if (!file) { setError("Pilih file dokumen final terlebih dahulu."); return; }
    setError(""); setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    window.axios.post(`/api/admin/mou/${mou.id_mou}/final`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => {
        if (res.data.status === "success") {
          setFile(null);
          setMou(res.data.data);
          showToast && showToast('success', 'Dokumen MOU final berhasil diunggah! Proses MOU selesai, customer sudah bisa melanjutkan pembayaran DP.');
          onChanged && onChanged();
        }
      })
      .catch((err) => setError(err?.response?.data?.message || "Gagal mengunggah dokumen final."))
      .finally(() => setIsSubmitting(false));
  };

  /** Buka file di tab baru — hindari React Router intercept */
  const openFile = (url, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="zy-modal-overlay" onClick={onClose}>
      <div className="zy-modal" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
        <div className="zy-modal-header">
          <h3>Kelola Dokumen MOU</h3>
          <button className="zy-modal-close-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="zy-modal-body">
          <div className="zy-modal-section">
            <span className={`zy-status-badge ${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>
          </div>

          {isLoading ? (
            <p style={{ textAlign: "center", padding: "1rem", color: "var(--text-muted)" }}>Memuat...</p>
          ) : (
            <>
              {/* Status: Belum Ada — upload draf */}
              {status === "belum_ada" && (
                <form onSubmit={handleUploadDraft} className="zy-modal-section">
                  <p style={{ marginBottom: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Unggah draf dokumen MOU yang sudah disiapkan sesuai kesepakatan dengan customer.
                  </p>
                  <FileDropzone
                    inputId="mou-draft-upload"
                    file={file}
                    onFileChange={handleFileChange}
                  />
                  {error && <p style={{ color: "#c92a2a", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>}
                  <button type="submit" className="zy-btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? "Mengunggah..." : "Unggah Draf MOU"}
                  </button>
                </form>
              )}

              {/* Status: Menunggu TTD Customer */}
              {status === "menunggu_ttd_customer" && (
                <div className="zy-modal-section">
                  <p style={{ color: "var(--text-muted)" }}>
                    ⏳ Menunggu customer mengunduh, menandatangani, dan mengunggah kembali dokumen MOU.
                  </p>
                  {mou.file_draft && (
                    <button
                      type="button"
                      className="zy-btn-detail"
                      style={{ display: "inline-block", marginTop: "0.5rem" }}
                      onClick={(e) => openFile(mou.file_draft, e)}
                    >
                      Lihat Draf yang Diunggah
                    </button>
                  )}
                </div>
              )}

              {/* Status: Menunggu TTD Admin — upload final */}
              {status === "menunggu_ttd_admin" && (
                <form onSubmit={handleUploadFinal} className="zy-modal-section">
                  <p style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    Customer telah mengunggah dokumen bertanda tangan. Periksa dokumen berikut, tandatangani secara manual, lalu unggah dokumen final.
                  </p>
                  {mou.file_ttd_customer && (
                    <button
                      type="button"
                      className="zy-btn-detail"
                      style={{ display: "inline-block", marginBottom: "1rem" }}
                      onClick={(e) => openFile(mou.file_ttd_customer, e)}
                    >
                      Lihat Dokumen dari Customer
                    </button>
                  )}
                  <FileDropzone
                    inputId="mou-final-upload"
                    file={file}
                    onFileChange={handleFileChange}
                  />
                  {error && <p style={{ color: "#c92a2a", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>}
                  <button type="submit" className="zy-btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? "Mengunggah..." : "Unggah Dokumen Final"}
                  </button>
                </form>
              )}

              {/* Status: Selesai */}
              {status === "selesai" && (
                <div className="zy-modal-section">
                  <p style={{ color: "#166534", fontWeight: 600 }}>
                    ✅ Proses MOU telah selesai. Customer sudah dapat melanjutkan pembayaran DP.
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    {mou.file_draft && (
                      <button type="button" className="zy-btn-detail" onClick={(e) => openFile(mou.file_draft, e)}>Draf</button>
                    )}
                    {mou.file_ttd_customer && (
                      <button type="button" className="zy-btn-detail" onClick={(e) => openFile(mou.file_ttd_customer, e)}>TTD Customer</button>
                    )}
                    {mou.file_final && (
                      <button type="button" className="zy-btn-detail" onClick={(e) => openFile(mou.file_final, e)}>Dokumen Final</button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="zy-modal-footer">
          <button type="button" className="zy-btn-close" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}
