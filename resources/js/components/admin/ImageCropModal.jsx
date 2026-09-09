import { useState, useEffect, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

/**
 * ImageCropModal — modal crop foto dengan rasio TERKUNCI, dipakai sebelum
 * file benar-benar dipilih untuk di-upload (mis. foto paket layanan).
 *
 * Alur pemakaian: parent membuka modal ini dengan `file` (File object hasil
 * <input type="file">) begitu user memilih gambar. Modal menampilkan
 * preview + kotak crop rasio tetap (default 16:10, sesuai tampilan kartu
 * paket di katalog customer — lihat .package-img-wrapper di home.css).
 * Saat user klik "Terapkan", hasil crop di-render ke <canvas>, dikompres
 * jadi JPEG, lalu dikembalikan ke parent sebagai File object baru lewat
 * onCropped — parent tinggal pakai File itu persis seperti file mentah
 * sebelumnya (tidak ada perubahan di alur upload/FormData/backend).
 *
 * Props:
 *  - file       : File — gambar sumber yang mau di-crop (wajib)
 *  - aspect     : number — rasio lebar/tinggi kotak crop (default 16/10)
 *  - outputMaxWidth : number — lebar maksimal hasil crop dalam piksel (default 1200)
 *  - onCropped  : (croppedFile: File) => void — dipanggil saat user konfirmasi
 *  - onCancel   : () => void — dipanggil saat user batal (modal ditutup tanpa hasil)
 */
export default function ImageCropModal({ file, aspect = 16 / 10, outputMaxWidth = 1200, onCropped, onCancel }) {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef(null);

  // Baca file jadi data URL untuk ditampilkan di <img> sumber crop.
  useEffect(() => {
    if (!file) { setImgSrc(''); return; }
    const reader = new FileReader();
    reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
    reader.readAsDataURL(file);
  }, [file]);

  // Begitu gambar sumber selesai dimuat, buat kotak crop awal yang sudah
  // di-center dan mengisi area sebesar mungkin sesuai rasio yang dikunci.
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  }, [aspect]);

  const handleTerapkan = () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropWidthPx = completedCrop.width * scaleX;
    const cropHeightPx = completedCrop.height * scaleY;

    // Batasi lebar output supaya file tidak kebesaran, tinggi menyesuaikan rasio.
    const outputWidth = Math.min(outputMaxWidth, cropWidthPx);
    const outputHeight = outputWidth / aspect;

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');

    // Latar putih dulu — jaga-jaga kalau sumbernya PNG transparan, supaya
    // hasil JPEG tidak jadi hitam di bagian transparan.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidthPx,
      cropHeightPx,
      0,
      0,
      outputWidth,
      outputHeight
    );

    canvas.toBlob((blob) => {
      setIsProcessing(false);
      if (!blob) return;
      const croppedFile = new File([blob], (file?.name || 'foto').replace(/\.[^.]+$/, '') + '.jpg', {
        type: 'image/jpeg',
      });
      onCropped(croppedFile);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="zy-modal-overlay" style={{ zIndex: 1050 }} onClick={onCancel}>
      <div className="zy-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="zy-modal-header">
          <h3>Atur Crop Foto</h3>
          <button type="button" className="zy-modal-close-btn" onClick={onCancel} aria-label="Batal">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="zy-modal-body">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 0, marginBottom: '1rem' }}>
            Geser dan ubah ukuran kotak untuk memilih bagian foto yang ditampilkan di kartu paket. Rasio sudah dikunci ({aspect === 16 / 10 ? '16:10' : aspect.toFixed(2)}) supaya sesuai tampilan katalog.
          </p>
          {imgSrc && (
            <div style={{ display: 'flex', justifyContent: 'center', background: '#00000010', borderRadius: '10px', padding: '0.5rem' }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                minWidth={80}
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '55vh' }} />
              </ReactCrop>
            </div>
          )}
        </div>
        <div className="zy-modal-footer">
          <button type="button" className="zy-btn-close" onClick={onCancel} disabled={isProcessing}>Batal</button>
          <button type="button" className="zy-btn-submit" onClick={handleTerapkan} disabled={isProcessing || !completedCrop}>
            {isProcessing ? 'Memproses...' : 'Terapkan'}
          </button>
        </div>
      </div>
    </div>
  );
}
