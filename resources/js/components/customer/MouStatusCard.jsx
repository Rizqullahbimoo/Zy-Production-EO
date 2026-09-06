/**
 * MouStatusCard.jsx — Kartu status Dokumen MOU untuk halaman /status customer.
 * Menampilkan stepper 4 langkah, unduh draf, form upload TTD (dropzone), dan status akhir.
 */
import { useState } from "react";

const STATUS_STEPS = [
  { key: "belum_ada", label: "Draf MOU" },
  { key: "menunggu_ttd_customer", label: "TTD Anda" },
  { key: "menunggu_ttd_admin", label: "TTD Admin" },
  { key: "selesai", label: "Selesai" },
];

function stepIndex(status) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

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

/** Styled drag-and-drop dropzone — tema terang, konsisten dengan halaman customer */
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
        border: `2px dashed ${isDragging ? "#e29a00" : file ? "#16A34A" : "var(--color-border, #E7E7E7)"}`,
        borderRadius: "10px",
        padding: "1.25rem 1rem",
        textAlign: "center",
        cursor: "pointer",
        background: isDragging
          ? "rgba(226,154,0,0.07)"
          : file
          ? "rgba(22,163,74,0.06)"
          : "var(--color-surface-2, #F8F9FA)",
        transition: "all 0.2s ease",
        marginBottom: "12px",
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontSize: "1.75rem" }}>{getFileIcon(file.name)}</span>
          <span style={{ fontWeight: 700, color: "#16A34A", fontSize: "0.85rem", wordBreak: "break-all" }}>
            {file.name}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            {formatFileSize(file.size)}
          </span>
          <span
            style={{ fontSize: "0.73rem", color: "#e29a00", marginTop: "0.2rem", textDecoration: "underline" }}
            onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
          >
            Ganti file
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--color-text-muted, #666666)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span style={{ fontWeight: 600, color: "var(--color-text-main)", fontSize: "0.85rem" }}>
            {isDragging ? "Lepas file di sini…" : "Klik atau seret file ke sini"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
            PDF, JPG, PNG — Maks 5MB
          </span>
        </div>
      )}
    </div>
  );
}

export default function MouStatusCard({ mou, tipe, id, onUploaded, showToast }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Laravel mengirim relasi dalam snake_case maupun camelCase tergantung serialisasi
  // Normalkan: bisa datang sebagai objek mou langsung, atau null/undefined
  const status = mou?.status_mou || "belum_ada";
  const activeIdx = stepIndex(status);

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) setError("");
  };

  /** Path dari relasi mentah (dokumen_mou) belum di-prefix /storage/ — normalkan seperti pola foto galeri/profil di AdminDashboard */
  const resolveFileUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') || path.startsWith('/storage/') ? path : `/storage/${path}`;
  };

  /** Buka file di tab baru — hindari React Router intercept dengan window.open */
  const openFile = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = resolveFileUrl(path);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Pilih file dokumen yang sudah ditandatangani terlebih dahulu.");
      return;
    }
    setError("");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    window.axios
      .post(`/api/customer/mou/upload-ttd/${tipe}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.data.status === "success") {
          setFile(null);
          showToast && showToast('success', 'Dokumen berhasil diunggah! Admin akan segera memeriksa & menandatangani.');
          onUploaded && onUploaded();
        }
      })
      .catch((err) => setError(err?.response?.data?.message || "Gagal mengunggah dokumen."))
      .finally(() => setIsUploading(false));
  };

  return (
    <div className="detail-offers-block mou-status-card">
      <h4>📝 Status Dokumen MOU</h4>

      {/* Stepper */}
      <div className="mou-stepper">
        {STATUS_STEPS.map((s, i) => (
          <div key={s.key} className={`mou-step ${i <= activeIdx ? "done" : ""} ${i === activeIdx ? "current" : ""}`}>
            <span className="mou-step-dot">{i < activeIdx ? "✓" : i + 1}</span>
            <span className="mou-step-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="offer-box">
        {/* Belum Ada */}
        {status === "belum_ada" && (
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Admin belum menyiapkan dokumen MOU untuk pesanan ini. Anda akan mendapat notifikasi email begitu draf tersedia.
          </p>
        )}

        {/* Menunggu TTD Customer */}
        {status === "menunggu_ttd_customer" && (
          <div>
            <p style={{ margin: "0 0 12px", color: "var(--color-text-main)" }}>
              Draf dokumen MOU sudah tersedia. Unduh, cetak, tandatangani secara manual, lalu unggah kembali hasil scan/foto di bawah ini.
            </p>
            {mou?.file_draft && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginBottom: "14px", display: "inline-block" }}
                onClick={(e) => openFile(mou.file_draft, e)}
              >
                📄 Unduh Draf MOU
              </button>
            )}
            <form onSubmit={handleUpload}>
              <FileDropzone
                inputId="customer-mou-ttd-upload"
                file={file}
                onFileChange={handleFileChange}
              />
              {error && <p style={{ color: "#DC2626", fontSize: "0.8rem", margin: "0 0 10px" }}>{error}</p>}
              <button type="submit" className="btn-pay-midtrans" disabled={isUploading}>
                {isUploading ? "Mengunggah..." : "Unggah Dokumen Bertanda Tangan"}
              </button>
            </form>
          </div>
        )}

        {/* Menunggu TTD Admin */}
        {status === "menunggu_ttd_admin" && (
          <p style={{ margin: 0, color: "var(--color-text-main)" }}>
            ⏳ Dokumen Anda sudah diterima. Admin sedang memeriksa &amp; menandatangani dokumen. Anda akan mendapat notifikasi begitu proses selesai.
          </p>
        )}

        {/* Selesai */}
        {status === "selesai" && (
          <div>
            <p style={{ margin: "0 0 10px", color: "#16A34A", fontWeight: 600 }}>
              ✅ Dokumen MOU selesai — pembayaran DP kini tersedia.
            </p>
            {mou?.file_final && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={(e) => openFile(mou.file_final, e)}
              >
                📄 Lihat Dokumen MOU Final
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
