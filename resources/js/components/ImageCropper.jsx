/**
 * ImageCropper.jsx — Modal crop/reposisi foto reusable, dipakai di semua titik
 * upload foto tampilan (Foto Paket, Galeri Tambahan Paket, Galeri Portfolio,
 * Foto Profil Admin). Alur: terima File mentah → tampilkan UI crop (geser +
 * zoom) dengan overlay rasio target → saat dikonfirmasi, generate file gambar
 * baru hasil crop (canvas → Blob) lewat onCropped — file hasil crop inilah
 * yang dikirim ke backend, bukan file asli.
 *
 * Backend tidak perlu tahu apa-apa soal cropping — cuma menerima file gambar
 * final biasa, sama seperti sebelum ada fitur ini.
 */
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { CROP_ASPECT_LANDSCAPE } from '../utils/imageCropConfig';

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

async function getCroppedImageBlob(imageSrc, cropPixels, mimeType) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cropPixels.width);
  canvas.height = Math.round(cropPixels.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, cropPixels.width, cropPixels.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Gagal membuat gambar hasil crop.')); return; }
      resolve(blob);
    }, mimeType || 'image/jpeg', 0.92);
  });
}

/**
 * @param {File} file - file gambar mentah yang sudah lolos validasi (lihat imageCropConfig.js)
 * @param {number} aspect - rasio crop target, default landscape 3:2
 * @param {(croppedFile: File) => void} onCropped
 * @param {() => void} onCancel
 */
export default function ImageCropper({ file, aspect = CROP_ASPECT_LANDSCAPE, onCropped, onCancel }) {
  const [imageSrc] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsValue) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    setError('');
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, file.type);
      const croppedFile = new File([blob], file.name, { type: blob.type });
      URL.revokeObjectURL(imageSrc);
      onCropped(croppedFile);
    } catch (err) {
      console.error('Error cropping image:', err);
      setError('Gagal memproses hasil crop. Coba lagi.');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    URL.revokeObjectURL(imageSrc);
    onCancel();
  };

  return (
    <div className="zy-modal-overlay" style={{ zIndex: 10050 }} onClick={handleCancel}>
      {/* animation: 'none' — react-easy-crop mengukur ukuran container saat mount;
          animasi slideUp bawaan .zy-modal bikin ukurannya salah hitung
          (known issue react-easy-crop untuk cropper di dalam modal). */}
      <div className="zy-modal" style={{ maxWidth: '520px', animation: 'none' }} onClick={e => e.stopPropagation()}>
        <div className="zy-modal-header">
          <h3>Sesuaikan Foto</h3>
          <button type="button" className="zy-modal-close-btn" onClick={handleCancel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="zy-modal-body">
          <div style={{ position: 'relative', width: '100%', height: '320px', background: '#1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
            Geser & perbesar foto untuk mengatur area yang ditampilkan. Rasio sudah disesuaikan otomatis.
          </p>

          {error && <div style={{ marginTop: '0.75rem', color: '#C92A2A', fontSize: '0.85rem' }}>{error}</div>}
        </div>
        <div className="zy-modal-footer">
          <button type="button" className="zy-btn-close" onClick={handleCancel} disabled={isProcessing}>Batal</button>
          <button type="button" className="zy-btn-submit" onClick={handleConfirm} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing ? 'Memproses...' : 'Pakai Foto Ini'}
          </button>
        </div>
      </div>
    </div>
  );
}
